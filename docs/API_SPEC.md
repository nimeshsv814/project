# API Specification

Base path: `/api`

## Authentication

### `POST /login`

Request:

```json
{
  "email": "admin@aideploy.local",
  "password": "Admin@123"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "...",
    "name": "Platform Admin",
    "email": "admin@aideploy.local",
    "role": "Admin"
  }
}
```

## Deployments

### `GET /deployments`
Returns tracked deployments.

### `POST /deployments`
Upserts deployment metadata and monitoring context.

### `POST /deployment/check`
Runs AI gatekeeper policy before rollout.

Request:

```json
{
  "deploymentId": "deploy-001"
}
```

Response:

```json
{
  "deploymentId": "deploy-001",
  "failureProbability": 82,
  "riskLevel": "HIGH",
  "reasons": [
    "memory increased",
    "node utilization high",
    "similar deployments failed"
  ],
  "decision": "pause",
  "policy": {
    "deployIfBelow": 50,
    "requireApprovalRange": [50, 80],
    "pauseAbove": 80
  }
}
```

## Prediction

### `POST /predict`
Runs ML prediction directly with provided features.

### `GET /predictions`
Returns historical prediction results.

### `POST /recommend`
Returns recommendations:

```json
{
  "recommendations": [
    "Increase memory limit",
    "Enable canary deployment",
    "Add one node"
  ]
}
```

## Monitoring

### `GET /metrics`
Reads persisted monitoring metrics.

### `POST /metrics`
Stores monitoring metric record.

### `POST /metrics/pull`
Example Prometheus query passthrough endpoint.

## Remediation

### `POST /rollback`
Triggers rollback:

```json
{
  "deploymentId": "deploy-001",
  "deploymentName": "payment-service"
}
```

### `POST /remediation/auto`
Triggers rollback + restart + scale sequence.

## Incidents

### `GET /incidents`
Returns incident history.

### `POST /incidents`
Creates incident and AI summary.
