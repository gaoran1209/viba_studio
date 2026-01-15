import api from '../utils/api';

export interface ImageData {
  filename: string;
  storage_url: string;
}

export interface GenerationRecord {
  id: string;
  user_id: string;
  type: 'derivation' | 'avatar' | 'try_on' | 'swap';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_images: ImageData[];
  output_images: ImageData[];
  parameters: Record<string, any>;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface CreateGenerationData {
  type: 'derivation' | 'avatar' | 'try_on' | 'swap';
  input_images: ImageData[];
  parameters: Record<string, any>;
}

export interface GenerationsResponse {
  total: number;
  items: GenerationRecord[];
}

export const saveGeneration = async (
  data: CreateGenerationData
): Promise<GenerationRecord> => {
  const response = await api.post('/api/v1/generations', data);
  return response.data;
};

export const updateGeneration = async (
  id: string,
  data: Partial<GenerationRecord>
): Promise<GenerationRecord> => {
  const response = await api.put(`/api/v1/generations/${id}`, data);
  return response.data;
};

export const fetchGenerations = async (params: {
  type?: string;
  limit?: number;
  offset?: number;
}): Promise<GenerationsResponse> => {
  const response = await api.get('/api/v1/generations', { params });
  return response.data;
};

export const fetchGenerationById = async (id: string): Promise<GenerationRecord> => {
  const response = await api.get(`/api/v1/generations/${id}`);
  return response.data;
};

export const deleteGeneration = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/generations/${id}`);
};
