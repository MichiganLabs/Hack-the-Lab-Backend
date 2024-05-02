import { RatActionRequest } from "hackthelab";
import { RatService } from "services";

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
const postSmell = async (req: RatActionRequest, res, next) => {

  try {
    const smellResult = await RatService.smell(req.user.id, req.maze, req.ratPosition);

    res.status(200).json({intensity: smellResult});
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default postSmell;
