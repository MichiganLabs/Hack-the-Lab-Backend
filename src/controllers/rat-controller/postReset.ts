import { MazeRequest } from "hackthelab";
import { RatService } from "services";
import { ProblemDetailsError, asyncHandler, createError } from "utils";

/**
 * @swagger
 * /v1/rat/reset:
 *   post:
 *     tags: [Rat (SANDBOX)]
 *     summary: Reset a maze so that it can be solved again
 *     requestBody:
 *       description: Reset request.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MazeRequestBodySchema'
 *     responses:
 *       200:
 *         description: Reset successful.
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
const postReset = asyncHandler(async (req, res) => {
  const { user, maze } = req as MazeRequest;

  try {
    await RatService.resetMaze(user.id, maze.id);

    res.status(200).json({ message: "Maze was successfully reset" });
  } catch (e) {
    if (e instanceof ProblemDetailsError) throw e;
    console.error(e);
    throw createError(500, "Server Error", "An error occurred while trying to reset.");
  }
});

export default postReset;
