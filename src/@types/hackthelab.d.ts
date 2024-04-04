import { Role } from "../enums";

declare module "hackthelab" {
  interface AuthUser {
    id: string;
    name: string;
    role: Role;
    api_key: string;
    disabled: boolean;
  }
}
