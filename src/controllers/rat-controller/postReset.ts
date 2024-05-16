import { MazeRequest } from "hackthelab";
import { RatService } from "services";
import { asyncHandler, rethrowOrCreateError } from "utils";

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
 *             $ref: '#/components/schemas/MazeRequest'
 *     responses:
 *       200:
 *         description: Reset successful.
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
const postReset = asyncHandler(async (req, res) => {
  const { user, maze } = req as MazeRequest;

  try {
    await RatService.resetMaze(user.id, maze.id);

    res.status(200).json({ message: "Maze was successfully reset" });
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to reset.");
  }
});

export default postReset;
