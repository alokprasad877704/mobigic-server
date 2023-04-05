import STATUS from "../constants/statusCode";
import { CustomError } from "../middlewares/error";

export class Result<RS = unknown> {
  private readonly success: boolean;
  public readonly data?: RS;
  public readonly error?: CustomError;

  private constructor(success: boolean, data?: RS, error?: CustomError) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  isOk(): boolean {
    return this.success;
  }

  isError(): boolean {
    return !this.success;
  }

  static ok<T>(data?: T): Result<T> {
    return new Result<T>(true, data);
  }

  static error(error?: any): Result<any> {
    const err: CustomError = {
      statusCode: error?.statusCode ?? STATUS.INTERNAL_SERVER_ERROR,
      customMessage: error
        ? error?.customMessage ?? error
        : "Internal Server Error, Please Contact ADMIN",
    };

    return new Result<any>(false, null, err);
  }
}
