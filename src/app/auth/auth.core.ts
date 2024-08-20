import { UserDto } from '../user/user.dto';

export const getJwtPayload = (user: UserDto) => {
  return {
    first_name: user.first_name,
    last_name: user.last_name,
    role_id: user.role_id,
    user_id: user.user_id,
    email: user.email,
    national_id: user.national_id,
  };
};
