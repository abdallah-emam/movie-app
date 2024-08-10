import { Role } from '../enum/role.enum';

export interface PayloadInterface {
  _id: string;
  username: string;
  role: Role;
}
