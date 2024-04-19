import { Router } from "express";

export interface Controller {
  initialize(_router: Router): void;
}
