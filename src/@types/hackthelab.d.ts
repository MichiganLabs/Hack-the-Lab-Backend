import { CellType, Environment, Role } from "@enums";
import { Request } from "express";

declare module "hackthelab" {
  interface AuthUser {
    id: number;
    name: string;
    role: Role;
    apiKey: string;
    disabled: boolean;
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     Maze:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           example: "practice-maze-0"
   *           description: The unique identifier for the maze.
   *         cells:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/AdminCell'
   *         cheese:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/Coordinate'
   *         exit:
   *           $ref: '#/components/schemas/Coordinate'
   *         start:
   *           $ref: '#/components/schemas/Coordinate'
   *         dimensions:
   *           type: object
   *           properties:
   *             horizontal:
   *               type: integer
   *               example: 7
   *             vertical:
   *               type: integer
   *               example: 7
   *         open_square_count:
   *           type: integer
   *           example: 7
   */
  interface Maze {
    id: string;
    cells: AdminCell[];
    cheese: Coordinate[];
    exit: Coordinate;
    start: Coordinate;
    dimensions: {
      horizontal: number;
      vertical: number;
    };
    open_square_count: number;
  }

  interface AdminMaze extends Maze {
    environment: Environment;
    locked: boolean;
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     Cell:
   *       type: object
   *       properties:
   *         type:
   *           $ref: '#/components/schemas/CellType'
   *         surroundings:
   *           $ref: '#/components/schemas/Surroundings'
   */

  interface Cell {
    type: CellType;
    surroundings: Surroundings;
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     Coordinate:
   *       type: object
   *       properties:
   *         x:
   *           type: integer
   *           example: 0
   *         y:
   *           type: integer
   *           example: 0
   */
  interface Coordinate {
    x: number;
    y: number;
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     Surroundings:
   *       type: object
   *       properties:
   *         north:
   *           $ref: '#/components/schemas/CellType'
   *         east:
   *           $ref: '#/components/schemas/CellType'
   *         south:
   *           $ref: '#/components/schemas/CellType'
   *         west:
   *           $ref: '#/components/schemas/CellType'
   *       example:
   *         north: Open
   *         east: Wall
   *         south: Start
   *         west: Wall
   */
  interface Surroundings {
    north: CellType;
    east: CellType;
    south: CellType;
    west: CellType;
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     ActionResponse:
   *       type: object
   *       properties:
   *         success:
   *           type: boolean
   *           example: true
   *         cell:
   *           $ref: '#/components/schemas/Cell'
   */
  interface ActionResponse {
    success: boolean;
    cell: Cell;
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     ActionsResponse:
   *       type: object
   *       properties:
   *         actions:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/Action'
   *         score:
   *           type: number
   *           example: 1234
   */
  interface ActionsResponse {
    actions: Action[];
    score: number;
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     AdminCell:
   *       allOf:
   *         - $ref: '#/components/schemas/Cell'
   *         - type: object
   *           properties:
   *             coordinates:
   *               $ref: '#/components/schemas/Coordinate'
   *
   */
  interface AdminCell extends Cell {
    coordinates: Coordinates;
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     Action:
   *       type: object
   *       properties:
   *         actionId:
   *           type: integer
   *           example: 23
   *         userId:
   *           type: integer
   *           example: 34
   *         mazeId:
   *           type: string
   *           example: "practice-maze-0"
   *         actionType:
   *           $ref: '#/components/schemas/ActionType'
   *         position:
   *           $ref: '#/components/schemas/Coordinate'
   */
  interface Action {
    actionId: string;
    userId: string;
    mazeId: string;
    actionType: ActionType;
    position: Coordinate;
    success: boolean;
  }

  /**
   *
   *
   *
   */
  interface MazeRequest extends Request {
    maze: Maze;
  }

  /**
   *
   */
  interface RatActionRequest extends MazeRequest {
    /** If action endpoint: Contains rat position data. */
    ratPosition: Coordinate;
  }
}
