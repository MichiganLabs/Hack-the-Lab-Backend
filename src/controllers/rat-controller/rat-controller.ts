import { Role } from "@enums";
import { hasRole, validate, validateMazeId } from "@middleware/interceptors";
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
    router.post("/rat/move", hasRole(Role.Participant), validate(moveSchema), validateMazeId, postMove);
    router.post("/rat/smell", hasRole(Role.Participant), postSmell);
    router.post("/rat/eat", hasRole(Role.Participant), postEat);
    router.post("/rat/exit", hasRole(Role.Participant), postExit);
    router.post("/rat/reset", hasRole(Role.Developer), postReset);
  }
}
