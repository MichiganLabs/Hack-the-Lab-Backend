import { Controller } from "../index";
import { Router } from "express";
import getMaze from "./getMaze";

/**
 * @swagger
 * tags:
 *   name: Maze
 *   description: Maze management
 */
export class MazeController implements Controller {
  initialize(router: Router): void {
    router.get("/maze/getMaze", getMaze);
  }
}
