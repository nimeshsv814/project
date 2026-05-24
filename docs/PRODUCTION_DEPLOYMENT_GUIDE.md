# Production Deployment Guide (AKS)

## Prerequisites

- Azure Subscription + Contributor rights
- Azure Container Registry (ACR)
- AKS cluster with Application Gateway Ingress or NGINX ingress
- Azure DevOps project with service connection
- MongoDB (Cosmos DB Mongo API or managed Mongo)
- Azure Monitor + Log Analytics workspace

## 1. Prepare Infrastructure

1. Create ACR and AKS.
2. Attach ACR to AKS:
   `az aks update -n <aks-name> -g <rg> --attach-acr <acr-name>`
3. Create namespace:
   `kubectl apply -f k8s/base/namespace.yaml`
4. Create secrets:

```bash
kubectl -n aiops create secret generic aiops-secrets \
  --from-literal=mongodb-uri='mongodb://<host>:27017/ai-deployment-failure' \
  --from-literal=jwt-secret='<strong-jwt-secret>'
```

## 2. Train and Package ML Model

```bash
cd ml-service
pip install -r requirements.txt
python scripts/generate_synthetic_data.py --rows 10000
python scripts/train_model.py
```

Ensure `models/failure_predictor.joblib` is included in ML image build context.

## 3. Build and Push Images

```bash
az acr login -n <acr-name>
docker build -t <acr>.azurecr.io/aiops-backend:<tag> backend
docker build -t <acr>.azurecr.io/aiops-frontend:<tag> frontend
docker build -t <acr>.azurecr.io/aiops-ml-service:<tag> ml-service
docker push <acr>.azurecr.io/aiops-backend:<tag>
docker push <acr>.azurecr.io/aiops-frontend:<tag>
docker push <acr>.azurecr.io/aiops-ml-service:<tag>
```

## 4. Deploy with Helm

```bash
helm upgrade --install aiops helm/ai-deployment-failure-predictor \
  --namespace aiops --create-namespace \
  --set backend.image.repository=<acr>.azurecr.io/aiops-backend \
  --set backend.image.tag=<tag> \
  --set frontend.image.repository=<acr>.azurecr.io/aiops-frontend \
  --set frontend.image.tag=<tag> \
  --set mlService.image.repository=<acr>.azurecr.io/aiops-ml-service \
  --set mlService.image.tag=<tag>
```

## 5. Configure Azure DevOps Pipeline

1. Import `azure-devops/azure-pipelines.yml`.
2. Set variables:
   - `azureServiceConnection`
   - `aksResourceGroup`
   - `aksClusterName`
   - `acrName`
   - `GATEKEEPER_API_BASE_URL`
   - `API_AUTH_TOKEN`
3. Store secrets in variable groups or Azure Key Vault linked secrets.

## 6. Configure Monitoring

1. Deploy Prometheus via `k8s/base/prometheus.yaml` or managed Azure Monitor for containers.
2. Deploy Grafana and create dashboards:
   - CPU, memory, pod restarts
   - risk trend
   - failure trend
   - remediation actions
3. Route logs to Log Analytics and set alert rules on:
   - high risk score count
   - deployment failures
   - pod crash loops

## 7. Release Workflow

1. Git push to `main`.
2. Pipeline builds and tests.
3. AI gatekeeper evaluates risk.
4. Medium risk waits manual approval.
5. High risk blocks deployment.
6. Approved deployment rolls out to AKS.
7. Monitoring/alerts validate rollout health.

## 8. Incident Playbook

1. Create incident record via `POST /api/incidents`.
2. Trigger `POST /api/remediation/auto` for rollback/restart/scale.
3. Verify pod health and service recovery.
4. Close incident after stability window.

## 9. Scalability Notes

- Use dedicated node pools for ML workload and API workload.
- Enable cluster autoscaler.
- Use HPA + VPA recommendations.
- Add message queue processing for high-volume deployment events.
