def risk_level_from_probability(probability: float) -> str:
    if probability > 90:
        return 'CRITICAL'
    if probability > 80:
        return 'HIGH'
    if probability >= 50:
        return 'MEDIUM'
    return 'LOW'


def build_reasons(payload) -> list[str]:
    reasons = []

    if payload.memory_change > 256:
        reasons.append('memory increased')

    if payload.cpu_change > 0.5:
        reasons.append('cpu increased')

    if payload.node_usage > 80:
        reasons.append('node utilization high')

    if payload.latency > 350:
        reasons.append('latency degradation detected')

    if payload.previous_failures > 1:
        reasons.append('similar deployments failed')

    if payload.helm_changes > 3:
        reasons.append('helm configuration changed heavily')

    if payload.pod_restart > 2:
        reasons.append('pod restart spike observed')

    return reasons or ['no dominant signals detected']


def build_recommendations(risk_level: str, reasons: list[str]) -> list[str]:
    lowered_reasons = [reason.lower() for reason in reasons]
    recommendations = []

    if any('memory' in reason for reason in lowered_reasons):
        recommendations.extend(['Increase memory limit', 'Add one node'])

    if any('cpu' in reason for reason in lowered_reasons):
        recommendations.append('Adjust HPA target CPU')

    if any('helm' in reason for reason in lowered_reasons):
        recommendations.append('Fix Helm values and run helm lint')

    if any('latency' in reason for reason in lowered_reasons):
        recommendations.append('Enable canary deployment')

    if risk_level in {'HIGH', 'CRITICAL'}:
        recommendations.append('Pause deployment and require senior approval')

    if risk_level == 'CRITICAL':
        recommendations.append('Trigger immediate rollback plan')

    if not recommendations:
        recommendations.append('Proceed with standard rollout and monitor closely')

    # De-duplicate while preserving order.
    return list(dict.fromkeys(recommendations))


def summarize_incident(service: str, root_cause: str, severity: str, actions: list[str]) -> str:
    actions_text = ', '.join(actions) if actions else 'no remediation actions yet'
    return (
        f'{service} failed due to {root_cause}. '
        f'Severity was {severity}. '
        f'Remediation status: {actions_text}.'
    )
