
// Main user service - re-exports all functionality for backward compatibility
export { type AppUser } from './user/types';
export { validatePhoneNumber, formatPhoneNumber } from './user/validation';
export { getAllUsers, getCurrentUser, syncAuthUsersToAppUsers } from './user/userQueries';
export { addUser, updateUser, deleteUser, toggleUserStatus } from './user/userMutations';
