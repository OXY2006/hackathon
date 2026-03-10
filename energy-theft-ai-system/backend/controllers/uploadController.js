const csv = require('csv-parser');
const { Readable } = require('stream');

const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const results = [];
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);

    bufferStream
      .pipe(csv())
      .on('data', (row) => {
        results.push({
          meter_id: row.meter_id,
          timestamp: row.timestamp,
          consumption_kwh: parseFloat(row.consumption_kwh),
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
        });
      })
      .on('end', () => {
        // Store parsed data in memory
        const meterIds = [...new Set(results.map(r => r.meter_id))];
        
        // Group by meter
        const grouped = {};
        results.forEach(r => {
          if (!grouped[r.meter_id]) grouped[r.meter_id] = [];
          grouped[r.meter_id].push(r);
        });
        
        global.meterDataStore = grouped;

        res.json({
          success: true,
          message: `Parsed ${results.length} readings from ${meterIds.length} meters`,
          totalReadings: results.length,
          totalMeters: meterIds.length,
          meterIds,
          data: results,
        });
      })
      .on('error', (err) => {
        res.status(500).json({ error: 'Error parsing CSV: ' + err.message });
      });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
};

module.exports = { handleUpload };
