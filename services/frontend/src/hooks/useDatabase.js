import { useQuery, useMutation } from '@tanstack/react-query';
import { databaseAPI } from '../services/api';

export const useDatabaseConnections = () => {
  return useQuery({
    queryKey: ['databaseConnections'],
    queryFn: () => databaseAPI.getConnections(),
  });
};

export const useCreateConnection = () => {
  return useMutation({
    mutationFn: (data) => databaseAPI.createConnection(data),
  });
};

export const useTestConnection = () => {
  return useMutation({
    mutationFn: (data) => databaseAPI.testConnection(data),
  });
};

export const useTables = (connectionId) => {
  return useQuery({
    queryKey: ['tables', connectionId],
    queryFn: () => databaseAPI.getTables(connectionId),
    enabled: !!connectionId,
  });
};
