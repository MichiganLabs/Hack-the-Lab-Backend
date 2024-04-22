import { RequestHandler } from "express";

/**
 * @swagger
 * /v1/maze/actions:
 *   get:
 *     tags: [Maze]
 *     summary: Returns a specific maze actions information for all rats
 *     responses:
 *       200:
 *         description: Actions successful
 */
const getActions: RequestHandler = async (req, res, next) => {
  res.status(200).json("All actions");
  next();
  return;
};

export default getActions;
