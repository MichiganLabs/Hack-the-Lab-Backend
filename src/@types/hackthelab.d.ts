import { Role } from "@enums";

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
   *         cellType:
   *           $ref: '#/components/schemas/CellType'
   */
  interface Cell {
    cellType: CellType;
  }
}
