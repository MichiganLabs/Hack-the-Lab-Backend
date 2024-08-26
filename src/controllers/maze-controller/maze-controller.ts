import { Role } from "@enums";
import { Router } from "express";
import { hasRole, mazePathSchema, resolveMaze, validate } from "middleware/interceptors";
import { Controller } from "../index";
import getActions, { actionsSchema } from "./getActions";
import getAllActions from "./getAllActions";
import getMaze from "./getMaze";
import getMazes, { mazesSchema } from "./getMazes";
import putMaze, { mazeUpdateSchema } from "./putMaze";

/**
 * @swagger
 * tags:
 *   - name: Maze
 *     description: Maze management
 *   - name: Maze (SANDBOX)
 *     description: Maze management for sandbox
 *   - name: Maze (ADMIN)
 *     description: Maze management for administrators
 */
export class MazeController implements Controller {
  initialize(router: Router): void {
    // Validate the mazeId and inject the `maze` object into the request
    const mazeMiddleware = [validate(mazePathSchema), resolveMaze];

    router.put("/maze/:mazeId", hasRole(Role.Developer), validate(mazeUpdateSchema), mazeMiddleware, putMaze);
    router.get("/maze/:mazeId/actions", hasRole(Role.Admin), ...mazeMiddleware, getAllActions);
    router.get("/maze/:mazeId/actions/:userId", hasRole(Role.Admin), ...mazeMiddleware, validate(actionsSchema), getActions);
    router.get("/maze/:mazeId", hasRole(Role.Developer), ...mazeMiddleware, getMaze);
    router.get("/mazes", validate(mazesSchema), getMazes);
  }
}
