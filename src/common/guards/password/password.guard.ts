import * as bcrypt from "bcrypt";

const saltOrRounds = 10;

export default class PasswordGuard {
  hashPassword(password: string): string | null {
    if (!password) {
      return null;
    }
    const salt = bcrypt.genSaltSync(saltOrRounds);
    return bcrypt.hashSync(password, salt);
  }

  checkPassword(password: string, passwordHash: string): boolean {
    if (!password) {
      return false;
    }
    return bcrypt.compareSync(password, passwordHash);
  }
}
