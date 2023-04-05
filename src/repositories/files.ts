import { Result } from "../interfaces/result";
import { db } from "../db_init/dbConn";
import logger from "../utils/logger";
import {
  IListUserFiles,
  IStoreUserFile,
  IUserFileDetails,
} from "../interfaces/file";
import STATUS from "../constants/statusCode";

export const createUserFile = async (
  fileDetails: IStoreUserFile
): Promise<Result> => {
  try {
    const result = await db.one(
      `INSERT INTO files (file_url, user_id, file_name, unique_code) VALUES ($1, $2, $3, $4) returning id`,
      [
        fileDetails.file_url,
        fileDetails.user_id,
        fileDetails.file_name,
        fileDetails.unique_code,
      ]
    );

    return Result.ok(result);
  } catch (err) {
    logger.error(
      `at: repositories/files/createUserFile => ${err} \n ${JSON.stringify(
        err
      )}`
    );

    return Result.error(`Error storing user file into database => ${err}`);
  }
};

export const retrieveFilesByUserId = async (
  userId: number
): Promise<Result<IListUserFiles[]>> => {
  try {
    const userFiles = await db.query(
      `SELECT id, file_name, uploaded_at from files WHERE user_id= $1`,
      [userId]
    );

    return Result.ok(userFiles);
  } catch (error) {
    // logging the error
    logger.error(
      `at:"repositories/files/retrieveFilesByUserId" => ${JSON.stringify(
        error
      )}\n${error}`
    );

    return Result.error(error);
  }
};

export const findFileById = async (
  fileId: number,
  userId: number
): Promise<Result<IUserFileDetails>> => {
  try {
    const result = await db.oneOrNone(
      `SELECT * from files where id = $1 and user_id = $2`,
      [fileId, userId]
    );

    return Result.ok(result);
  } catch (error) {
    //logging the error
    logger.error(
      `at: "repositories/files/findFileById" => ${JSON.stringify(
        error
      )}\n${error}`
    );
    return Result.error(error);
  }
};

export const deleteFile = async (fileId: number): Promise<Result> => {
  try {
    await db.none(`DELETE from files where id = $1`, [fileId]);

    return Result.ok();
  } catch (error) {
    // logging the error
    logger.error(
      `at:"repositories/files/deleteFile" => ${JSON.stringify(error)}\n${error}`
    );

    return Result.error({
      statusCode: STATUS.BAD_REQUEST,
      customMessage: `Unable to delete file with id ${fileId}`,
    });
  }
};
