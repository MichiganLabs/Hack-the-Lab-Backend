import { RatActionRequest } from "hackthelab";
import { RatService } from "services";

/**
 * @swagger
 * /v1/rat/{mazeId}/surroundings:
 *   get:
 *     tags: [Rat]
 *     summary: Returns the rat's immediate surroundings.
 *     parameters:
 *       - $ref: '#/components/parameters/MazeRequestPathBase'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cell'
 *       400:
 *         description: Invalid request body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestResponse'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
const getSurroundings = async (req: RatActionRequest, res, next) => {

  try {
    const cell = await RatService.getCellAtPosition(req.maze, req.ratPosition, req.user.id);

    res.status(200).json(cell);
  } catch (e) {
    console.error(e);
    res.sendStatus(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default getSurroundings;
