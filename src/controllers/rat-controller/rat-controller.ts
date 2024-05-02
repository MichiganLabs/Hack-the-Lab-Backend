import { Role } from "@enums";
import {
  hasRole,
  mazeBodySchema,
  preActionMiddleware,
  ratControllerLocking,
  resolveMaze,
  validate,
} from "@middleware/interceptors";
import { Router } from "express";
import { Controller } from "../index";
import postEat from "./postEat";
import postExit from "./postExit";
import postMove, { moveSchema } from "./postMove";
import postReset from "./postReset";
import postSmell from "./postSmell";

/**
 * @swagger
 * tags:
 *   name: Rat
 *   description: Rat management
 */
export class RatController implements Controller {
  initialize(router: Router): void {
    const ratMiddleware = [];

    // Validate the mazeId and inject the `maze` object into the request.
    ratMiddleware.push(validate(mazeBodySchema), resolveMaze);

    // Prevent the same user (key) from performing an action while another action is being processed.
    ratMiddleware.push(ratControllerLocking);

    // Initialize the maze (if necessary), inject the rat's current position into the request, and verify the rat hasn't exited the maze.
    const ratActionMiddleware = [...ratMiddleware, preActionMiddleware];

    // Rat action endpoints, each of these endpoints has an action recorded for a rat.
    router.post("/rat/move", hasRole(Role.Participant), ...ratActionMiddleware, validate(moveSchema), postMove);
    router.post("/rat/smell", hasRole(Role.Participant), ...ratActionMiddleware, postSmell);
    router.post("/rat/eat", hasRole(Role.Participant), ...ratActionMiddleware, postEat);
    router.post("/rat/exit", hasRole(Role.Participant), ...ratActionMiddleware, postExit);

    // Rat general endpoints.
    router.post("/rat/reset", hasRole(Role.Developer), ...ratMiddleware, postReset);
  }
}
