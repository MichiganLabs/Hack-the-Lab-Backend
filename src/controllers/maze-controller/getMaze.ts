import { RequestHandler } from "express";

/**
 * @swagger
 * /v1/maze:
 *   get:
 *     tags: [Maze]
 *     summary: Returns a maze
 *     responses:
 *       200:
 *         description: Fetch successful
 */
const getMaze: RequestHandler = async (req, res, next) => {
  res.status(200).json({ response: "A simple maze: [ ]" });
  next();
  return;
};

export default getMaze;
