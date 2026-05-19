import apiClient from './client';
import type { BotChatRequest, BotChatResponse } from '../types/bot';

export const sendBotMessage = async (data: BotChatRequest): Promise<BotChatResponse> => {
  const response = await apiClient.post<BotChatResponse>('/api/bot/chat', data);
  return response.data;
};
