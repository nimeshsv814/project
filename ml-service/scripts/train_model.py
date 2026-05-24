import argparse
import os

import joblib
import pandas as pd
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

FEATURE_COLUMNS = [
    'memory_change',
    'cpu_change',
    'commits',
    'helm_changes',
    'node_usage',
    'pod_restart',
    'latency',
    'previous_failures',
    'incidents',
    'files_changed',
    'loc_changed'
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dataset', type=str, default='data/synthetic_deployment_data.csv')
    parser.add_argument('--output', type=str, default='models/failure_predictor.joblib')
    args = parser.parse_args()

    df = pd.read_csv(args.dataset)

    X = df[FEATURE_COLUMNS]
    y = df['failure']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = XGBClassifier(
        n_estimators=250,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        objective='binary:logistic',
        eval_metric='logloss',
        random_state=42
    )

    model.fit(X_train, y_train)

    probabilities = model.predict_proba(X_test)[:, 1]
    predictions = (probabilities >= 0.5).astype(int)

    auc = roc_auc_score(y_test, probabilities)
    report = classification_report(y_test, predictions, zero_division=0)

    print(f'Validation ROC-AUC: {auc:.4f}')
    print(report)

    bundle = {
        'model': model,
        'feature_columns': FEATURE_COLUMNS,
        'metrics': {
            'roc_auc': auc
        }
    }

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    joblib.dump(bundle, args.output)

    print(f'Model saved to {args.output}')


if __name__ == '__main__':
    main()
