import client from './client';
import type { EventRequest, EventPlan, EventHistoryItem } from '../types/plan';

export const generatePlan = async (formData: EventRequest): Promise<EventPlan> => {
  const response = await client.post<EventPlan>('/api/plan/generate', formData);
  return response.data;
};

export const getPlanHistory = async (): Promise<EventHistoryItem[]> => {
  const response = await client.get<EventHistoryItem[]>('/api/plan/history');
  return response.data;
};

export const updatePlan = async (eventId: string, updateData: any): Promise<EventHistoryItem> => {
  const response = await client.put<EventHistoryItem>(`/api/plan/${eventId}`, updateData);
  return response.data;
};

export const optimizePlan = async (plan: EventPlan, instruction?: string): Promise<EventPlan> => {
  const response = await client.post<EventPlan>('/api/plan/optimize', plan, {
    params: { instruction }
  });
  return response.data;
};
