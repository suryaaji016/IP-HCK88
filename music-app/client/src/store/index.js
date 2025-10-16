import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import tracksReducer from "./slices/tracksSlice";
import playlistsReducer from "./slices/playlistsSlice";
import searchReducer from "./slices/searchSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tracks: tracksReducer,
    playlists: playlistsReducer,
    search: searchReducer,
  },
});
