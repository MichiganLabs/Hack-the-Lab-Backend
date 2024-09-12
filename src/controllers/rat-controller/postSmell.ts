import { RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { asyncHandler, rethrowOrCreateError } from "utils";

/**
 * @swagger
 * /v1/rat/smell:
 *   post:
 *     tags: [Rat]
 *     summary: Attempts to smell a cheese.
 *     description: The distance to the nearest cheese, within the smell radius, will be returned. If there are no cheeses in the maze, the distance will be `null`.
 *     requestBody:
 *       description: Smell request.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MazeRequest'
 *     responses:
 *       200:
 *         description: Smell successful
 *         content:
 *           application/json:
 *            schema:
 *              type: object
 *              properties:
 *                distance:
 *                  type: number
 *                  example: 6
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
const postSmell = asyncHandler(async (req, res) => {
  const { user, maze, ratPosition } = req as RatActionRequest;

  try {
    const smellResult = await RatService.smell(user.id, maze, ratPosition);

    res.status(200).json({ distance: smellResult });
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to smell.");
  }
});

export default postSmell;
