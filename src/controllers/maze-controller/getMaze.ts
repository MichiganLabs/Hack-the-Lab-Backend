import { RequestHandler } from "express";
import { param } from "utils/custom-validator";

// prettier-ignore
export const mazeSchema = [
  param("mazeId").isMaze().withMessage("'mazeId' must be included in the body of the request.")
]

/**
 * @swagger
 * /v1/maze/{mazeId}:
 *   get:
 *     tags: [Maze]
 *     summary: Returns a maze
 *     parameters:
 *       - in: path
 *         name: mazeId
 *         schema:
 *           type: string
 *         required: true
 *         description: Maze identifier.
 *     responses:
 *       200:
 *         description: Fetch successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Maze'
 */
const getMaze: RequestHandler = async (req, res, next) => {
  res.status(200).json(req.maze);

  return next();
};

export default getMaze;
