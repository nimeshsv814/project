# AI Deployment Failure Prediction System

Production-grade microservice platform to predict Kubernetes deployment failures before production rollout, enforce risk-aware release gating, and automate remediation.

## Core Capabilities

- RBAC authentication with JWT (`Admin`, `DevOps Engineer`, `Viewer`)
- Deployment monitoring with Prometheus-backed metrics and MongoDB persistence
- AI failure risk prediction (FastAPI + XGBoost)
- Recommendation engine for safer rollout actions
- Deployment gatekeeper endpoint for CI/CD pipeline enforcement
- Auto-remediation API for rollback, restart, and scale actions
- Incident intelligence with AI-generated summaries
- React dashboard for observability and risk analytics
- Dockerized stack + Kubernetes manifests + Helm chart + Azure DevOps pipeline

## Monorepo Structure

```text
backend/                Node.js + Express API (MERN backend)
frontend/               React + Tailwind dashboard
ml-service/             FastAPI model service
k8s/base/               Kubernetes manifests
helm/                   Helm chart
azure-devops/           Azure DevOps pipeline and deployment metadata template
docs/                   Implementation and production guides
docker-compose.yml      Local stack orchestration
```

## Functional API Coverage

- `POST /api/login`
- `GET /api/deployments`
- `POST /api/predict`
- `GET /api/metrics`
- `POST /api/rollback`
- `POST /api/recommend`
- `POST /api/deployment/check`

## Local Development

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2. ML Service

```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/generate_synthetic_data.py --rows 5000
python scripts/train_model.py
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 4. Optional Full Stack via Docker

```bash
docker compose up --build
```

## Database Collections

- `users`
- `deployments`
- `metrics`
- `predictions`
- `incidents`
- `recommendations`
- `remediationactions`

## Deployment Decision Policy

- Risk `< 50`: deploy
- Risk `50-80`: approval required
- Risk `> 80`: pause deployment

## Documentation

- [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md)
- [docs/PRODUCTION_DEPLOYMENT_GUIDE.md](docs/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [docs/API_SPEC.md](docs/API_SPEC.md)
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)
- [docs/FILE_MAP.md](docs/FILE_MAP.md)
