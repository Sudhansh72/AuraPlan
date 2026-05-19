import client from './client';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/plan';

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/api/auth/register', data);
  return response.data;
};

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/api/auth/login', data);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await client.get<User>('/api/auth/me');
  return response.data;
};
