import { RequestHandler } from "express";
import { Cell } from "hackthelab";
import { CellType } from "../../enums";

/**
 * @swagger
 * /v1/rat/move:
 *   get:
 *     tags: [Rat]
 *     summary: Moves a rat in a direction for a specific maze
 *     responses:
 *       200:
 *         description: Move successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cellType:
 *                   $ref: '#/components/schemas/CellType'
 */
const move: RequestHandler = async (req, res, next) => {
  console.log("move");
  const cell: Cell = {
    cellType: CellType.open
  }
  res
    .status(200)
    .json({
       response: cell.cellType
      });

  next();
  return;
};

export default move;
