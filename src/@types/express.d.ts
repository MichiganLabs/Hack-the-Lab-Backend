import "express";
import { AuthUser, Maze } from "hackthelab";

declare global {
  namespace Express {
    interface Request {
      /** Indicates whether the user is authenticated */
      authenticated: boolean;

      /** If authenticated: Contains user data.  */
      user?: AuthUser;

      // For endpoints that act on mazes (undefined if not).
      maze?: Maze;
    }
  }
}

declare module "express" {
  type Interceptor = (req: Request, res: Response, next: NextFunction) => void;
}
