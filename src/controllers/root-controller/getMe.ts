import { asyncHandler } from "utils";

/**
 * @swagger
 * /v1/me:
 *   get:
 *     tags: [General]
 *     summary: Returns information about the authenticated user.
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Example User"
 *                 role:
 *                   type: string
 *                   example: "PARTICIPANT"
 */
const getMe = asyncHandler(async (req, res) => {
  const { user } = req;

  delete user.apiKey;
  delete user.id;
  delete user.disabled;

  res.send(user);
});

export default getMe;
