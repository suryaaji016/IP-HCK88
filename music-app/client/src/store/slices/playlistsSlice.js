import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  playlists: [],
  loading: false,
  error: null,
  selectedPlaylist: null,
};

const playlistsSlice = createSlice({
  name: "playlists",
  initialState,
  reducers: {
    setPlaylistsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPlaylists: (state, action) => {
      state.playlists = action.payload;
      state.loading = false;
    },
    addPlaylist: (state, action) => {
      state.playlists.push(action.payload);
    },
    updatePlaylist: (state, action) => {
      const index = state.playlists.findIndex(
        (p) => p.id === action.payload.id
      );
      if (index !== -1) {
        state.playlists[index] = action.payload;
      }
    },
    removePlaylist: (state, action) => {
      state.playlists = state.playlists.filter((p) => p.id !== action.payload);
    },
    setSelectedPlaylist: (state, action) => {
      state.selectedPlaylist = action.payload;
    },
    setPlaylistsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setPlaylistsLoading,
  setPlaylists,
  addPlaylist,
  updatePlaylist,
  removePlaylist,
  setSelectedPlaylist,
  setPlaylistsError,
} = playlistsSlice.actions;

export default playlistsSlice.reducer;

// Selectors
export const selectPlaylists = (state) => state.playlists.playlists;
export const selectPlaylistsLoading = (state) => state.playlists.loading;
export const selectSelectedPlaylist = (state) =>
  state.playlists.selectedPlaylist;
