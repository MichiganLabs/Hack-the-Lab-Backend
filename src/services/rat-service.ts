import { acquireLock, getRatPosition, releaseLock, saveRatPositionToCache } from "@data";
import { ActionType, CellType, Direction } from "@enums";
import { pgQuery } from "data/db";
import { Surroundings } from "hackthelab";

export const moveRat = async (userId: string, mazeId: string, direction: Direction): Promise<Surroundings | null> => {
  // This lock is used to prevent the rat from moving while processing this move.
  const ratLock = `lock-rat-move-${userId}-${mazeId}`;

  await acquireLock(ratLock);

  let position = await getRatPosition(userId, mazeId);

  // Should be obsolete after initialize middleware is implemented (https://msljira.atlassian.net/browse/HTL-12).
  if (!position) {
    // TODO: This should be the start of the maze.
    position = { x: 0, y: 0 };

    // Insert an action denoting the rat has started the maze.
    await insertAction(userId, mazeId, ActionType.Start, position);
  }

  // Keep track of whether the rat moved, or not.
  let didMove = false;

  // TODO: Do maze logic to check whether the rat can move in the maze.
  switch (direction) {
    case Direction.North:
      position.y -= 1;
      didMove = true;
      break;
    case Direction.East:
      position.x += 1;
      didMove = true;
      break;
    case Direction.South:
      position.y += 1;
      didMove = true;
      break;
    case Direction.West:
      position.x -= 1;
      didMove = true;
      break;
  }

  let surroundings: Surroundings = null;

  if (didMove) {
    // If the rat moved, update the position
    await saveRatPositionToCache(userId, mazeId, position);

    await insertAction(userId, mazeId, ActionType.Move, position);

    // TODO return surroundings based on where the rat is in the maze.
    surroundings = {
      originCell: CellType.Cheese,
      northCell: CellType.Open,
      eastCell: CellType.Exit,
      southCell: CellType.Open,
      westCell: CellType.Wall,
    };
  }

  releaseLock(ratLock);

  return surroundings;
};

const insertAction = async (userId: string, mazeId: string, actionType: ActionType, position: object): Promise<any> => {
  await pgQuery("INSERT INTO actions (user_id, maze_id, action_type, position) VALUES ($1, $2, $3, $4)", [
    userId,
    mazeId,
    actionType,
    position,
  ]);
};
