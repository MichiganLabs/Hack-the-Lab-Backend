import {
  clearEatenCheeseCache,
  clearRatPositionCache,
  getEatenCheesePositions,
  saveEatenCheeseToCache,
  saveRatPositionToCache
} from "@data";
import { ActionType, CellType, Direction } from "@enums";
import { pgQuery } from "data/db";
import { Coordinate, Maze } from "hackthelab";
import { MazeService } from "services";

export const moveRat = async (userId: number, maze: Maze, position: Coordinate, direction: Direction): Promise<boolean> => {

  // Keep track of whether the rat moved, or not.
  let didMove = false;

  const currentCell = MazeService.getCellAtPosition(maze, position, userId);
  if (currentCell == undefined) {
    throw new Error("Cell does not exist in maze!");
  }

  // Do maze logic to check whether the rat can move in the maze.
  const { north, east, south, west } = currentCell.surroundings;

  switch (direction) {
    case Direction.North:
      if (north != CellType.Wall) {
        position.y -= 1;
        didMove = true;
      }
      break;
    case Direction.East:
      if (east != CellType.Wall) {
        position.x += 1;
        didMove = true;
      }
      break;
    case Direction.South:
      if (south != CellType.Wall) {
        position.y += 1;
        didMove = true;
      }
      break;
    case Direction.West:
      if (west != CellType.Wall) {
        position.x -= 1;
        didMove = true;
      }
      break;
  }

  if (didMove) {
    // If the rat moved, update the position
    await saveRatPositionToCache(userId, maze.id, position);
  }

  // Insert an action denoting the rat has moved.
  await insertAction(userId, maze.id, ActionType.Move, position, didMove);

  return didMove;
};

export const smell = async (userId: number, maze: Maze, position: Coordinate): Promise<number> => {
  const eatenCheese = await getEatenCheesePositions(userId, maze.id);

  // Get a list of uneaten cheese that is still in the maze.
  const uneatenCheese = maze.cheese.filter(
    (cheese) => !eatenCheese.some(
      (eaten) => eaten.x === cheese.x && eaten.y === cheese.y
    )
  );

  // Calculate smell intensity based on distance to uneaten cheese.
  // A cheese has a smell radius of 10 cells. The smell intensity is inversely proportional to the distance.
  const radius = 10;
  let smellIntensity = 0;
  for (const cheese of uneatenCheese) {
    // Euclidean distance (as the crow files) - pythagorean theorem
    const distance = Math.sqrt(Math.pow(cheese.x - position.x, 2) + Math.pow(cheese.y - position.y, 2));
    
    // Divide by `radius` to normalize the smell intensity to a value between 0 and 1.
    smellIntensity += Math.max(0, radius - distance) / radius;
  }

  // Insert an action denoting the rat has smelled.
  await insertAction(userId, maze.id, ActionType.Smell, position, true);

  // Return the smell intensity to the nearest 4 decimal places.
  return parseFloat(smellIntensity.toFixed(4));
}

export const eatCheese = async (userId: number, maze: Maze, position: Coordinate,): Promise<boolean> => {
  const currentCell = MazeService.getCellAtPosition(maze, position, userId);
  if (currentCell == undefined) {
    throw new Error("Cell does not exist in maze!");
  }

  // Keep track of whether the rat moved, or not.
  const didEat = currentCell.type == CellType.Cheese;

  if (didEat) {
    // If the rat ate the cheese, update the cache.
    await saveEatenCheeseToCache(userId, maze.id, position);
  }

  // Insert an action denoting the rat attempted to eat.
  await insertAction(userId, maze.id, ActionType.Eat, position, didEat);

  return didEat;
}

// Helper method used to insert action record in the database.
export const insertAction = async (
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

export const resetMaze = async (userId: number, mazeId: string): Promise<void> => {
  // Delete actions
  pgQuery("DELETE FROM actions WHERE user_id = $1 AND maze_id = $2", [userId, mazeId]);

  // Clear cache
  await clearRatPositionCache(userId, mazeId);
  await clearEatenCheeseCache(userId, mazeId);
};

