import { hashString, validateHashedString } from "../helpers/bcrypt";
import { generalRandomNumber } from "../helpers/number";
import {
  IUploadFileToS3Response,
  deleteFromS3,
  uploadToS3,
} from "../helpers/aws-s3";
import {
  IDeleteFileRequest,
  IFileUploadRequest,
  IListUserFiles,
  IStoreUserFile,
  IUserFileDetails,
  IVerifyFileUniqueCodeRequest,
} from "../interfaces/file";
import { Result } from "../interfaces/result";
import { IStoredUser } from "../interfaces/user";
import * as userRepo from "../repositories/users";
import * as filesRepo from "../repositories/files";
import logger from "../utils/logger";

const uploadFile = async (data: IFileUploadRequest) => {
  try {
    // check if user with this userId exists
    const isUserExists: Result<IStoredUser[] | any> =
      await userRepo.fetchUserById(data.userId);

    if (isUserExists.isError()) {
      throw isUserExists.error;
    }

    // If userName doesn't exist throw an error
    if (!isUserExists.data?.length) {
      return Result.error("User does not exist");
    }

    const filePath = data.file.path;
    const s3FilePathKey = `${data.userId}/${data.file.originalname}`;

    // upload the file to s3
    const s3UploadResult: Result<IUploadFileToS3Response> = await uploadToS3(
      s3FilePathKey,
      filePath
    );

    // error response if there is error uploading the file
    if (s3UploadResult.isError()) {
      return Result.error({
        customMessage: "Error uploading file to S3, please try again later",
      });
    }

    // call helper function to general six digit unique code
    const sixDigitUniqueCode: number = generalRandomNumber(6);

    // get the hashed value of the unique code to be stored in the database
    const hashedUniqueCode = hashString(sixDigitUniqueCode.toString());

    // file data to be stored in the database
    const fileDetails: IStoreUserFile = {
      file_url: s3UploadResult.data?.s3Url!,
      user_id: data.userId,
      file_name: data.file.originalname,
      unique_code: hashedUniqueCode,
    };

    const storeUserFileResult: Result = await filesRepo.createUserFile(
      fileDetails
    );

    // throw if error storing file details into database
    if (storeUserFileResult.isError()) {
      throw storeUserFileResult.error;
    }

    // return the six digit unique id if successful
    return Result.ok({ uniqueHexCode: sixDigitUniqueCode });
  } catch (error) {
    //logging the error
    logger.error(
      `at: "controllers/files/uploadFile" => ${JSON.stringify(error)}\n${error}`
    );

    return Result.error(error);
  }
};

// userFiles by userId
const findFilesByUserId = async (
  userId: number
): Promise<Result<IListUserFiles[]>> => {
  try {
    // check if user with this userId exists
    const isUserExists: Result<IStoredUser[] | any> =
      await userRepo.fetchUserById(userId);

    if (isUserExists.isError()) {
      throw isUserExists.error;
    }

    // If userName doesn't exist throw an error
    if (!isUserExists.data?.length) {
      return Result.error("User does not exist");
    }

    // retrieve all files for the user
    const retrievedUserFiles: Result<IListUserFiles[]> =
      await filesRepo.retrieveFilesByUserId(userId);

    // throw if any error
    if (retrievedUserFiles.isError()) {
      throw retrievedUserFiles.error;
    }

    return Result.ok(retrievedUserFiles.data);
  } catch (error) {
    //logging the error
    logger.error(
      `at: "controllers/files/findFilesByUserId" => ${JSON.stringify(
        error
      )}\n${error}`
    );

    return Result.error(error);
  }
};

const deleteUserFile = async (data: IDeleteFileRequest) => {
  try {
    const isFileExists: Result<IUserFileDetails> = await filesRepo.findFileById(
      data.fileId,
      data.userId
    );

    if (isFileExists.isError()) {
      throw isFileExists.error;
    }

    if (!isFileExists.data) {
      return Result.error({
        customMessage: `File with fileId ${data.fileId} and userId ${data.userId} does not exist`,
      });
    }

    // get the path key to be used to delete the file from s3 bucket
    const s3FilePathKey = isFileExists.data.file_url.split("amazonaws.com/")[1];

    const s3DeleteResult: Result = await deleteFromS3(s3FilePathKey);

    // throw if any error happens
    if (s3DeleteResult.isError()) {
      throw s3DeleteResult.error;
    }

    // delete the entry from database once file is successfully deleted from file system
    const result: Result = await filesRepo.deleteFile(data.fileId);

    // throw in case of error
    if (result.isError()) {
      throw result.error;
    }

    return Result.ok();
  } catch (error) {
    //logging the error
    logger.error(
      `at: "controllers/files/deleteUserFile" => ${JSON.stringify(
        error
      )}\n${error}`
    );
    return Result.error(error);
  }
};

const verifyUniqueCode = async (data: IVerifyFileUniqueCodeRequest) => {
  try {
    const fileDetails: Result<IUserFileDetails> = await filesRepo.findFileById(
      data.fileId,
      data.userId
    );

    if (fileDetails.isError()) {
      throw fileDetails.error;
    }

    if (!fileDetails.data) {
      return Result.error({
        customMessage: `File with fileId ${data.fileId} and userId ${data.userId} does not exist`,
      });
    }

    const isValidUniqueCode = await validateHashedString(
      data.uniqueCode,
      fileDetails.data.unique_code
    );

    if (!isValidUniqueCode) {
      return Result.error({
        customMessage:
          "Invalid unique code. Please enter a valid unique code to download the file",
      });
    }

    return Result.ok(fileDetails.data);
  } catch (error) {
    //logging the error
    logger.error(
      `at: "controllers/files/verifyUniqueCode" => ${JSON.stringify(
        error
      )}\n${error}`
    );
    return Result.error(error);
  }
};

export default {
  uploadFile,
  findFilesByUserId,
  deleteUserFile,
  verifyUniqueCode,
};
