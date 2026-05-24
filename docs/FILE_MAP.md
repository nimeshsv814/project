# File Map

## Root

- `.gitignore`: Ignore local artifacts, dependencies, logs, and build outputs.
- `docker-compose.yml`: Local orchestration for backend, frontend, ML, MongoDB, RabbitMQ, Prometheus, Grafana.
- `README.md`: Solution overview, quick start, and documentation index.

## Backend (`backend`)

- `Dockerfile`: Production backend image build and runtime.
- `.env.example`: Environment variable template.
- `package.json`: Backend dependencies and scripts.

### Backend Core

- `src/server.js`: Startup entrypoint that connects MongoDB and starts Express.
- `src/app.js`: Express app middleware and module router mounting.

### Backend Config and Middleware

- `src/config/env.js`: Centralized environment variable access.
- `src/config/db.js`: MongoDB connection bootstrap.
- `src/middleware/auth.js`: JWT verification middleware.
- `src/middleware/rbac.js`: Role-based access middleware.
- `src/middleware/errorHandler.js`: Standardized API error response handler.

### Backend Models

- `src/models/User.js`: RBAC user collection schema.
- `src/models/Deployment.js`: Deployment metadata and risk snapshot schema.
- `src/models/Metric.js`: Monitoring metric records.
- `src/models/Prediction.js`: Prediction history and feature audit.
- `src/models/Recommendation.js`: Recommendation history.
- `src/models/Incident.js`: Incident intelligence records.
- `src/models/RemediationAction.js`: Auto-remediation action logs.

### Backend Modules

- `src/auth/routes.js`: Login and admin user creation APIs.
- `src/deployment/routes.js`: Deployment list/upsert and gatekeeper API.
- `src/monitoring/routes.js`: Metrics read/write and Prometheus pull API.
- `src/prediction/routes.js`: Prediction and recommendation APIs.
- `src/remediation/routes.js`: Rollback and automated remediation APIs.
- `src/incidents/routes.js`: Incident read/create with AI summary.

### Backend Integrations and Utilities

- `src/services/prometheus.service.js`: Prometheus HTTP query client.
- `src/services/ml.service.js`: FastAPI ML service client.
- `src/services/recommendation.service.js`: Rule-based recommendation fallback.
- `src/kubernetes/commands.js`: Kubectl command wrappers.
- `src/utils/risk.js`: Risk-level and gate decision policy mapping.
- `src/utils/seedAdmin.js`: Seed script for first admin account.

## Frontend (`frontend`)

- `Dockerfile`: Multi-stage React build + Nginx runtime image.
- `nginx.conf`: SPA-safe Nginx route fallback.
- `.env.example`: Frontend env template.
- `package.json`: Frontend dependencies and scripts.
- `vite.config.js`: Vite build/dev server settings.
- `tailwind.config.js`: Tailwind theme and file scanning.
- `postcss.config.js`: Tailwind/autoprefixer plugins.
- `index.html`: Root HTML shell.

### Frontend App Core

- `src/main.jsx`: React bootstrap with router and auth provider.
- `src/App.jsx`: Route definitions.
- `src/index.css`: Tailwind layers + global visual styling.

### Frontend State, Hooks, Services

- `src/store/AuthContext.jsx`: Auth state with localStorage persistence.
- `src/hooks/useAuth.js`: Auth hook wrapper.
- `src/services/api.js`: Axios client with JWT interceptor.
- `src/services/platformService.js`: API function wrappers.

### Frontend Layout and Components

- `src/layouts/DashboardLayout.jsx`: Main dashboard shell.
- `src/components/ProtectedRoute.jsx`: Route auth guard.
- `src/components/Sidebar.jsx`: Primary navigation.
- `src/components/TopBar.jsx`: User profile header and logout.
- `src/components/MetricCard.jsx`: KPI card component.
- `src/components/RiskBadge.jsx`: Risk level status badge.
- `src/components/RecommendationPanel.jsx`: Recommendation list card.

### Frontend Charts

- `src/charts/FailureTrendChart.jsx`: Failure probability line chart.
- `src/charts/RiskHistoryChart.jsx`: Deployment risk trend chart.
- `src/charts/LiveMonitoringChart.jsx`: CPU/memory/restart bar chart.

### Frontend Pages

- `src/pages/LoginPage.jsx`: RBAC login page.
- `src/pages/OverviewPage.jsx`: Executive overview and KPIs.
- `src/pages/ClusterHealthPage.jsx`: Live health metrics and table.
- `src/pages/ActiveDeploymentsPage.jsx`: Active deployments and gate checks.
- `src/pages/RiskScorePage.jsx`: Prediction history and recommendations.
- `src/pages/DeploymentAnalyticsPage.jsx`: Trend analytics dashboard.
- `src/pages/IncidentReportsPage.jsx`: Incident intelligence table.

## ML Service (`ml-service`)

- `Dockerfile`: FastAPI service container image.
- `requirements.txt`: ML and API dependencies.
- `.env.example`: ML service env template.
- `app/__init__.py`: App package bootstrap.
- `app/main.py`: FastAPI endpoints and model inference.
- `app/rules.py`: Risk reasoning, recommendations, summaries.
- `scripts/generate_synthetic_data.py`: Synthetic training dataset generation.
- `scripts/train_model.py`: XGBoost training and Joblib export.
- `data/synthetic_deployment_data.csv`: Generated synthetic dataset for model training.
- `models/failure_predictor.joblib`: Trained model artifact loaded by FastAPI at runtime.

## Kubernetes (`k8s/base`)

- `namespace.yaml`: Logical namespace for platform workloads.
- `deployment.yaml`: Backend/frontend/ml deployment specs with probes and rolling update.
- `service.yaml`: ClusterIP services.
- `hpa.yaml`: Autoscaling policies.
- `ingress.yaml`: External routing to frontend and backend.
- `prometheus.yml`: Prometheus scrape config for local compose.
- `prometheus.yaml`: Prometheus ConfigMap, deployment, and service.

## Helm (`helm/ai-deployment-failure-predictor`)

- `Chart.yaml`: Chart metadata.
- `values.yaml`: Environment-specific tuning values.
- `templates/_helpers.tpl`: Naming/labels helper templates.
- `templates/namespace.yaml`: Namespace template.
- `templates/deployment.yaml`: Backend/frontend/ml deployment templates.
- `templates/service.yaml`: Service templates.
- `templates/hpa.yaml`: HPA template.
- `templates/ingress.yaml`: Ingress template.

## Azure DevOps (`azure-devops`)

- `azure-pipelines.yml`: CI/CD with AI risk gating and AKS deployment.
- `deployment-metadata.json`: Sample deployment payload used in gate stage.
