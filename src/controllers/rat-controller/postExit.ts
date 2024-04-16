import { RequestHandler } from "express";

/**
 * @swagger
 * /v1/rat/exit:
 *   post:
 *     tags: [Rat]
 *     summary: Rat exit
 *     responses:
 *       200:
 *         description: Exit successful
 */
const postExit: RequestHandler = async (req, res, next) => {
  res
    .status(200)
    .json({
       response: "exit successful."
      });

  next();
  return;
};

export default postExit;
