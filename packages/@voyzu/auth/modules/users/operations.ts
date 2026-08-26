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
import { operation } from "@voyzu/capability/operations";
import { Filter, ListOptions } from "@voyzu/types";
import Type, { type TSchema } from "typebox";

const UserList = Type.Array(UserResponseDto);
const Codes = Type.Array(Type.String());
const OptionalListOptions = (first: TSchema) =>
  Type.Union([Type.Tuple([first]), Type.Tuple([first, ListOptions])]);

const loadUserService = () => import("./server/lib/user.service");
const loadCurrentUserService = () => import("./server/lib/current-user.service");

export const listUsers = operation.defineLazy(
  { parameters: Type.Tuple([]), result: UserList },
  () => loadUserService().then((module) => module.listUsers),
);
export const filterUsers = operation.defineLazy(
  { parameters: OptionalListOptions(Type.Array(Filter)), result: UserList },
  () => loadUserService().then((module) => module.filterUsers),
);
export const searchUsers = operation.defineLazy(
  { parameters: OptionalListOptions(Type.String()), result: UserList },
  () => loadUserService().then((module) => module.searchUsers),
);
export const getUser = operation.defineLazy(
  {
    parameters: Type.Tuple([Type.String()]),
    result: Type.Union([UserResponseDto, Type.Null()]),
  },
  () => loadUserService().then((module) => module.getUser),
);
export const updateCurrentUserProfile = operation.defineLazy(
  { parameters: Type.Tuple([UserProfileUpdateRequestDto]), result: UserResponseDto },
  () => loadUserService().then((module) => module.updateCurrentUserProfile),
);
export const changeCurrentUserPassword = operation.defineLazy(
  { parameters: Type.Tuple([UserPasswordUpdateRequestDto]), result: Type.Undefined() },
  () => loadUserService().then((module) => module.changeCurrentUserPassword),
);
export const createUser = operation.defineLazy(
  { parameters: Type.Tuple([UserCreateRequestDto]), result: UserResponseDto },
  () => loadUserService().then((module) => module.createUser),
);
export const changeUserPassword = operation.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), UserPasswordUpdateRequestDto]),
    result: Type.Undefined(),
  },
  () => loadUserService().then((module) => module.changeUserPassword),
);
export const updateUser = operation.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), UserUpdateRequestDto]),
    result: UserResponseDto,
  },
  () => loadUserService().then((module) => module.updateUser),
);
export const patchUser = operation.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), UserPatchRequestDto]),
    result: UserResponseDto,
  },
  () => loadUserService().then((module) => module.patchUser),
);
export const deleteUser = operation.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: Type.Undefined() },
  () => loadUserService().then((module) => module.deleteUser),
);
export const batchGetUsers = operation.defineLazy(
  { parameters: Type.Tuple([Codes]), result: UserList },
  () => loadUserService().then((module) => module.batchGetUsers),
);
export const batchCreateUsers = operation.defineLazy(
  { parameters: Type.Tuple([Type.Array(UserCreateRequestDto)]), result: UserList },
  () => loadUserService().then((module) => module.batchCreateUsers),
);
export const batchUpdateUsers = operation.defineLazy(
  { parameters: Type.Tuple([Type.Array(UserBatchUpdateRequestDto)]), result: UserList },
  () => loadUserService().then((module) => module.batchUpdateUsers),
);
export const batchPatchUsers = operation.defineLazy(
  { parameters: Type.Tuple([Type.Array(UserBatchPatchRequestDto)]), result: UserList },
  () => loadUserService().then((module) => module.batchPatchUsers),
);
export const activateUser = operation.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: UserResponseDto },
  () => loadUserService().then((module) => module.activateUser),
);
export const deactivateUser = operation.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: UserResponseDto },
  () => loadUserService().then((module) => module.deactivateUser),
);
export const batchDeleteUsers = operation.defineLazy(
  { parameters: Type.Tuple([Codes]), result: Type.Undefined() },
  () => loadUserService().then((module) => module.batchDeleteUsers),
);
export const activateUsers = operation.defineLazy(
  { parameters: Type.Tuple([Codes]), result: UserList },
  () => loadUserService().then((module) => module.activateUsers),
);
export const deactivateUsers = operation.defineLazy(
  { parameters: Type.Tuple([Codes]), result: UserList },
  () => loadUserService().then((module) => module.deactivateUsers),
);
export const getCurrentUser = operation.defineLazy(
  {
    parameters: Type.Tuple([]),
    result: Type.Union([UserResponseDto, Type.Null()]),
  },
  () => loadCurrentUserService().then((module) => module.getCurrentUser),
);
export const currentUserCanManageUsers = operation.defineLazy(
  { parameters: Type.Tuple([]), result: Type.Boolean() },
  () => loadCurrentUserService().then((module) => module.currentUserCanManageUsers),
);

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
