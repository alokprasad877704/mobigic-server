export interface IFileUploadResponse {
  uniqueHexCode: string;
}

export interface IFileUploadRequest {
  file: any;
  userId: number;
}

export interface IStoreUserFile {
  file_url: string;
  user_id: number;
  file_name: string;
  unique_code: string;
}

export interface IUserFileDetails extends IStoreUserFile {
  id: number;
  uploaded_at: Date;
}

//? not passing file_url while listing files as file is allowed to be downloaded only if unique hex code is verified
export interface IListUserFiles
  extends Omit<IUserFileDetails, "file_url" | "unique_code"> {}

export interface IDeleteFileRequest {
  fileId: number;
  userId: number;
}

export interface IVerifyFileUniqueCodeRequest {
  userId: number;
  fileId: number;
  uniqueCode: string;
}
