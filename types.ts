export type UserRole = 'traveler' | 'provider';

export interface User {
  id: string;
  fullName: string;
  mobile: string;
  role: UserRole;
  profession?: string; // e.g. 'Electrician', 'Mechanic'
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export enum AppView {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD'
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  distance: string; // e.g. "1.2 km"
  address: string;
  mobile: string;
  isOpen: boolean;
  description?: string;
}