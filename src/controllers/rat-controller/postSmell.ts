import { RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { ProblemDetailsError, asyncHandler, createError } from "utils";

/**
 * @swagger
 * /v1/rat/smell:
 *   post:
 *     tags: [Rat]
 *     summary: Allows the rat to smell the cheese in the maze.
 *     requestBody:
 *       description: Smell request.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MazeRequestBodySchema'
 *     responses:
 *       200:
 *         description: Smell successful
 *         content:
 *           application/json:
 *            schema:
 *              type: object
 *              properties:
 *                intensity:
 *                  type: number
 *                  example: 0.6
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestResponse'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error.
 */
const postSmell = asyncHandler(async (req, res) => {
  const { user, maze, ratPosition } = req as RatActionRequest;

  try {
    const smellResult = await RatService.smell(user.id, maze, ratPosition);

    res.status(200).json({ intensity: smellResult });
  } catch (e) {
    if (e instanceof ProblemDetailsError) throw e;
    console.error(e);
    throw createError(500, "An error occurred while trying to smell.");
  }
});

export default postSmell;
