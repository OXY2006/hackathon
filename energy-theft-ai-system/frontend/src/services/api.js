import axios from 'axios'

const API_BASE = '/api'

export async function uploadCSV(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function detectAnomalies(data) {
  const response = await axios.post(`${API_BASE}/detect`, { data }, {
    timeout: 300000,
    maxContentLength: 200 * 1024 * 1024,
    maxBodyLength: 200 * 1024 * 1024,
  })
  return response.data
}

export async function getReport(meterId) {
  const response = await axios.get(`${API_BASE}/report/${meterId}`)
  return response.data
}

export async function getModelResults() {
  const response = await axios.get(`${API_BASE}/model-results`)
  return response.data
}

