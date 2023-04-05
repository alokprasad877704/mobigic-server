export interface ICreateUser {
  userName: string;
  password: string;
}

export interface IStoredUser extends ICreateUser {
  id: number;
  createdAt: Date;
}

export interface IStoreUserResult {
  id: number;
}
