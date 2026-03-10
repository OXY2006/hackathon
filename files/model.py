"""
model.py – Electricity Theft Detection
Feature engineering + model definitions for structured feature dataset.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler


# ─────────────────────────────────────────────
#  FEATURE ENGINEERING
# ─────────────────────────────────────────────

DROP_COLS       = ["customer_id", "date", "CHK_STATE", "is_theft"]
CATEGORICAL_COLS = ["customer_profile", "theft_type"]


def engineer_features(df_raw: pd.DataFrame) -> pd.DataFrame:
    """
    Transform raw dataset into model-ready feature matrix.

    Parameters
    ----------
    df_raw : pd.DataFrame
        Raw dataframe. May include customer_id, date, CHK_STATE columns.

    Returns
    -------
    pd.DataFrame with all numeric features ready for training/prediction.
    """
    df = df_raw.copy()

    # Drop ID / date / target columns if present
    drop = [c for c in DROP_COLS if c in df.columns]
    df = df.drop(columns=drop)

    # ── Encode categoricals ───────────────────────────────────────
    for col in CATEGORICAL_COLS:
        if col in df.columns:
            df = pd.get_dummies(df, columns=[col], drop_first=False)

    # ── Derived features ──────────────────────────────────────────

    # Power factor anomaly: values far from 1.0 are suspicious
    if "power_factor" in df.columns:
        df["power_factor_anomaly"] = (1.0 - df["power_factor"]).abs()

    # Voltage deviation from nominal (220V)
    if "voltage_v" in df.columns:
        df["voltage_deviation"] = (df["voltage_v"] - 220.0).abs()

    # Reactive to active power ratio (high = unusual load pattern)
    if "reactive_power_kvar" in df.columns and "daily_kwh" in df.columns:
        df["reactive_ratio"] = df["reactive_power_kvar"] / (df["daily_kwh"] + 1e-9)

    # Peak demand relative to daily usage (high = unusual spike)
    if "peak_demand_kw" in df.columns and "daily_kwh" in df.columns:
        df["peak_to_daily_ratio"] = df["peak_demand_kw"] / (df["daily_kwh"] + 1e-9)

    # Low reported vs expected is a strong theft signal
    if "reported_vs_expected_ratio" in df.columns:
        df["low_ratio_flag"] = (df["reported_vs_expected_ratio"] < 0.5).astype(int)

    # Ensure all columns are numeric
    df = df.apply(pd.to_numeric, errors="coerce").fillna(0)

    return df


# ─────────────────────────────────────────────
#  MODEL DEFINITIONS
# ─────────────────────────────────────────────

def build_random_forest() -> RandomForestClassifier:
    return RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_leaf=2,
        max_features="sqrt",
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )


def build_gradient_boosting() -> GradientBoostingClassifier:
    return GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.8,
        min_samples_leaf=5,
        random_state=42,
    )


def build_logistic_regression() -> LogisticRegression:
    return LogisticRegression(
        C=1.0,
        class_weight="balanced",
        max_iter=1000,
        random_state=42,
    )


def build_scaler() -> StandardScaler:
    return StandardScaler()
