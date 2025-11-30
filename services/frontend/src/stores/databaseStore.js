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
      // Backend returns: { status: 'success', data: { connections: [...] } }
      const connectionsList = response.data.data?.connections || response.data.connections || [];
      set({ connections: connectionsList, isLoading: false });
      return connectionsList;
    } catch (error) {
      set({ error: 'Failed to fetch connections', isLoading: false });
      throw error;
    }
  },

  createConnection: async (connectionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await databaseAPI.createConnection(connectionData);
      // Backend returns: { status: 'success', data: { connection: {...} } }
      const newConnection = response.data.data?.connection || response.data.connection || response.data;
      
      const { connections } = get();
      set({
        connections: [...connections, newConnection],
        isLoading: false,
      });
      return newConnection;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create connection';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  deleteConnection: async (connectionId) => {
  set({ isLoading: true, error: null });
  try {
    await databaseAPI.deleteConnection(connectionId);
    const { connections } = get();
    // Remove the deleted connection from state
    set({
      connections: connections.filter((conn) => conn._id !== connectionId && conn.id !== connectionId),
      isLoading: false,
    });
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Failed to delete connection';
    set({ error: errorMsg, isLoading: false });
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
      const tablesList = response.data.data?.tables || response.data.tables || [];
      set({ tables: tablesList, isLoading: false });
      return tablesList;
    } catch (error) {
      set({ error: 'Failed to fetch tables', isLoading: false });
      throw error;
    }
  },
}));
