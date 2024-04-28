import { Role } from "@enums";
import { hasRole, validate, validateMazeId } from "@middleware/interceptors";
import { Router } from "express";
import { Controller } from "../index";
import getActions, { actionsSchema } from "./getActions";
import getMaze, { mazeSchema } from "./getMaze";

/**
 * @swagger
 * tags:
 *   name: Maze
 *   description: Maze management
 */
export class MazeController implements Controller {
  initialize(router: Router): void {
    router.get("/maze/:mazeId", hasRole(Role.Admin), validate(mazeSchema), validateMazeId, getMaze);
    router.get("/maze/:mazeId/actions/:userId", hasRole(Role.Admin), validate(actionsSchema), validateMazeId, getActions);
  }
}
