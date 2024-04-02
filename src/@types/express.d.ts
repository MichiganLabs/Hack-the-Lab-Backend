import { Response, Request, NextFunction } from "express";
import { AuthUser } from "hackthelab";

declare global {
  namespace Express {
    interface Request {
      /** Indicates whether the user is authenticated */
      authenticated: boolean;

      /** If authenticated: Contains user data.  */
      user?: AuthUser;
    }
  }
}

declare module "express" {
  type Interceptor = (req: Request, res: Response, next: NextFunction) => void;
}
