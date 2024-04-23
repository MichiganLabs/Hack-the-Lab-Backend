import { CellType, Role } from "@enums";

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
   *     Cell:
   *       type: object
   *       properties:
   *         x:
   *           type: integer
   *           example: 0
   *         y:
   *           type: integer
   *           example: 0
   *         surroundings:
   *           $ref: '#/components/schemas/Surroundings'
   */
  interface Cell extends Surroundings {
    x: Int;
    y: Int;
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     Surroundings:
   *       type: object
   *       properties:
   *         originCell:
   *           $ref: '#/components/schemas/CellType'
   *         northCell:
   *           $ref: '#/components/schemas/CellType'
   *         eastCell:
   *           $ref: '#/components/schemas/CellType'
   *         southCell:
   *           $ref: '#/components/schemas/CellType'
   *         westCell:
   *           $ref: '#/components/schemas/CellType'
   */
  interface Surroundings {
    originCell: CellType;
    northCell: CellType;
    eastCell: CellType;
    southCell: CellType;
    westCell: CellType;
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
   *           type: string
   *           example: "Move"
   *         position:
   *           type: object
   *           properties:
   *             x:
   *               type: integer
   *               example: 16
   *             y:
   *               type: integer
   *               example: 20
   *         timeTs:
   *           type: string
   *           example: "2024-01-01T12:00:00.001Z"
   */
  interface Action {
    actionId: string;
    userId: string;
    mazeId: string;
    actionType: string;
    position: Cell;
    time: Date;
  }
}
