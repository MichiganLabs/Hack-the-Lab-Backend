import { Role } from "@enums";
import {
  hasRole,
  mazeBodySchema,
  preActionMiddleware,
  ratControllerLocking,
  resolveMaze,
  validate
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
    // Validate the mazeId and inject the `maze` object into the request
    router.use(validate(mazeBodySchema), resolveMaze);

    // Prevent the same user (key) from performing an action while another action is being processed
    router.use(ratControllerLocking);

    // Initialize the maze (if necessary) and inject the rat's current position into the request
    router.use(preActionMiddleware);

    router.post("/rat/move", hasRole(Role.Participant), validate(moveSchema), postMove);
    router.post("/rat/smell", hasRole(Role.Participant), postSmell);
    router.post("/rat/eat", hasRole(Role.Participant), postEat);
    router.post("/rat/exit", hasRole(Role.Participant), postExit);
    router.post("/rat/reset", hasRole(Role.Developer), postReset);
  }
}
