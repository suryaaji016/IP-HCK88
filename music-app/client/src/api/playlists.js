import api from "./axios";

const playlistsAPI = {
  getAll: async () => {
    const { data } = await api.get("/api/playlists");
    return data;
  },

  create: async (playlistData) => {
    const { data } = await api.post("/api/playlists", playlistData);
    return data;
  },

  update: async (id, playlistData) => {
    const { data } = await api.put(`/api/playlists/${id}`, playlistData);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/api/playlists/${id}`);
    return data;
  },

  addMusic: async (playlistId, musicData) => {
    const { data } = await api.post(
      `/api/playlists/${playlistId}/music`,
      musicData
    );
    return data;
  },

  removeMusic: async (playlistId, musicId) => {
    const { data } = await api.delete(
      `/api/playlists/${playlistId}/music/${musicId}`
    );
    return data;
  },
};

export default playlistsAPI;
