import { RequestHandler } from "express";
import { Cell, Surroundings } from "hackthelab";
import { CellType } from "@enums";

/**
 * @swagger
 * /v1/rat/move:
 *   post:
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
 *                 surroundings:
 *                   $ref: '#/components/schemas/Surroundings'
 */
const postMove: RequestHandler = async (req, res, next) => {
  const surroundings: Surroundings = {
    originCell: CellType.Cheese,
    northCell: CellType.Open,
    eastCell: CellType.Exit,
    southCell: CellType.Open,
    westCell: CellType.Wall
  }

  res
    .status(200)
    .json(surroundings);

  next();
  return;
};

export default postMove;
