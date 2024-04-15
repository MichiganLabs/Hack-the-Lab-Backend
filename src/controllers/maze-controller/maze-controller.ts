import { Controller } from "../index";
import { Router } from "express";
import getMaze from "./getMaze";
import { hasRole } from "@middleware/interceptors";
import { Role } from "@enums";

/**
 * @swagger
 * tags:
 *   name: Maze
 *   description: Maze management
 */
export class MazeController implements Controller {
  initialize(router: Router): void {
    router.get("/maze/getMaze", hasRole(Role.Developer), getMaze);
  }
}
