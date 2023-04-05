import express, { Request, Response, NextFunction } from "express";
import { ICreateUser, IStoreUserResult, IStoredUser } from "../interfaces/user";
import { CustomError } from "../middlewares/error";
import STATUS from "../constants/statusCode";
import * as userController from "../controllers/users";
import { Result } from "../interfaces/result";
import { hashString, validateHashedString } from "../helpers/bcrypt";
import { generateToken } from "../helpers/jwt";

const router = express.Router();

router.post(
  "/sign-up",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userName, password } = req.body;

      // validate request body
      if (!userName || !password) {
        // Throw an error if any parameter is not provided
        const err: CustomError = {
          statusCode: STATUS.BAD_REQUEST,
          customMessage: `userName and password are required`,
        };

        throw err;
      }

      const data: ICreateUser = {
        userName,
        password: hashString(password),
      };

      // controller call to save user details
      const result: Result<IStoreUserResult> = await userController.addUser(
        data
      );
      if (result.isError()) {
        throw result.error;
      }

      // generate jwt token
      const token = generateToken(result.data);

      res.status(STATUS.OK).json({
        status: STATUS.OK,
        message: "Successfully registered user",
        userId: result.data?.id,
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/sign-in",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userName, password } = req.body;

      // validate request body
      if (!userName || !password) {
        // Throw an error if any parameter is not provided
        const err: CustomError = {
          statusCode: STATUS.BAD_REQUEST,
          customMessage: `userName and password are required`,
        };

        throw err;
      }

      // check if the user exists with the userName
      const isUserExists: Result<IStoredUser> =
        await userController.fetchUserDetails(userName);
      if (isUserExists.isError()) {
        throw isUserExists.error;
      }

      // validate password
      const isPasswordValid: boolean = await validateHashedString(
        password,
        isUserExists.data?.password!
      );

      if (!isPasswordValid) {
        // throw an error if entered password is invalid
        const err: CustomError = {
          statusCode: STATUS.BAD_REQUEST,
          customMessage: "Invalid password",
        };
        throw err;
      }

      // generate token
      const token = generateToken(isUserExists.data);

      res.status(STATUS.OK).json({
        status: STATUS.OK,
        message: "Successfully logged in",
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
