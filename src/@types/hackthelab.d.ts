declare module "hackthelab" {
  interface AuthUser {
    id: string;
    name: string;
    api_key: string;
    disabled: boolean;
  }
}
