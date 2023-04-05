import { Result } from "../interfaces/result";
import { ICreateUser, IStoredUser } from "../interfaces/user";
import * as userRepo from "../repositories/users";
import logger from "../utils/logger";

export const addUser = async (data: ICreateUser) => {
  try {
    // Check if user with this userName already exists
    const isUserExists: Result<IStoredUser[] | any> =
      await userRepo.fetchUserByUserName(data.userName);

    // throws as error if user exist
    if (isUserExists?.data && isUserExists.data?.length > 0) {
      return Result.error("User already exists with this userName");
    }

    // calling repo function to store data
    const addUserResult: Result = await userRepo.addUser(data);
    // If there is any error then throw error
    if (addUserResult.isError()) {
      throw addUserResult.error;
    }

    return Result.ok(addUserResult.data);
  } catch (error) {
    return Result.error(error);
  }
};

export const fetchUserDetails = async (userName: string) => {
  try {
    // To check whether user exists with this userName
    const isUserExists: Result<IStoredUser[] | any> =
      await userRepo.fetchUserByUserName(userName);

    if (isUserExists.isError()) {
      throw isUserExists.error;
    }

    // If userName doesn't exist throw an error
    if (!isUserExists.data?.length) {
      return Result.error("User Name doesn't exist!");
    }

    // return user details if exists
    return Result.ok(isUserExists.data[0]);
  } catch (error) {
    // logging the error
    logger.error(
      `at: "controllers/users/fetchUserDetails" => ${JSON.stringify(
        error
      )}\n${error}`
    );

    // return negative response
    return Result.error("Error fetching user details");
  }
};
