import jwt, { JwtPayload, Secret } from "jsonwebtoken";

type TokenPayload = {
  userId: string;
  email: string;
  role: string;
};

const generateToken = (
  payload: TokenPayload,
  secret: Secret,
  expireIn: string
) => {
  const token = jwt.sign(payload, secret, { expiresIn: expireIn });
  return token;
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload; //returns the payload as a JwtPayload object.
};
export const jwtHelper = {
  generateToken,
  verifyToken,
};
