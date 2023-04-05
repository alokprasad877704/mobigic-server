import jwt from "jsonwebtoken";

export const generateToken = (
  details: any,
  secretKey: string = process.env.JWT_PRIVATE_KEY!
) => {
  return jwt.sign(details, secretKey, { expiresIn: "24h" });
};


