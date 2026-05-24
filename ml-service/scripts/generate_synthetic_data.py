import argparse
import os

import numpy as np
import pandas as pd

SERVICES = ['payment-service', 'cart-service', 'inventory-service', 'order-service']


def compute_failure_probability(row):
    score = 0.0

    score += min(max(row['memory_change'] / 600.0, 0), 1.5) * 0.22
    score += min(max(row['cpu_change'] / 1.8, 0), 1.5) * 0.16
    score += min(row['commits'] / 30.0, 1.0) * 0.09
    score += min(row['helm_changes'] / 8.0, 1.0) * 0.12
    score += min(row['node_usage'] / 100.0, 1.0) * 0.18
    score += min(row['pod_restart'] / 12.0, 1.0) * 0.1
    score += min(row['latency'] / 900.0, 1.0) * 0.1
    score += min(row['previous_failures'] / 5.0, 1.0) * 0.06
    score += min(row['incidents'] / 5.0, 1.0) * 0.05
    score += min(row['files_changed'] / 90.0, 1.0) * 0.04
    score += min(row['loc_changed'] / 2500.0, 1.0) * 0.04

    if row['service'] == 'payment-service':
        score += 0.05

    return min(max(score, 0), 0.98)


def generate_rows(num_rows: int, seed: int):
    rng = np.random.default_rng(seed)
    rows = []

    for i in range(num_rows):
        row = {
            'deployment_id': f'deploy-{i + 1:05d}',
            'service': rng.choice(SERVICES),
            'memory_change': float(np.clip(rng.normal(180, 170), 0, 1024)),
            'cpu_change': float(np.clip(rng.normal(0.45, 0.35), 0, 2.0)),
            'commits': int(rng.integers(1, 35)),
            'helm_changes': int(rng.integers(0, 10)),
            'node_usage': float(np.clip(rng.normal(65, 20), 10, 100)),
            'pod_restart': int(rng.integers(0, 12)),
            'latency': float(np.clip(rng.normal(250, 150), 50, 1000)),
            'previous_failures': int(rng.integers(0, 6)),
            'incidents': int(rng.integers(0, 6)),
            'files_changed': int(rng.integers(1, 100)),
            'loc_changed': int(rng.integers(20, 3000))
        }

        probability = compute_failure_probability(row)
        row['failure'] = int(rng.random() < probability)
        rows.append(row)

    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--rows', type=int, default=5000)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--output', type=str, default='data/synthetic_deployment_data.csv')
    args = parser.parse_args()

    rows = generate_rows(args.rows, args.seed)
    df = pd.DataFrame(rows)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    df.to_csv(args.output, index=False)

    print(f'Generated synthetic dataset: {args.output} ({len(df)} rows)')


if __name__ == '__main__':
    main()
