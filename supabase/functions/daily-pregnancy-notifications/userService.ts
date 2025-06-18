
import { User } from './types.ts';

export class UserService {
  constructor(private supabase: any) {}

  async getActiveUsers(): Promise<{
    users: User[] | null;
    error: any;
  }> {
    const { data: users, error } = await this.supabase
      .from('app_users')
      .select('id, email')
      .eq('is_active', true);

    return { users, error };
  }
}
