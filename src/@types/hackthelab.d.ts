import { Role, CellType } from "@enums";

declare module "hackthelab" {
  interface AuthUser {
    id: string;
    name: string;
    role: Role;
    api_key: string;
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
   *           type: Int
   *           example: 0
   *         y:
   *           type: Int
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
}
