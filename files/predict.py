"""
predict.py – Run inference with the trained theft-detection ensemble.

Usage:
    python predict.py --data new_customers.csv --artifacts model_artifacts/ --out predictions.csv

Input CSV format:
    Same columns as training data. CHK_STATE is optional.

Output CSV columns:
    customer_id, theft_probability, prediction, label
"""

import argparse
import os
import pickle

import numpy as np
import pandas as pd

from model import engineer_features


def load_artifacts(artifacts_dir: str):
    def _load(fname):
        with open(os.path.join(artifacts_dir, fname), "rb") as f:
            return pickle.load(f)
    return {
        "rf":           _load("rf.pkl"),
        "gb":           _load("gb.pkl"),
        "lr":           _load("lr.pkl"),
        "scaler":       _load("scaler.pkl"),
        "threshold":    _load("threshold.pkl"),
        "feature_cols": _load("feature_cols.pkl"),
    }


def predict(csv_path: str, artifacts_dir: str, out_path: str):
    df = pd.read_csv(csv_path)

    cons_no = df["customer_id"].copy() if "customer_id" in df.columns else pd.Series(range(len(df)))

    art = load_artifacts(artifacts_dir)

    X = engineer_features(df)

    # Align columns to match training — add missing cols as 0, drop extras
    for col in art["feature_cols"]:
        if col not in X.columns:
            X[col] = 0
    X = X[art["feature_cols"]]

    X_sc = art["scaler"].transform(X)

    rf_prob  = art["rf"].predict_proba(X)[:, 1]
    gb_prob  = art["gb"].predict_proba(X)[:, 1]
    lr_prob  = art["lr"].predict_proba(X_sc)[:, 1]

    ensemble_prob = np.mean([rf_prob, gb_prob, lr_prob], axis=0)
    predictions   = (ensemble_prob >= art["threshold"]).astype(int)

    results = pd.DataFrame({
        "customer_id":       cons_no.values,
        "theft_probability": ensemble_prob.round(4),
        "prediction":        predictions,
        "label":             ["Theft" if p == 1 else "Normal" for p in predictions],
    })

    results.to_csv(out_path, index=False)
    print(f"✅ Predictions saved to '{out_path}'")
    print(f"   Total customers : {len(results)}")
    print(f"   Flagged as theft: {predictions.sum()} ({predictions.mean():.2%})")
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data",      required=True)
    parser.add_argument("--artifacts", default="model_artifacts")
    parser.add_argument("--out",       default="predictions.csv")
    args = parser.parse_args()
    predict(args.data, args.artifacts, args.out)
