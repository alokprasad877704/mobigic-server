import bcrypt from "bcrypt";

export const hashString = (str: string): string => {
  return bcrypt.hashSync(str, 10);
};

export const validateHashedString = (
  simpleString: string,
  hashedString: string
): Promise<boolean> => {
  return bcrypt.compare(simpleString, hashedString);
};
