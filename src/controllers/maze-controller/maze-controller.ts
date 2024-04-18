import { Controller } from "../index";
import { Router } from "express";
import { hasRole } from "@middleware/interceptors";
import { Role } from "@enums";
import getMaze from "./getMaze";
import getActions from "./getActions";

/**
 * @swagger
 * tags:
 *   name: Maze
 *   description: Maze management
 */
export class MazeController implements Controller {
  initialize(router: Router): void {
    router.get("/maze", hasRole(Role.Admin), getMaze);
    router.get("/maze/actions", hasRole(Role.Admin), getActions);
  }
}
