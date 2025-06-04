
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'worker';
  createdAt: string;
  isActive: boolean;
}

interface UserStore {
  users: User[];
  currentUser: User | null;
}

// Initialize with some sample data and current user
const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Admin Usuario',
    email: 'admin@granja.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria@granja.com',
    role: 'manager',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos@granja.com',
    role: 'worker',
    createdAt: new Date().toISOString(),
    isActive: false
  }
];

const currentUser: User = defaultUsers[0]; // Admin user

// Load users from localStorage or use defaults
const loadUsers = (): User[] => {
  try {
    const stored = localStorage.getItem('farmUsers');
    if (stored) {
      const users = JSON.parse(stored);
      console.log('Loaded users from storage:', users.length, 'users');
      return users;
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return defaultUsers;
};

// Save users to localStorage
const saveUsers = (users: User[]) => {
  try {
    localStorage.setItem('farmUsers', JSON.stringify(users));
    console.log('Saved users to storage:', users.length, 'users');
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

let userStore: UserStore = {
  users: loadUsers(),
  currentUser
};

export const getAllUsers = (): User[] => {
  console.log('Getting all users, count:', userStore.users.length);
  return userStore.users;
};

export const getCurrentUser = (): User | null => {
  return userStore.currentUser;
};

export const addUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  userStore.users.push(newUser);
  saveUsers(userStore.users);
  console.log('Added new user:', newUser.name);
  return newUser;
};

export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const userIndex = userStore.users.findIndex(user => user.id === id);
  if (userIndex === -1) return null;
  
  userStore.users[userIndex] = { ...userStore.users[userIndex], ...updates };
  saveUsers(userStore.users);
  console.log('Updated user:', id);
  return userStore.users[userIndex];
};

export const deleteUser = (id: string): boolean => {
  const initialLength = userStore.users.length;
  userStore.users = userStore.users.filter(user => user.id !== id);
  
  if (userStore.users.length < initialLength) {
    saveUsers(userStore.users);
    console.log('Deleted user:', id);
    return true;
  }
  return false;
};

export const toggleUserStatus = (id: string): User | null => {
  const user = userStore.users.find(user => user.id === id);
  if (user) {
    user.isActive = !user.isActive;
    saveUsers(userStore.users);
    console.log('Toggled user status:', id, 'active:', user.isActive);
    return user;
  }
  return null;
};

export const getUsersByRole = (role: User['role']): User[] => {
  return userStore.users.filter(user => user.role === role);
};

export const getActiveUsers = (): User[] => {
  return userStore.users.filter(user => user.isActive);
};

export const clearAllUsers = (): void => {
  userStore.users = [currentUser]; // Keep current admin user
  saveUsers(userStore.users);
  console.log('Cleared all users except admin');
};

export const debugUserStore = (): void => {
  console.log('=== USER STORE DEBUG ===');
  console.log('Total users:', userStore.users.length);
  console.log('Active users:', getActiveUsers().length);
  console.log('Current user:', userStore.currentUser?.name);
  console.log('Users by role:');
  console.log('- Admins:', getUsersByRole('admin').length);
  console.log('- Managers:', getUsersByRole('manager').length);
  console.log('- Workers:', getUsersByRole('worker').length);
  console.log('All users:', userStore.users);
  console.log('========================');
};
