import { RequestHandler } from "express";

/**
 * @swagger
 * /v1/maze/results:
 *   get:
 *     tags: [Maze]
 *     summary: Returns a specific maze results information for all rats
 *     responses:
 *       200:
 *         description: Results successful
 */
const getResults: RequestHandler = async (req, res, next) => {
  res
    .status(200)
    .json(
      { response: "All results" }
    );
  next();
  return;
};

export default getResults;
