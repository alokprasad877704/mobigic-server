import express, { Request, Response, NextFunction } from "express";
import { CustomError } from "../middlewares/error";
import STATUS from "../constants/statusCode";
import filesController from "../controllers/files";
import { Result } from "../interfaces/result";
import {
  IDeleteFileRequest,
  IFileUploadRequest,
  IFileUploadResponse,
  IListUserFiles,
  IUserFileDetails,
  IVerifyFileUniqueCodeRequest,
} from "../interfaces/file";
import fs from "fs";

import multer from "multer";
import auth from "../middlewares/auth";

const router = express.Router();

// function to generate date string to be appended with file name to make it unique
function getDateString() {
  let date = new Date();
  let year = date.getFullYear() + "_";
  let month = `${date.getMonth() + 1}`.padStart(2, "0") + "-";
  let day = `${date.getDate()}`.padStart(2, "0") + "-";
  let hour = `${date.getHours()}` + "-";
  let minutes = `${date.getMinutes()}` + "-";
  let seconds = `${date.getSeconds()}` + "-";
  let milliSeconds = `${date.getMilliseconds()}`;
  return `${day}${month}${year}${hour}${minutes}${seconds}${milliSeconds}`;
}

// Defining the storage that will be used to store multer files in temporarily
let storage = multer.diskStorage({
  destination: "./src/uploads/",

  // We create the filename by taking the original name and adding date string to it
  filename: function (_req: any, file: any, cb: any) {
    let fileOrignalnameWithExt = file.originalname.split(".");

    cb(
      null,
      fileOrignalnameWithExt[0] +
        "_" +
        getDateString() +
        "." +
        fileOrignalnameWithExt[1]
    );
  },
});

// upload contains the path where multer will temporarily store files
let upload = multer({ storage: storage, limits: { fileSize: 50000000 } });

router.post(
  "/upload",
  auth,
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = (req as any).file;
    try {
      const { id } = req.user;

      // error if file not found
      if (!file) {
        // Throw an error if file is not provided
        const err: CustomError = {
          statusCode: STATUS.BAD_REQUEST,
          customMessage: "File not found",
        };

        throw err;
      }

      // error if id is not provided with the bearer token
      if (!id) {
        // Throw an error if file is not provided
        const err: CustomError = {
          statusCode: STATUS.BAD_REQUEST,
          customMessage: "UserId not provided",
        };

        throw err;
      }

      // create request body
      const requestBody: IFileUploadRequest = {
        file,
        userId: id as number,
      };

      // controller call to upload file to the S3 bucket and update uploaded file url into the database
      const result: Result<IFileUploadResponse> =
        await filesController.uploadFile(requestBody);

      // If there is any error throw the error
      if (result.isError()) {
        throw result.error;
      }

      deleteFiles([file]);

      res.status(STATUS.OK).json({
        message: "Successfully uploaded file to s3",
        uniqueHexCode: result.data?.uniqueHexCode,
      });
    } catch (error) {
      if (file) deleteFiles([file]);
      next(error);
    }
  }
);

// route to get file for userId
router.get(
  "/:userId",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      // Verify request body
      //? Here checking for "undefined" and "null" as string because sometimes undefined values converted to string passed as param
      if (!userId || userId === "undefined" || userId === "null") {
        // Throw an error if userId is not provided
        const err: CustomError = {
          statusCode: STATUS.BAD_REQUEST,
          customMessage: "userId is required",
        };

        throw err;
      }

      // If userId is present the find files for that user
      const result: Result<IListUserFiles[]> =
        await filesController.findFilesByUserId(parseInt(userId));

      // If there is any error throw the error
      if (result.isError()) {
        throw result.error;
      }

      // Return success response
      res.status(STATUS.OK).json({
        status: STATUS.OK,
        data: result.data,
        message: `Files successfully retrieved for userId ${userId}`,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:fileId",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileId } = req.params;
      const { id } = req.user;

      // error if fileId is undefined or null
      if (!fileId || fileId === "undefined" || fileId === "null") {
        // Throw an error
        const err: CustomError = {
          statusCode: STATUS.BAD_REQUEST,
          customMessage: "FileId is required",
        };

        throw err;
      }

      // error if id is not provided with the bearer token
      if (!id) {
        // Throw an error if file is not provided
        const err: CustomError = {
          statusCode: STATUS.BAD_REQUEST,
          customMessage: "UserId not provided",
        };

        throw err;
      }

      const data: IDeleteFileRequest = {
        fileId: parseInt(fileId),
        userId: parseInt(id),
      };

      const result: Result = await filesController.deleteUserFile(data);

      // If there is any error, throw the error
      if (result.isError()) {
        throw result.error;
      }

      // Return success response
      res.status(STATUS.OK).json({
        status: STATUS.OK,
        message: `File with id ${fileId} deleted successfully for user ${id}`,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/verify",
  auth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.user;

      const { fileId, uniqueCode } = req.body;

      // validate request body
      if (!fileId || !uniqueCode) {
        // Throw an error if fileId and uniqueCode are not provided
        const err: CustomError = {
          statusCode: STATUS.BAD_REQUEST,
          customMessage: "fileId and uniqueCode are required",
        };

        throw err;
      }

      // error if id is not provided with the bearer token
      if (!id) {
        // Throw an error if file is not provided
        const err: CustomError = {
          statusCode: STATUS.BAD_REQUEST,
          customMessage: "UserId not provided",
        };

        throw err;
      }

      const data: IVerifyFileUniqueCodeRequest = {
        userId: parseInt(id),
        fileId: parseInt(fileId),
        uniqueCode,
      };

      // call controller function to verify unique code and return file details
      const result: Result<IUserFileDetails> =
        await filesController.verifyUniqueCode(data);

      // If there is any error throw the error
      if (result.isError()) {
        throw result.error;
      }

      // Return success response
      res.status(STATUS.OK).json({
        status: STATUS.OK,
        data: result.data,
        message: `Successfully verified unique code for the file with id ${fileId}`,
      });
    } catch (err) {
      next(err);
    }
  }
);

const deleteFiles = (files: any) => {
  for (const file in files) {
    fs.unlinkSync(files[file].path);
  }
};

export default router;
