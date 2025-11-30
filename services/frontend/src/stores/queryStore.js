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

  executeQuery: async (sqlQuery, connectionId) => {
    set({ isExecuting: true, error: null, results: null });
    try {
      const response = await queryAPI.executeQuery({
        query: sqlQuery,
        connectionId,
      });

      // Robust extraction: handle multiple possible response structures
      let resultData = null;

      if (response.data?.data) {
        // Standard format: { status: 'success', data: { results, rowCount, executionTime } }
        resultData = response.data.data;
      } else if (response.data?.results) {
        // Alternative format: { results, rowCount, executionTime }
        resultData = response.data;
      } else if (Array.isArray(response.data)) {
        // Direct array: [{ ... }, { ... }]
        resultData = {
          results: response.data,
          rowCount: response.data.length,
          executionTime: 0,
          columns: response.data.length > 0 ? Object.keys(response.data[0]) : [],
        };
      } else {
        throw new Error('Invalid response format from server');
      }

      // Ensure results is always an array
      if (!Array.isArray(resultData.results)) {
        resultData.results = [];
      }

      // Extract columns if not provided
      if (!resultData.columns && resultData.results.length > 0) {
        resultData.columns = Object.keys(resultData.results[0]);
      } else if (!resultData.columns) {
        resultData.columns = [];
      }

      set({
        results: resultData,
        isExecuting: false,
        error: null,
      });

      return resultData;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Query execution failed';
      set({
        error: errorMsg,
        isExecuting: false,
        results: null,
      });
      throw error;
    }
  },

  convertNLPToSQL: async (naturalLanguage) => {
    set({ isExecuting: true, error: null });
    try {
      const response = await queryAPI.convertToSQL({ query: naturalLanguage });
      
      const generatedSQL = response.data.data?.generatedSQL || response.data.generatedSQL || '';
      
      set({
        currentQuery: generatedSQL,
        isExecuting: false,
      });
      return generatedSQL;
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
    
    // Backend returns: { status: 'success', data: { history: [...], pagination: {...} } }
    const historyData = response.data?.data?.history || response.data?.history || [];
    
    set({ queries: Array.isArray(historyData) ? historyData : [] });
    return historyData;
  } catch (error) {
    console.error('Failed to fetch history:', error);
    set({ error: 'Failed to fetch history', queries: [] });
    throw error;
  }
},

  deleteQuery: async (queryId) => {
    try {
      await queryAPI.deleteQuery(queryId);
      const { queries } = get();
      set({ queries: queries.filter((q) => q._id !== queryId) });
    } catch (error) {
      set({ error: 'Failed to delete query' });
      throw error;
    }
  },

  clearResults: () => set({ results: null, error: null }),
  clearError: () => set({ error: null }),
}));
