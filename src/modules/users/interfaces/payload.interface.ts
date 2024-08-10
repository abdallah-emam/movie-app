import { Roles } from '../enum/roles.enum';

// payload interface
export interface PayloadInterface {
  _id: string;
  userName: string;
  role: Roles;
}
