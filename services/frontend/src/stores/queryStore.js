import { create } from 'zustand';
import { queryAPI } from '../services/api';

export const useQueryStore = create((set, get) => ({
  queries: [],
  currentQuery: null,
  results: null,
  isExecuting: false,
  error: null,

  setQueries: (queries) => set({ queries }),
  setCurrentQuery: (query) => set({ currentQuery: query }),
  setResults: (results) => set({ results }),
  setExecuting: (executing) => set({ isExecuting: executing }),
  setError: (error) => set({ error }),

  executeQuery: async (query, connectionId) => {
    set({ isExecuting: true, error: null });
    try {
      const response = await queryAPI.executeQuery({
        query,
        connectionId,
      });
      set({
        results: response.data,
        isExecuting: false,
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Query execution failed';
      set({
        error: errorMsg,
        isExecuting: false,
      });
      throw error;
    }
  },

  convertNLPToSQL: async (naturalLanguage, connectionId) => {
    set({ isExecuting: true, error: null });
    try {
      // Call ML service via backend
      const response = await queryAPI.executeQuery({
        naturalLanguage,
        connectionId,
        convertFromNLP: true,
      });
      set({
        currentQuery: response.data.sql,
        results: response.data.results,
        isExecuting: false,
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'NLP conversion failed';
      set({
        error: errorMsg,
        isExecuting: false,
      });
      throw error;
    }
  },

  fetchHistory: async () => {
    try {
      const response = await queryAPI.getHistory();
      set({ queries: response.data });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to fetch history' });
      throw error;
    }
  },

  saveQuery: async (name, query) => {
    try {
      const response = await queryAPI.saveQuery({ name, query });
      const { queries } = get();
      set({ queries: [...queries, response.data] });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to save query' });
      throw error;
    }
  },
}));
