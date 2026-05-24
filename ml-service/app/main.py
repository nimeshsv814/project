import os
from functools import lru_cache

import joblib
import pandas as pd
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
        raise FileNotFoundError(
            f'Model bundle not found at {MODEL_PATH}. Run scripts/train_model.py first.'
        )
    return joblib.load(MODEL_PATH)


def to_dataframe(payload: PredictionRequest):
    return pd.DataFrame(
        [
            {
                'memory_change': payload.memory_change,
                'cpu_change': payload.cpu_change,
                'commits': payload.commits,
                'helm_changes': payload.helm_changes,
                'node_usage': payload.node_usage,
                'pod_restart': payload.pod_restart,
                'latency': payload.latency,
                'previous_failures': payload.previous_failures,
                'incidents': payload.incidents,
                'files_changed': payload.files_changed,
                'loc_changed': payload.loc_changed,
            }
        ]
    )


@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'ml-service'}


@app.post('/predict')
def predict(payload: PredictionRequest):
    bundle = load_bundle()
    model = bundle['model']

    df = to_dataframe(payload)
    probability = float(model.predict_proba(df)[0][1]) * 100.0
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
