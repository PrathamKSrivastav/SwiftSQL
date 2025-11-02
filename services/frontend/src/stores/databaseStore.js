import { create } from 'zustand';
import { databaseAPI } from '../services/api';

export const useDatabaseStore = create((set, get) => ({
  connections: [],
  selectedConnection: null,
  tables: [],
  isLoading: false,
  error: null,

  setConnections: (connections) => set({ connections }),
  setSelectedConnection: (connection) => set({ selectedConnection: connection }),
  setTables: (tables) => set({ tables }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchConnections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await databaseAPI.getConnections();
      set({ connections: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to fetch connections', isLoading: false });
      throw error;
    }
  },

  createConnection: async (connectionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await databaseAPI.createConnection(connectionData);
      const { connections } = get();
      set({
        connections: [...connections, response.data],
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to create connection', isLoading: false });
      throw error;
    }
  },

  testConnection: async (connectionData) => {
    try {
      const response = await databaseAPI.testConnection(connectionData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Connection test failed';
    }
  },

  fetchTables: async (connectionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await databaseAPI.getTables(connectionId);
      set({ tables: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to fetch tables', isLoading: false });
      throw error;
    }
  },
}));
