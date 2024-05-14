import { Role } from "@enums";
import { Router } from "express";
import { hasRole, mazePathSchema, resolveMaze, validate } from "middleware/interceptors";
import { Controller } from "../index";
import getActions, { actionsSchema } from "./getActions";
import getMaze from "./getMaze";
import getMazes, { mazesSchema } from "./getMazes";
import putMaze, { mazeUpdateSchema } from "./putMaze";

/**
 * @swagger
 * tags:
 *   name: Maze (ADMIN)
 *   description: Maze management for administrators
 */
export class MazeController implements Controller {
  initialize(router: Router): void {
    const mazeMiddleware = [];

    mazeMiddleware.push(hasRole(Role.Admin));

    // Validate the mazeId and inject the `maze` object into the request
    mazeMiddleware.push(validate(mazePathSchema), resolveMaze);

    router.put("/maze/:mazeId", ...mazeMiddleware, validate(mazeUpdateSchema), putMaze);
    router.get("/maze/:mazeId/actions/:userId", ...mazeMiddleware, validate(actionsSchema), getActions);
    router.get("/maze/:mazeId", ...mazeMiddleware, getMaze);
    router.get("/mazes", validate(mazesSchema), getMazes);
  }
}
