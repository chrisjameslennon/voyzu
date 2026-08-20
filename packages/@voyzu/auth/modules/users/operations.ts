import "server-only";

import * as currentUserService from "./server/lib/current-user.service";
import * as userService from "./server/lib/user.service";

function operation<TArgs extends unknown[], TResult>(service: (...args: TArgs) => TResult) {
  return (...args: TArgs): TResult => service(...args);
}

export const listUsers = operation(userService.listUsers);
export const filterUsers = operation(userService.filterUsers);
export const searchUsers = operation(userService.searchUsers);
export const getUser = operation(userService.getUser);
export const updateCurrentUserProfile = operation(userService.updateCurrentUserProfile);
export const changeCurrentUserPassword = operation(userService.changeCurrentUserPassword);
export const createUser = operation(userService.createUser);
export const changeUserPassword = operation(userService.changeUserPassword);
export const updateUser = operation(userService.updateUser);
export const patchUser = operation(userService.patchUser);
export const replaceUserCompanyAccess = operation(userService.replaceUserCompanyAccess);
export const deleteUser = operation(userService.deleteUser);
export const batchGetUsers = operation(userService.batchGetUsers);
export const batchCreateUsers = operation(userService.batchCreateUsers);
export const batchUpdateUsers = operation(userService.batchUpdateUsers);
export const batchPatchUsers = operation(userService.batchPatchUsers);
export const activateUser = operation(userService.activateUser);
export const deactivateUser = operation(userService.deactivateUser);
export const batchDeleteUsers = operation(userService.batchDeleteUsers);
export const activateUsers = operation(userService.activateUsers);
export const deactivateUsers = operation(userService.deactivateUsers);
export const getCurrentUser = operation(currentUserService.getCurrentUser);
export const currentUserCanManageUsers = operation(currentUserService.currentUserCanManageUsers);
export const getCurrentActorType = operation(currentUserService.getCurrentActorType);

export const operations = {
  listUsers,
  filterUsers,
  searchUsers,
  getUser,
  updateCurrentUserProfile,
  changeCurrentUserPassword,
  createUser,
  changeUserPassword,
  updateUser,
  patchUser,
  replaceUserCompanyAccess,
  deleteUser,
  batchGetUsers,
  batchCreateUsers,
  batchUpdateUsers,
  batchPatchUsers,
  activateUser,
  deactivateUser,
  batchDeleteUsers,
  activateUsers,
  deactivateUsers,
  getCurrentUser,
  currentUserCanManageUsers,
  getCurrentActorType,
} as const;
