# Database Schema (MongoDB)

## users

- `name` (string, required)
- `email` (string, required, unique)
- `passwordHash` (string, required)
- `role` (`Admin | DevOps Engineer | Viewer`)
- `createdAt`, `updatedAt`

## deployments

- `deploymentId` (string, unique)
- `name` (string)
- `service` (`payment-service | cart-service | inventory-service | order-service`)
- `status` (`Success | Warning | Failed`)
- `git.commitCount` (number)
- `git.filesChanged` (number)
- `git.locChanged` (number)
- `kubernetes.helmChanges` (number)
- `kubernetes.cpuRequest`, `kubernetes.cpuLimit` (number)
- `kubernetes.memoryRequest`, `kubernetes.memoryLimit` (number)
- `history.previousFailures`, `history.incidents` (number)
- `monitoring.nodeUtilization`, `monitoring.latency` (number)
- `monitoring.cpu`, `monitoring.memory`, `monitoring.podRestarts`, `monitoring.responseTime`
- `lastRiskScore` (number)
- `lastRiskLevel` (string)
- `createdAt`, `updatedAt`

## metrics

- `service` (string)
- `cpu` (number)
- `memory` (number)
- `podRestarts` (number)
- `nodeUtilization` (number)
- `responseTime` (number)
- `source` (default `prometheus`)
- `observedAt` (date)

## predictions

- `deploymentId` (string)
- `service` (string)
- `features.memoryChange` (number)
- `features.cpuChange` (number)
- `features.commits` (number)
- `features.helmChanges` (number)
- `features.nodeUsage` (number)
- `features.podRestart` (number)
- `features.latency` (number)
- `features.previousFailures` (number)
- `features.incidents` (number)
- `features.filesChanged` (number)
- `features.locChanged` (number)
- `failureProbability` (number)
- `riskLevel` (`LOW | MEDIUM | HIGH | CRITICAL`)
- `reasons` (string array)
- `createdAt`, `updatedAt`

## recommendations

- `deploymentId` (string)
- `recommendations` (string array)
- `source` (string)
- `createdAt`, `updatedAt`

## incidents

- `deploymentId` (string)
- `service` (string)
- `severity` (`LOW | MEDIUM | HIGH | CRITICAL`)
- `rootCause` (string)
- `summary` (string)
- `status` (`open | resolved`)
- `remediationActions` (string array)
- `happenedAt` (date)
- `createdAt`, `updatedAt`

## remediationactions

- `deploymentId` (string)
- `action` (string)
- `command` (string)
- `status` (`success | failed`)
- `output` (string)
- `executedBy` (string)
- `createdAt`, `updatedAt`
