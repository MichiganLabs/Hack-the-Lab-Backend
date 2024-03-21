import { RequestHandler } from "express";

/**
 * @swagger
 * /v1/maze/getMaze:
 *   get:
 *     tags: [Maze]
 *     summary: Returns a maze
 *     responses:
 *       200:
 *         description: Fetch successful
 */
const getMaze: RequestHandler = async (req, res, next) => {
  console.log("getMaze");
  res.status(200).json({ response: "A simple maze: | |" });
  next();
  return;
};

export default getMaze;
