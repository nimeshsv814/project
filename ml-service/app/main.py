import os
from functools import lru_cache

import joblib
from fastapi import FastAPI
from pydantic import BaseModel, Field

from .rules import build_reasons, build_recommendations, risk_level_from_probability, summarize_incident

MODEL_PATH = os.getenv('MODEL_PATH', 'models/failure_predictor.joblib')

app = FastAPI(title='AI Deployment Failure Prediction Service', version='1.0.0')


class PredictionRequest(BaseModel):
    deployment_id: str
    service: str
    memory_change: float
    cpu_change: float
    commits: int
    helm_changes: int
    node_usage: float
    pod_restart: int
    latency: float
    previous_failures: int = 0
    incidents: int = 0
    files_changed: int = 0
    loc_changed: int = 0


class RecommendationRequest(BaseModel):
    deployment_id: str
    service: str
    riskLevel: str
    reasons: list[str] = Field(default_factory=list)


class IncidentSummaryRequest(BaseModel):
    deploymentId: str
    service: str
    severity: str
    rootCause: str
    remediationActions: list[str] = Field(default_factory=list)


@lru_cache(maxsize=1)
def load_bundle():
    if not os.path.exists(MODEL_PATH):
        return None
    try:
        return joblib.load(MODEL_PATH)
    except Exception:
        # Keep service available even when optional ML runtime deps are absent.
        return None


def model_features(payload: PredictionRequest):
    return [
        payload.memory_change,
        payload.cpu_change,
        payload.commits,
        payload.helm_changes,
        payload.node_usage,
        payload.pod_restart,
        payload.latency,
        payload.previous_failures,
        payload.incidents,
        payload.files_changed,
        payload.loc_changed,
    ]


def fallback_probability(payload: PredictionRequest) -> float:
    score = 0.0
    score += max(0.0, payload.memory_change) * 0.20
    score += max(0.0, payload.cpu_change) * 0.20
    score += min(payload.commits / 40.0, 1.0) * 12.0
    score += min(payload.helm_changes / 20.0, 1.0) * 10.0
    score += min(payload.node_usage / 100.0, 1.0) * 18.0
    score += min(payload.pod_restart / 10.0, 1.0) * 14.0
    score += min(payload.latency / 1000.0, 1.0) * 16.0
    score += min(payload.previous_failures / 10.0, 1.0) * 4.0
    score += min(payload.incidents / 10.0, 1.0) * 4.0
    score += min(payload.files_changed / 200.0, 1.0) * 1.0
    score += min(payload.loc_changed / 1000.0, 1.0) * 1.0
    return max(1.0, min(score, 99.0))


@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'ml-service'}


@app.post('/predict')
def predict(payload: PredictionRequest):
    bundle = load_bundle()
    if bundle and 'model' in bundle:
        model = bundle['model']
        probability = float(model.predict_proba([model_features(payload)])[0][1]) * 100.0
    else:
        probability = fallback_probability(payload)
    rounded_probability = round(probability, 2)

    reasons = build_reasons(payload)
    risk_level = risk_level_from_probability(rounded_probability)

    return {
        'failureProbability': rounded_probability,
        'riskLevel': risk_level,
        'reasons': reasons,
    }


@app.post('/recommend')
def recommend(payload: RecommendationRequest):
    return {'recommendations': build_recommendations(payload.riskLevel, payload.reasons)}


@app.post('/summarize-incident')
def summarize(payload: IncidentSummaryRequest):
    return {
        'summary': summarize_incident(
            service=payload.service,
            root_cause=payload.rootCause,
            severity=payload.severity,
            actions=payload.remediationActions,
        )
    }
