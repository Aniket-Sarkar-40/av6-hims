import bcrypt from "bcrypt";

export const hashPasswordBcrypt = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPasswordBcrypt = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export async function encryptPassword(password: string) {
  const rounds = 10;
  const hashedPassword = await bcrypt.hash(password, rounds);
  const storePassword = hashedPassword.replace(/^\$2b\$/, "$2y$");
  return storePassword;
}

export async function verifyPassword(password: string, hashedPassword: string) {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}
