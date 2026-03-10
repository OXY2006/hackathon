const getReport = async (req, res) => {
  try {
    const { meter_id } = req.params;
    
    const analysis = global.analysisStore[meter_id];
    const meterReadings = global.meterDataStore[meter_id];
    
    if (!analysis) {
      return res.status(404).json({ 
        error: `No analysis found for meter ${meter_id}. Run anomaly detection first.` 
      });
    }

    const report = {
      meter_id,
      generated_at: new Date().toISOString(),
      risk_score: analysis.risk_score,
      is_suspicious: analysis.is_suspicious,
      status: analysis.is_suspicious ? 'SUSPICIOUS' : 'SAFE',
      shap_features: analysis.shap_features || [],
      explanation: analysis.explanation || 'No explanation available.',
      recommendation: analysis.recommendation || 'No recommendation.',
      readings: meterReadings || [],
      features: analysis.features || {},
    };

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Report generation failed: ' + err.message });
  }
};

module.exports = { getReport };
