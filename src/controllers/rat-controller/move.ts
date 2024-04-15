import { RequestHandler } from "express";
import { body, matchedData, validationResult } from "express-validator";
import {
  acquireLock,
  getRatPosition,
  releaseLock,
  setRatPosition,
} from "../../data/index";
import { pgQuery } from "../../data/db";

export const moveSchema = [
  body("mazeId").isString(),
  body("direction").isIn(["north", "east", "south", "west"]),
];

/**
 * @swagger
 * /v1/rat/move:
 *   post:
 *     tags: [Rat]
 *     summary: Moves a rat in a direction for a specific maze
 *     responses:
 *       200:
 *         description: Move successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cellType:
 *                   $ref: '#/components/schemas/CellType'
 */
const move: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const data = matchedData(req);

  let lock = `lock-${req.user.id}-${data.mazeId}`;

  await acquireLock(lock);

  var position = await getRatPosition(req.user.id, data.mazeId);
  var prevPosition = position;

  if (!position) {
    // This should be the start of the maze.
    position = { x: 0, y: 0 };
  }

  console.log(`Rat is currently at (${position.x}, ${position.y})`);

  var didMove = true;

  // TODO: Do maze logic to check whether the rat can move and return cell data.
  switch (data.direction) {
    case "north":
      position.y -= 1;
      break;
    case "east":
      position.x += 1;
      break;
    case "south":
      position.y += 1;
      break;
    case "west":
      position.x -= 1;
      break;
  }

  if (didMove) {
    // If the rat moved, update the position
    await setRatPosition(req.user.id, data.mazeId, position);

    // This insert could also be distributed through redis events to a
    // different process, to reduce response times.
    await pgQuery(
      "INSERT INTO moves (user_id, maze_id, direction, prev, curr) VALUES ($1, $2, $3, $4, $5)",
      [req.user.id, data.mazeId, data.direction, prevPosition, position]
    );

    // Sending the position for now, until have maze data.
    res.status(200).json(position);
  } else {
    console.log("Rat didn't move at all, did you move into a wall?");
    // TODO what do we want to send when they don't move at all.
    res.status(409); // Conflict!
  }

  await releaseLock(lock);

  next();
  return;
};

export default move;
