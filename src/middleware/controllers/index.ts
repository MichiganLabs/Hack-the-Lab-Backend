import { Router } from "express";

export interface Controller {
  initialize(router: Router): void;
}
