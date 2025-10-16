import api from "./axios";

const tracksAPI = {
  getHome: async (offset = 0, limit = 12) => {
    const { data } = await api.get(`/api/home?offset=${offset}&limit=${limit}`);
    return data;
  },

  getDetail: async (id) => {
    const { data } = await api.get(`/api/detail/${id}`);
    return data;
  },

  generateAI: async (prompt) => {
    const { data } = await api.post("/api/generate-ai", { prompt });
    return data;
  },

  searchTracks: async (query) => {
    const { data } = await api.get(
      `/api/search?q=${encodeURIComponent(query)}`
    );
    return data;
  },
};

export default tracksAPI;
