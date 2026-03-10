const fs = require('fs');
const path = require('path');

const METRICS_PATH = path.join(__dirname, '..', '..', '..', 'model_artifacts', 'model_artifacts', 'metrics.json');

const getModelResults = async (req, res) => {
  try {
    if (!fs.existsSync(METRICS_PATH)) {
      return res.status(404).json({ 
        error: 'Model metrics not found. Train the ensemble model first using train.py.' 
      });
    }

    const raw = fs.readFileSync(METRICS_PATH, 'utf-8');
    const metrics = JSON.parse(raw);

    // Enrich with human-readable labels and formatting
    const response = {
      success: true,
      models: {
        rf: {
          name: 'Random Forest',
          short: 'RF',
          description: '300 estimators, balanced class weights, sqrt max features',
          accuracy: parseFloat((metrics.individual.rf.accuracy * 100).toFixed(2)),
          f1_score: parseFloat((metrics.individual.rf.f1_theft * 100).toFixed(2)),
          auc_roc: parseFloat((metrics.individual.rf.auc_roc * 100).toFixed(2)),
        },
        gb: {
          name: 'Gradient Boosting',
          short: 'GB',
          description: '200 estimators, 0.05 learning rate, max depth 5',
          accuracy: parseFloat((metrics.individual.gb.accuracy * 100).toFixed(2)),
          f1_score: parseFloat((metrics.individual.gb.f1_theft * 100).toFixed(2)),
          auc_roc: parseFloat((metrics.individual.gb.auc_roc * 100).toFixed(2)),
        },
        lr: {
          name: 'Logistic Regression',
          short: 'LR',
          description: 'C=1.0, balanced class weights, 1000 max iterations',
          accuracy: parseFloat((metrics.individual.lr.accuracy * 100).toFixed(2)),
          f1_score: parseFloat((metrics.individual.lr.f1_theft * 100).toFixed(2)),
          auc_roc: parseFloat((metrics.individual.lr.auc_roc * 100).toFixed(2)),
        },
      },
      ensemble: {
        name: 'Ensemble (RF + GB + LR)',
        accuracy: parseFloat((metrics.ensemble.accuracy * 100).toFixed(2)),
        f1_score: parseFloat((metrics.ensemble.f1_theft * 100).toFixed(2)),
        auc_roc: parseFloat((metrics.ensemble.auc_roc * 100).toFixed(2)),
        threshold: parseFloat(metrics.ensemble.threshold.toFixed(4)),
      },
      cross_validation: {
        accuracy_mean: parseFloat((metrics.cross_validation.accuracy_mean * 100).toFixed(2)),
        accuracy_std: parseFloat((metrics.cross_validation.accuracy_std * 100).toFixed(2)),
        f1_mean: parseFloat((metrics.cross_validation.f1_mean * 100).toFixed(2)),
        f1_std: parseFloat((metrics.cross_validation.f1_std * 100).toFixed(2)),
        auc_mean: parseFloat((metrics.cross_validation.auc_mean * 100).toFixed(2)),
        auc_std: parseFloat((metrics.cross_validation.auc_std * 100).toFixed(2)),
        folds: 5,
      },
    };

    res.json(response);
  } catch (err) {
    console.error('Model results error:', err.message);
    res.status(500).json({ error: 'Failed to load model results: ' + err.message });
  }
};

module.exports = { getModelResults };
