import { RequestHandler } from "express";

/**
 * @swagger
 * /v1/maze/getMaze:
 *   post:
 *     tags: [Maze]
 *     security:
 *       - BearerAuth: []
 *     summary: Returns a maze
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         response: Maze returned
 */
const getMaze: RequestHandler = async (req, res, next) => {
  res.status(200).json({ response: "A simple maze: | |" });
  next();
  return;
};

export default getMaze;
