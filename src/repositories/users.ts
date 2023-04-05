import { Result } from "../interfaces/result";
import { ICreateUser } from "../interfaces/user";
import { db } from "../db_init/dbConn";
import logger from "../utils/logger";

export const fetchUserByUserName = async (
  userName: string
): Promise<Result> => {
  try {
    const result = await db.query(`SELECT * from users WHERE user_name= $1`, [
      userName,
    ]);

    return Result.ok(result);
  } catch (err) {
    logger.error(
      `at: repositories/users/fetchUserByUserName => ${err} \n ${JSON.stringify(
        err
      )}`
    );

    return Result.error(`Error fetching user => ${err}`);
  }
};

export const fetchUserById = async (userId: number): Promise<Result> => {
  try {
    const result = await db.query(`SELECT * from users WHERE id= $1`, [userId]);

    return Result.ok(result);
  } catch (err) {
    logger.error(
      `at: repositories/users/fetchUserById => ${err} \n ${JSON.stringify(err)}`
    );

    return Result.error(`Error fetching user => ${err}`);
  }
};

export const addUser = async (data: ICreateUser): Promise<Result> => {
  try {
    const result = await db.one(
      `INSERT INTO users (user_name, password) VALUES ($1, $2) returning id`,
      [data.userName, data.password]
    );

    return Result.ok(result);
  } catch (err) {
    logger.error(
      `at: repositories/users/addUser => ${err} \n ${JSON.stringify(err)}`
    );

    return Result.error(`Error adding user => ${err}`);
  }
};
