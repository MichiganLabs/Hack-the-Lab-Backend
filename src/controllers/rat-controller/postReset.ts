import { Role } from "@enums";
import { body, matchedData } from "express-validator";
import { MazeRequest } from "hackthelab";
import { RatService } from "services";
import { asyncHandler, createError, rethrowOrCreateError } from "utils";

interface ResetRequestBody {
  userId: number;
}

// prettier-ignore
export const resetSchema = [
  body("userId").optional().isInt()
];

/**
 * @swagger
 * /v1/rat/reset:
 *   post:
 *     tags: [Rat (SANDBOX)]
 *     summary: Reset a maze so that it can be solved again.
 *     requestBody:
 *       description: Reset request. (Admin may input a userId in the request to reset a specific rat's maze.)
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

  const data = matchedData(req) as ResetRequestBody;

  try {
    let userId: number = user.id;

    // Check to see if the userId request body property exits.
    if (data.userId != null) {
      if (user.role === Role.Admin) {
        userId = data.userId;
      } else {
        throw createError(400, "Bad Request", "One or more validation errors have occurred", {
          errors: [
            {
              type: "field",
              msg: "Invalid value",
              path: "userId",
              location: "body",
            },
          ],
        });
      }
    }

    await RatService.resetMaze(userId, maze.id);

    res.status(200).json({ message: "Maze was successfully reset." });
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to reset.");
  }
});

export default postReset;
