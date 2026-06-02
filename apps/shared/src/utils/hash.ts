import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
  const saltRounds = 12;
  // bcryptjs provides sync methods; using sync here for compatibility
  return bcrypt.hashSync(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}
