import { RequestHandler } from "express";

/**
 * @swagger
 * /v1/rat/reset:
 *   post:
 *     tags: [Rat]
 *     summary: Rat reset
 *     responses:
 *       200:
 *         description: reset successful
 */
const postReset: RequestHandler = async (req, res, next) => {
  res
    .status(200)
    .json({
       response: "reset successful."
      });

  next();
  return;
};

export default postReset;
