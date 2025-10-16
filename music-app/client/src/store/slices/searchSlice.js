import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  query: "",
  results: [],
  loading: false,
  error: null,
  isSearching: false,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.query = action.payload;
      state.isSearching = action.payload.length > 0;
    },
    setSearchLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSearchResults: (state, action) => {
      state.results = action.payload;
      state.loading = false;
    },
    clearSearch: (state) => {
      state.query = "";
      state.results = [];
      state.isSearching = false;
      state.error = null;
    },
    setSearchError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setSearchQuery,
  setSearchLoading,
  setSearchResults,
  clearSearch,
  setSearchError,
} = searchSlice.actions;

export default searchSlice.reducer;

// Selectors
export const selectSearchQuery = (state) => state.search.query;
export const selectSearchResults = (state) => state.search.results;
export const selectSearchLoading = (state) => state.search.loading;
export const selectIsSearching = (state) => state.search.isSearching;
