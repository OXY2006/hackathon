"""
train.py – Train and save the electricity-theft detection ensemble.

Usage:
    python train.py --data energy_theft_dataset_1.csv --out model_artifacts/

Outputs (in --out directory):
    rf.pkl          Random Forest
    gb.pkl          Gradient Boosting
    lr.pkl          Logistic Regression
    scaler.pkl      StandardScaler (for LR input)
    threshold.pkl   Optimal probability threshold
    feature_cols.pkl  Feature columns used during training (for prediction alignment)
    metrics.json    Evaluation report
"""

import argparse
import json
import os
import pickle
import warnings

import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, f1_score, roc_auc_score, accuracy_score
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate

from model import (
    build_gradient_boosting,
    build_logistic_regression,
    build_random_forest,
    build_scaler,
    engineer_features,
)

warnings.filterwarnings("ignore")


# ─────────────────────────────────────────────────────
#  DATA LOADING
# ─────────────────────────────────────────────────────

def load_data(csv_path: str):
    df = pd.read_csv(csv_path)
    df = df.dropna(subset=["CHK_STATE"])
    y = df["CHK_STATE"].astype(int)
    X = engineer_features(df)
    return X, y


# ─────────────────────────────────────────────────────
#  OPTIMAL THRESHOLD SEARCH
# ─────────────────────────────────────────────────────

def find_best_threshold(y_true, probs, lo=0.2, hi=0.8, step=0.01):
    best_t, best_f1 = 0.5, 0.0
    for t in np.arange(lo, hi, step):
        preds = (probs >= t).astype(int)
        score = f1_score(y_true, preds, zero_division=0)
        if score > best_f1:
            best_f1, best_t = score, t
    return float(best_t), float(best_f1)


# ─────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────

def train(csv_path: str, out_dir: str):
    os.makedirs(out_dir, exist_ok=True)

    print("Loading data …")
    X, y = load_data(csv_path)
    print(f"  Samples  : {len(y)}")
    print(f"  Features : {X.shape[1]}")
    print(f"  Theft rate: {y.mean():.2%}")

    # Save feature columns for prediction alignment
    feature_cols = X.columns.tolist()
    with open(os.path.join(out_dir, "feature_cols.pkl"), "wb") as f:
        pickle.dump(feature_cols, f)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = build_scaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc  = scaler.transform(X_test)

    # ── Train models ─────────────────────────────────────────────
    models = {
        "rf": (build_random_forest(),       X_train,    X_test),
        "gb": (build_gradient_boosting(),   X_train,    X_test),
        "lr": (build_logistic_regression(), X_train_sc, X_test_sc),
    }

    trained, test_probs = {}, {}
    individual_metrics = {}

    for name, (model, Xtr, Xte) in models.items():
        print(f"Training {name.upper()} …")
        model.fit(Xtr, y_train)
        probs = model.predict_proba(Xte)[:, 1]
        preds = model.predict(Xte)

        trained[name]    = model
        test_probs[name] = probs

        individual_metrics[name] = {
            "accuracy": float(accuracy_score(y_test, preds)),
            "f1_theft": float(f1_score(y_test, preds, zero_division=0)),
            "auc_roc":  float(roc_auc_score(y_test, probs)),
        }
        print(
            f"  Acc={individual_metrics[name]['accuracy']:.4f}  "
            f"F1={individual_metrics[name]['f1_theft']:.4f}  "
            f"AUC={individual_metrics[name]['auc_roc']:.4f}"
        )

    # ── Ensemble ─────────────────────────────────────────────────
    ensemble_probs = np.mean([test_probs["rf"], test_probs["gb"], test_probs["lr"]], axis=0)
    best_t, best_f1 = find_best_threshold(y_test, ensemble_probs)
    ensemble_preds  = (ensemble_probs >= best_t).astype(int)
    ensemble_auc    = float(roc_auc_score(y_test, ensemble_probs))
    ensemble_acc    = float(accuracy_score(y_test, ensemble_preds))

    print(f"\n{'='*55}")
    print(f"  ENSEMBLE  (threshold={best_t:.2f})")
    print(f"  Accuracy : {ensemble_acc:.4f} ({ensemble_acc*100:.2f}%)")
    print(f"  F1 Theft : {best_f1:.4f}")
    print(f"  AUC-ROC  : {ensemble_auc:.4f}")
    print(classification_report(y_test, ensemble_preds, target_names=["Normal", "Theft"]))

    # ── Cross-validation ─────────────────────────────────────────
    print("Running 5-fold cross-validation …")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_results = cross_validate(
        build_random_forest(), X, y, cv=cv,
        scoring=["accuracy", "f1", "roc_auc"],
        return_train_score=True
    )
    print(f"  CV Accuracy : {cv_results['test_accuracy'].mean():.4f} ± {cv_results['test_accuracy'].std():.4f}")
    print(f"  CV F1       : {cv_results['test_f1'].mean():.4f} ± {cv_results['test_f1'].std():.4f}")
    print(f"  CV AUC      : {cv_results['test_roc_auc'].mean():.4f} ± {cv_results['test_roc_auc'].std():.4f}")

    # ── Save artifacts ───────────────────────────────────────────
    for name, model in trained.items():
        with open(os.path.join(out_dir, f"{name}.pkl"), "wb") as f:
            pickle.dump(model, f)

    with open(os.path.join(out_dir, "scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)

    with open(os.path.join(out_dir, "threshold.pkl"), "wb") as f:
        pickle.dump(best_t, f)

    metrics = {
        "individual": individual_metrics,
        "ensemble": {
            "accuracy":  ensemble_acc,
            "f1_theft":  best_f1,
            "auc_roc":   ensemble_auc,
            "threshold": best_t,
        },
        "cross_validation": {
            "accuracy_mean": float(cv_results['test_accuracy'].mean()),
            "accuracy_std":  float(cv_results['test_accuracy'].std()),
            "f1_mean":       float(cv_results['test_f1'].mean()),
            "f1_std":        float(cv_results['test_f1'].std()),
            "auc_mean":      float(cv_results['test_roc_auc'].mean()),
            "auc_std":       float(cv_results['test_roc_auc'].std()),
        }
    }
    with open(os.path.join(out_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\n✅ All artifacts saved to '{out_dir}/'")
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="energy_theft_dataset_1.csv")
    parser.add_argument("--out",  default="model_artifacts")
    args = parser.parse_args()
    train(args.data, args.out)
