import { Role } from "@enums";
import { hasRole, resolveMaze, validate } from "@middleware/interceptors";
import { mazePathSchema } from "@middleware/interceptors/maze-middleware";
import { Router } from "express";
import { Controller } from "../index";
import getActions, { actionsSchema } from "./getActions";
import getMaze from "./getMaze";

/**
 * @swagger
 * tags:
 *   name: Maze
 *   description: Maze management
 */
export class MazeController implements Controller {
  initialize(router: Router): void {
    // Validate the mazeId and inject the `maze` object into the request
    router.use(validate(mazePathSchema), resolveMaze);

    router.get("/maze/:mazeId", hasRole(Role.Admin), getMaze);
    router.get("/maze/:mazeId/actions/:userId", hasRole(Role.Admin), validate(actionsSchema), getActions);
  }
}
