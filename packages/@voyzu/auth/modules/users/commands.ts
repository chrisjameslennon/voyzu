import "server-only";

import {
  UserBatchPatchRequestDto,
  UserBatchUpdateRequestDto,
  UserCreateRequestDto,
  UserPasswordUpdateRequestDto,
  UserPatchRequestDto,
  UserProfileUpdateRequestDto,
  UserResponseDto,
  UserUpdateRequestDto,
} from "@voyzu/auth/types";
import { command } from "@voyzu/capability/commands";
import { Filter, ListOptions } from "@voyzu/types";
import Type, { type TSchema } from "typebox";

const UserList = Type.Array(UserResponseDto);
const Codes = Type.Array(Type.String());
const OptionalListOptions = (first: TSchema) =>
  Type.Union([Type.Tuple([first]), Type.Tuple([first, ListOptions])]);

const loadUserService = () => import("./server/lib/user.service");
const loadCurrentUserService = () => import("./server/lib/current-user.service");

export const listUsers = command.defineLazy(
  { parameters: Type.Tuple([]), result: UserList },
  () => loadUserService().then((module) => module.listUsers),
);
export const filterUsers = command.defineLazy(
  { parameters: OptionalListOptions(Type.Array(Filter)), result: UserList },
  () => loadUserService().then((module) => module.filterUsers),
);
export const searchUsers = command.defineLazy(
  { parameters: OptionalListOptions(Type.String()), result: UserList },
  () => loadUserService().then((module) => module.searchUsers),
);
export const getUser = command.defineLazy(
  {
    parameters: Type.Tuple([Type.String()]),
    result: Type.Union([UserResponseDto, Type.Null()]),
  },
  () => loadUserService().then((module) => module.getUser),
);
export const updateCurrentUserProfile = command.defineLazy(
  { parameters: Type.Tuple([UserProfileUpdateRequestDto]), result: UserResponseDto },
  () => loadUserService().then((module) => module.updateCurrentUserProfile),
);
export const changeCurrentUserPassword = command.defineLazy(
  { parameters: Type.Tuple([UserPasswordUpdateRequestDto]), result: Type.Undefined() },
  () => loadUserService().then((module) => module.changeCurrentUserPassword),
);
export const createUser = command.defineLazy(
  { parameters: Type.Tuple([UserCreateRequestDto]), result: UserResponseDto },
  () => loadUserService().then((module) => module.createUser),
);
export const changeUserPassword = command.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), UserPasswordUpdateRequestDto]),
    result: Type.Undefined(),
  },
  () => loadUserService().then((module) => module.changeUserPassword),
);
export const updateUser = command.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), UserUpdateRequestDto]),
    result: UserResponseDto,
  },
  () => loadUserService().then((module) => module.updateUser),
);
export const patchUser = command.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), UserPatchRequestDto]),
    result: UserResponseDto,
  },
  () => loadUserService().then((module) => module.patchUser),
);
export const deleteUser = command.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: Type.Undefined() },
  () => loadUserService().then((module) => module.deleteUser),
);
export const batchGetUsers = command.defineLazy(
  { parameters: Type.Tuple([Codes]), result: UserList },
  () => loadUserService().then((module) => module.batchGetUsers),
);
export const batchCreateUsers = command.defineLazy(
  { parameters: Type.Tuple([Type.Array(UserCreateRequestDto)]), result: UserList },
  () => loadUserService().then((module) => module.batchCreateUsers),
);
export const batchUpdateUsers = command.defineLazy(
  { parameters: Type.Tuple([Type.Array(UserBatchUpdateRequestDto)]), result: UserList },
  () => loadUserService().then((module) => module.batchUpdateUsers),
);
export const batchPatchUsers = command.defineLazy(
  { parameters: Type.Tuple([Type.Array(UserBatchPatchRequestDto)]), result: UserList },
  () => loadUserService().then((module) => module.batchPatchUsers),
);
export const activateUser = command.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: UserResponseDto },
  () => loadUserService().then((module) => module.activateUser),
);
export const deactivateUser = command.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: UserResponseDto },
  () => loadUserService().then((module) => module.deactivateUser),
);
export const batchDeleteUsers = command.defineLazy(
  { parameters: Type.Tuple([Codes]), result: Type.Undefined() },
  () => loadUserService().then((module) => module.batchDeleteUsers),
);
export const activateUsers = command.defineLazy(
  { parameters: Type.Tuple([Codes]), result: UserList },
  () => loadUserService().then((module) => module.activateUsers),
);
export const deactivateUsers = command.defineLazy(
  { parameters: Type.Tuple([Codes]), result: UserList },
  () => loadUserService().then((module) => module.deactivateUsers),
);
export const getCurrentUser = command.defineLazy(
  {
    parameters: Type.Tuple([]),
    result: Type.Union([UserResponseDto, Type.Null()]),
  },
  () => loadCurrentUserService().then((module) => module.getCurrentUser),
);
export const currentUserCanManageUsers = command.defineLazy(
  { parameters: Type.Tuple([]), result: Type.Boolean() },
  () => loadCurrentUserService().then((module) => module.currentUserCanManageUsers),
);

export const commands = {
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
} as const;
