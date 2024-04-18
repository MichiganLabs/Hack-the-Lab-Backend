import { Controller } from "../index";
import { Router } from "express";
import { hasRole } from "@middleware/interceptors";
import { Role } from "@enums";
import postMove from "./postMove";
import postEat from "./postEat";
import postSmell from "./postSmell";
import postExit from "./postExit";
import postReset from "./postReset";

/**
 * @swagger
 * tags:
 *   name: Rat
 *   description: Rat management
 */
export class RatController implements Controller {
  initialize(router: Router): void {
    router.post("/rat/move", hasRole(Role.Participant), postMove);
    router.post("/rat/smell", hasRole(Role.Participant), postSmell);
    router.post("/rat/eat", hasRole(Role.Participant), postEat);
    router.post("/rat/exit", hasRole(Role.Participant), postExit);
    router.post("/rat/reset", hasRole(Role.Developer), postReset);
  }
}
