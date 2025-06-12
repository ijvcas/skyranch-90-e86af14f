
export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'worker';
  is_active: boolean;
  created_at: string;
  created_by?: string;
}
