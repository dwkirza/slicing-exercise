import axios from 'axios'

const api = axios.create({
  baseURL: 'https://slicing-exercise.mockapi.io/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
