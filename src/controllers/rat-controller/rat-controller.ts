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

    // Validate the mazeId and inject the `maze` object into the request
    ratMiddleware.push(validate(mazeBodySchema), resolveMaze);

    // // Prevent the same user (key) from performing an action while another action is being processed
    ratMiddleware.push(ratControllerLocking);

    // // Initialize the maze (if necessary) and inject the rat's current position into the request
    ratMiddleware.push(preActionMiddleware);

    router.post("/rat/move", hasRole(Role.Participant), ...ratMiddleware, validate(moveSchema), postMove);
    router.post("/rat/smell", hasRole(Role.Participant), ...ratMiddleware, postSmell);
    router.post("/rat/eat", hasRole(Role.Participant), ...ratMiddleware, postEat);
    router.post("/rat/exit", hasRole(Role.Participant), ...ratMiddleware, postExit);
    router.post("/rat/reset", hasRole(Role.Developer), ...ratMiddleware, postReset);
  }
}
