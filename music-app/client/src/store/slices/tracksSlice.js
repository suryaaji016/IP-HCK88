import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tracks: [],
  loading: false,
  error: null,
  currentTrack: null,
  hasMore: true,
  offset: 0,
  genre: "",
};

const tracksSlice = createSlice({
  name: "tracks",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTracks: (state, action) => {
      state.tracks = action.payload;
      state.loading = false;
    },
    setOffset: (state, action) => {
      state.offset = action.payload;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    appendTracks: (state, action) => {
      const newTracks = action.payload.tracks.filter(
        (t) => !state.tracks.some((existing) => existing.id === t.id)
      );

      state.tracks = [...state.tracks, ...newTracks];
      state.offset = action.payload.nextOffset;
      state.hasMore = action.payload.hasMore !== false;
      state.loading = false;
    },

    setCurrentTrack: (state, action) => {
      state.currentTrack = action.payload;
    },
    setTracksError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearTracks: (state) => {
      state.tracks = [];
      state.offset = 0;
      state.hasMore = true;
    },
  },
});

export const {
  setLoading,
  setTracks,
  setOffset,
  setHasMore,
  appendTracks,
  setCurrentTrack,
  setTracksError,
  clearTracks,
} = tracksSlice.actions;

export default tracksSlice.reducer;

// Selectors
export const selectTracks = (state) => state.tracks.tracks;
export const selectTracksLoading = (state) => state.tracks.loading;
export const selectCurrentTrack = (state) => state.tracks.currentTrack;
export const selectHasMore = (state) => state.tracks.hasMore;
export const selectOffset = (state) => state.tracks.offset;
