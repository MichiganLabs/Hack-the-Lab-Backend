import { acquireLock, getRatPosition, releaseLock, saveRatPositionToCache } from "@data";
import { ActionType, CellType, Direction } from "@enums";
import { pgQuery } from "data/db";
import { CellResponse, Coordinate } from "hackthelab";

export const moveRat = async (userId: number, mazeId: string, direction: Direction): Promise<CellResponse> => {
  // This lock is used to prevent the rat from moving, in the same maze, while processing this move.
  const ratLock = `lock-rat-move-${userId}-${mazeId}`;

  await acquireLock(ratLock);

  try {
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

    if (didMove) {
      // If the rat moved, update the position
      await saveRatPositionToCache(userId, mazeId, position);
    }

    // Insert an action denoting the rat has moved.
    await insertAction(userId, mazeId, ActionType.Move, position, didMove);

    // TODO: return surroundings based on where the rat is in the maze.

    const returnedCell = {
      success: didMove,
      type: CellType.Cheese,
      surroundings: {
        north: CellType.Open,
        east: CellType.Exit,
        south: CellType.Open,
        west: CellType.Wall,
      },
    };

    return returnedCell;
  } finally {
    // Important: release lock to allow next move request to process.
    releaseLock(ratLock);
  }
};

// Helper method used to insert action record in the database.
const insertAction = async (
  userId: number,
  mazeId: string,
  actionType: ActionType,
  position: Coordinate,
  success: boolean = true,
): Promise<any> => {
  await pgQuery("INSERT INTO actions (user_id, maze_id, action_type, position, success) VALUES ($1, $2, $3, $4, $5)", [
    userId,
    mazeId,
    actionType,
    position,
    success,
  ]);
};
