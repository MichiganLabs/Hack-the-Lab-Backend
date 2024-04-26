import { Role } from "@enums";
import { hasRole } from "@middleware/interceptors";
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
    router.get("/maze/:mazeId", hasRole(Role.Admin), mazeSchema, getMaze);
    router.get("/maze/actions", hasRole(Role.Admin), actionsSchema, getActions);
  }
}
