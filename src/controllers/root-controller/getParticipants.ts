import { User } from "hackthelab";
import { UserService } from "services";
import { asyncHandler, rethrowOrCreateError } from "utils";

/**
 * /v1/participants:
 *   get:
 *     tags: [General (ADMIN)]
 *     summary: Get participants in the competition
 *     responses:
 *       200:
 *         description: Returns all of the participants in the competition
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
const getParticipants = asyncHandler(async (req, res) => {
  try {
    const result = await UserService.getParticipants();
    const users: User[] = result.map(({ id, name, role }) => ({ id, name, role }));
    res.status(200).json(users);
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to fetch rankings.");
  }
});

export default getParticipants;
