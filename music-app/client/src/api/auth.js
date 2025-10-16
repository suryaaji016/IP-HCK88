import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

const authAPI = {
  register: async (credentials) => {
    const { data } = await axios.post(`${API_BASE_URL}/register`, credentials);
    return data;
  },

  login: async (credentials) => {
    const { data } = await axios.post(`${API_BASE_URL}/login`, credentials);
    return data;
  },

  googleLogin: async (token) => {
    const { data } = await axios.post(`${API_BASE_URL}/login/google`, token);
    return data;
  },
};

export default authAPI;
