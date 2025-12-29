import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

export const api = {
  // Auth
  getGoogleUsers: () => axios.get(`${API_URL}/auth/google/users`),
  login: (email) => axios.post(`${API_URL}/auth/google/login`, { email }),

  // Rooms
  createRoom: (data) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/rooms/create`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  joinRoom: (code) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/rooms/join`, { code }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getRoom: (roomId) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getUserRooms: (userEmail) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/rooms/user/${userEmail}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  updateRoom: (roomId, data) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/rooms/${roomId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Polls
  createPoll: (data) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/polls/create`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getPoll: (pollId) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/polls/${pollId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  vote: (pollId, optionId) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/polls/${pollId}/vote`, { optionId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getRoomPolls: (roomId) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/polls/room/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  closePoll: (pollId) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/polls/${pollId}/close`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Admin
  getAllRooms: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/admin/rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getAllUsers: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getStats: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  updateUserRole: (email, role) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/admin/users/${email}`, { role }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  deleteUser: (email) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/admin/users/${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getAllPolls: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/admin/polls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Google integrations
  saveToSheets: (data) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/google/sheets/save`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  shareToCalendar: (data) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/google/calendar/share`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  exportToDrive: (data) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/google/drive/export`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getContacts: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/google/contacts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Search
  searchRooms: (query) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/rooms/search/${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  searchPolls: (query) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/polls/search/${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  searchMembers: (query) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/admin/search/members/${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getActivities: (userEmail) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/admin/activities/${userEmail}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Admin actions
  deleteRoom: (roomId) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  deletePoll: (pollId) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/polls/${pollId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  updatePoll: (pollId, data) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/polls/${pollId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

