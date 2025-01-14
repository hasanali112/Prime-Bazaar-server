import jwt, { Secret } from "jsonwebtoken";

type TokenPayload = {
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

export const jwtHelper = {
  generateToken,
};
