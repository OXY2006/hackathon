def engineer_features(df, target_col='CHK_STATE'):
    feature_cols = [c for c in df.columns if c != target_col]
    X = df[feature_cols].apply(pd.to_numeric, errors='coerce')
    f = pd.DataFrame(index=X.index)

    # --- Basic statistics ---
    f['mean']   = X.mean(axis=1)
    f['std']    = X.std(axis=1)
    f['min']    = X.min(axis=1)
    f['max']    = X.max(axis=1)
    f['median'] = X.median(axis=1)
    f['total']  = X.sum(axis=1)
    f['range']  = f['max'] - f['min']
    f['cv']     = f['std'] / (f['mean'] + 1e-9)
    f['skew']   = X.skew(axis=1)
    f['kurt']   = X.kurt(axis=1)
    f['q25']    = X.quantile(0.25, axis=1)
    f['q75']    = X.quantile(0.75, axis=1)
    f['iqr']    = f['q75'] - f['q25']

    # --- Theft-specific ---
    f['n_zeros']      = (X == 0).sum(axis=1)
    f['n_negative']   = (X < 0).sum(axis=1)
    f['n_missing']    = X.isnull().sum(axis=1)
    f['pct_zeros']    = f['n_zeros'] / X.shape[1]
    f['pct_missing']  = f['n_missing'] / X.shape[1]
    f['has_negative'] = (f['n_negative'] > 0).astype(int)
    f['neg_sum']      = X.clip(upper=0).sum(axis=1)
    f['pos_mean']     = X.clip(lower=0).mean(axis=1)

    # --- Monthly aggregates ---
    n = X.shape[1]
    msz = n // 12
    monthly = []
    for m in range(12):
        s = m * msz
        e = s + msz if m < 11 else n
        mm = X.iloc[:, s:e].mean(axis=1)
        ms = X.iloc[:, s:e].std(axis=1)
        f[f'm{m+1}_mean'] = mm
        f[f'm{m+1}_std']  = ms
        monthly.append(mm)
    mdf = pd.concat(monthly, axis=1)
    f['monthly_std']   = mdf.std(axis=1)
    f['monthly_range'] = mdf.max(axis=1) - mdf.min(axis=1)

    # --- Trend (first half vs second half) ---
    mid = n // 2
    h1 = X.iloc[:, :mid].mean(axis=1)
    h2 = X.iloc[:, mid:].mean(axis=1)
    f['trend']       = h2 - h1
    f['trend_ratio'] = h2 / (h1 + 1e-9)

    # --- Longest zero streak ---
    def longest_zero(row):
        r = row.fillna(0)
        best, cur = 0, 0
        for v in r:
            cur = cur + 1 if v == 0 else 0
            best = max(best, cur)
        return best
    f['zero_streak'] = X.apply(longest_zero, axis=1)

    # --- Volatility ---
    diffs = X.diff(axis=1).abs()
    f['mean_change'] = diffs.mean(axis=1)
    f['max_change']  = diffs.max(axis=1)
    f['volatility']  = diffs.std(axis=1)

    # --- Outlier score ---
    z = X.sub(f['mean'], axis=0).div(f['std'] + 1e-9, axis=0)
    f['n_outliers'] = (z.abs() > 3).sum(axis=1)
    f['max_z']      = z.abs().max(axis=1)

    # --- Active days ---
    f['active_days']  = (X > 0).sum(axis=1)
    f['active_ratio'] = f['active_days'] / (X.shape[1] - f['n_missing'] + 1e-9)

    print(f'Features created: {f.shape[1]}')
    return f


X_eng = engineer_features(df, TARGET)
y     = df[TARGET].values
print(f'X shape: {X_eng.shape},  y shape: {y.shape}')
print(f'Class distribution: {dict(zip(*np.unique(y, return_counts=True)))}')