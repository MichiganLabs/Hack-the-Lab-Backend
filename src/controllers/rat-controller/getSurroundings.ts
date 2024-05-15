import { RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { asyncHandler } from "utils";

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
const getSurroundings = asyncHandler(async (req, res, next) => {
  const { maze, ratPosition } = req as RatActionRequest;

  try {
    const cell = await RatService.getCellAtPosition(maze, ratPosition, req.user.id);

    res.status(200).json(cell);
  } catch (e) {
    console.error(e);
    res.sendStatus(500).json({ error: "Internal server error" });
  }

  next();
  return;
});

export default getSurroundings;