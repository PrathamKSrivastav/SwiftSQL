import { useQuery, useMutation } from '@tanstack/react-query';
import { queryAPI } from '../services/api';

export const useExecuteQuery = () => {
  return useMutation({
    mutationFn: (data) => queryAPI.executeQuery(data),
  });
};

export const useQueryHistory = () => {
  return useQuery({
    queryKey: ['queryHistory'],
    queryFn: () => queryAPI.getHistory(),
  });
};

export const useSaveQuery = () => {
  return useMutation({
    mutationFn: (data) => queryAPI.saveQuery(data),
  });
};
