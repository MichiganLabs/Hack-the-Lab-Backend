import { CellType, Environment, Role } from "@enums";
import { Request } from "express";

declare module "hackthelab" {
  /**
   * @swagger
   * components:
   *   schemas:
   *     User:
   *       type: object
   *       properties:
   *         id:
   *           type: integer
   *           example: 34
   *         name:
   *           type: string
   *           example: "Alice"
   *         role:
   *           $ref: '#/components/schemas/Role'
   */
  interface User {
    id: number;
    name: string;
    role: Role;
  }

  interface AuthUser extends User {
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
   *         openSquareCount:
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
    openSquareCount: number;
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     MazeResponse:
   *       type: object
   *       properties:
   *         id:
   *           type: string
   *           example: "practice-maze-0"
   *           description: The unique identifier for the maze.
   *         numberOfCheese:
   *           type: number
   *           example: 3
   *           description: The number of cheese in the maze.
   *         dimensions:
   *           type: object
   *           properties:
   *             horizontal:
   *               type: integer
   *               example: 7
   *             vertical:
   *               type: integer
   *               example: 7
   */
  interface MazeResponse {
    id: string;
    dimensions: {
      horizontal: number;
      vertical: number;
    };
    numberOfCheese: number;
    locked?: boolean;
  }

  interface AdminMaze extends Maze {
    environment: Environment;
    locked: boolean;
  }

  type MazeDictionary = { [key: string]: AdminMaze };

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
   *           type: integer
   *           example: 1234
   */
  interface ActionsResponse {
    actions: Action[];
    score: number;
  }

  interface UserActions {
    userId: number;
    userName: string;
    actions: ACtion[];
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     AllActionResponseItem:
   *       type: object
   *       properties:
   *         userId:
   *           type: string
   *         userName:
   *           type: string
   *         actions:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/Action'
   *         score:
   *           type: number
   */
  interface AllActionResponseItem extends UserActions {
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
   *         timeTs:
   *           type: string
   *         position:
   *           $ref: '#/components/schemas/Coordinate'
   *         actionData:
   *           type: object
   */
  interface Action {
    actionId: string;
    userId: string;
    mazeId: string;
    actionType: ActionType;
    timeTs: Date;
    actionData: object;
    position: Coordinate;
    success: boolean;
  }

  /**
   */
  interface MazeRequest extends Request {
    maze: Maze;
  }

  /**
   */
  interface RatActionRequest extends MazeRequest {
    /** If action endpoint: Contains rat position data. */
    ratPosition: Coordinate;
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     Award:
   *       type: object
   *       properties:
   *         name:
   *           type: string
   *           example: "Best Rat"
   *         description:
   *           type: string
   *           example: "Awarded to the rat with the highest score."
   *         userId:
   *           type: string
   *           example: "34"
   */
  interface Award {
    name: string;
    description: string;
    userId: number;
    value: string;
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     Score:
   *       type: object
   *       properties:
   *         userId:
   *           type: integer
   *           example: 34
   *         score:
   *           type: integer
   *           example: 1234
   */
  interface Score {
    userId: number;
    score: number;
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     RankingResult:
   *       type: object
   *       properties:
   *         scores:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/Score'
   *         awards:
   *           type: array
   *           items:
   *             $ref: '#/components/schemas/Award'
   */
  interface RankingResult {
    scores: Score[];
    awards: Award[];
  }
}
