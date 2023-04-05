require("dotenv").config();
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import { Result } from "../interfaces/result";
import logger from "../utils/logger";

// Set the AWS Region.
export const REGION = "ap-south-1";
const credentials = {
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
};

// Create an Amazon S3 service client object.
export const s3Client = new S3Client({
  region: REGION,
  credentials,
});

export interface IUploadFileToS3Response {
  s3Url: string;
  bucketPath: string;
}

export const uploadToS3 = async (
  s3FilePathKey: string,
  filePath: string
): Promise<Result<IUploadFileToS3Response>> => {
  try {
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
      Bucket: process.env.MOBIGIC_S3_BUCKET_NAME,
      // Add the required 'Key' parameter e.g. - `${userId}/{fileName}`
      Key: s3FilePathKey,
      // Add the required 'Body' parameter
      Body: fileStream,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    return Result.ok({
      s3Url: `https://${uploadParams.Bucket}.s3.${REGION}.amazonaws.com/${uploadParams.Key}`,
      bucketPath: `${uploadParams.Bucket}/${uploadParams.Key}`,
    });
  } catch (err) {
    logger.error(`at: "helpers/uploadToS3" => ${JSON.stringify(err)}\n${err}`);
    return Result.error(err);
  }
};

export const deleteFromS3 = async (s3FilePathKey: string): Promise<Result> => {
  try {
    const deleteParams = {
      Bucket: process.env.MOBIGIC_S3_BUCKET_NAME,
      // Add the required 'Key' parameter e.g. - `${userId}/{fileName}`
      Key: s3FilePathKey,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));

    return Result.ok();
  } catch (err) {
    logger.error(
      `at: "helpers/deleteFromS3" => ${JSON.stringify(err)}\n${err}`
    );
    return Result.error(err);
  }
};
