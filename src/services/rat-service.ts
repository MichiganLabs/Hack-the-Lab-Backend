import { ActionType, CellType, Direction } from "@enums";
import { ActionRepository, RatRepository } from "data/repository";
import { getGrabbedCheese } from "data/repository/rat-repository";
import { Cell, Coordinate, Maze } from "hackthelab";
import { MazeService } from "services";
import { dijkstra } from "utils";

export const moveRat = async (userId: number, maze: Maze, position: Coordinate, direction: Direction): Promise<boolean> => {
  // Keep track of whether the rat moved, or not.
  let didMove = false;

  const currentCell = await getCellAtPosition(maze, position, userId);
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
    await RatRepository.saveRatPositionToCache(userId, maze.id, position);
  }

  // Insert an action denoting the rat has moved.
  await insertAction(userId, maze.id, ActionType.Move, position, { direction }, didMove);

  return didMove;
};

export const smell = async (userId: number, maze: Maze, position: Coordinate): Promise<number> => {
  const eatenCheese = await RatRepository.getEatenCheesePositions(userId, maze.id);
  const droppedCheese = await RatRepository.getDroppedCheesePositions(userId, maze.id);
  const grabbedCheese = await RatRepository.getGrabbedCheese(userId, maze.id);

  // Filter out the cheese that has been successfully eaten, dropped, or grabbed.
  const remainingCheese = maze.cheese.filter(
    cheese =>
      !eatenCheese.some(eaten => eaten.x === cheese.x && eaten.y === cheese.y) &&
      !droppedCheese.some(dropped => dropped.x === cheese.x && dropped.y == cheese.y) &&
      (grabbedCheese == null || (grabbedCheese.x !== cheese.x && grabbedCheese.y !== cheese.y)),
  );

  // Calculates the distance to the closest uneaten cheese.
  // A rat has a smell radius of 10 cells. The distance is the number of steps to the nearest cheese.
  const radius = 5;
  const distance = dijkstra(maze, position, remainingCheese, radius);

  // Insert an action denoting the rat has smelled.
  await insertAction(userId, maze.id, ActionType.Smell, position, { distance }, true);

  // Return the distance.
  return distance;
};

export const eatCheese = async (userId: number, maze: Maze, position: Coordinate): Promise<boolean> => {
  const currentCell = await getCellAtPosition(maze, position, userId);
  if (currentCell == undefined) {
    throw new Error("Cell does not exist in maze!");
  }

  // Follows logic outlined by https://msljira.atlassian.net/browse/HTL-79
  const canEat = currentCell.type == CellType.Cheese;
  const grabbedCheese = await getGrabbedCheese(userId, maze.id);

  // Keep track of whether the rat moved, or not.
  const didEat = canEat || grabbedCheese != null;

  // Is the cell the rat is standing on cheese?
  if (canEat) {
    // If the rat ate the cheese, update the cache.
    await RatRepository.saveEatenCheeseToCache(userId, maze.id, [position]);
  } else if (grabbedCheese != null) {
    await RatRepository.saveEatenCheeseToCache(userId, maze.id, [grabbedCheese]);
    await RatRepository.clearGrabbedCheeseCache(userId, maze.id);
  }

  // Insert an action denoting the rat attempted to eat.
  await insertAction(userId, maze.id, ActionType.Eat, position, position, didEat);

  return didEat;
};

export const grabCheese = async (userId: number, maze: Maze, position: Coordinate): Promise<boolean> => {
  const currentCell = await getCellAtPosition(maze, position, userId);
  if (currentCell == undefined) {
    throw new Error("Cell does not exist in maze!");
  }

  // Keep track of whether the rat grabbed, or not.
  const canGrab = currentCell.type == CellType.Cheese;
  const grabbedCheese = await getGrabbedCheese(userId, maze.id);

  // If the rat can grab the cheese, and is not holding on to cheese.
  const didGrab = canGrab && grabbedCheese == null;

  // If the rat grabbed the cheese, update the cache.
  if (didGrab) {
    await RatRepository.saveGrabbedCheeseToCache(userId, maze.id, position);
  }

  // Insert an action denoting the rat attempted to grab.
  await insertAction(userId, maze.id, ActionType.Grab, position, position, didGrab);

  return didGrab;
};

export const dropCheese = async (userId: number, maze: Maze, position: Coordinate): Promise<boolean> => {
  const currentCell = await getCellAtPosition(maze, position, userId);
  if (currentCell == undefined) {
    throw new Error("Cell does not exist in maze!");
  }

  const canDrop = currentCell.type == CellType.Exit;
  const grabbedCheese = await getGrabbedCheese(userId, maze.id);

  // If the rat can drop the cheese, and is holding on to cheese.
  const didDrop = canDrop && grabbedCheese != null;

  // If the rat dropped the cheese, update the cache.
  if (didDrop) {
    await RatRepository.saveDroppedCheeseToCache(userId, maze.id, [grabbedCheese]);
    await RatRepository.clearGrabbedCheeseCache(userId, maze.id);
  }

  // Insert an action denoting the rat attempted to drop.
  await insertAction(userId, maze.id, ActionType.Drop, position, grabbedCheese, didDrop);

  return didDrop;
};

// If `userId` is provided, checks the cell type/surroundings for cheese and updates the cell type/surrounds to Open if the user has eaten the cheese.
// If `userId` is not provided, returns the original cell.
export const getCellAtPosition = async (maze: Maze, ratPosition: Coordinate, userId: number): Promise<Cell> => {
  const editedCell = MazeService.getAdminCellAtPosition(maze, ratPosition);
  const { x: ratX, y: ratY } = ratPosition;

  const { north, east, south, west } = editedCell.surroundings;
  const cellTypes = [editedCell.type, north, east, south, west];

  // Only fetch the rat's eaten cheese if the current cell, or one of it's surroundings, is cheese.
  if (cellTypes.includes(CellType.Cheese)) {
    const eatenCheesePositions = await RatRepository.getEatenCheesePositions(userId, maze.id);
    const droppedCheese = await RatRepository.getDroppedCheesePositions(userId, maze.id);
    const grabbedCheese = await getGrabbedCheese(userId, maze.id);

    // Combine the eaten and dropped cheese positions.
    const removedCheese = eatenCheesePositions.concat(droppedCheese);

    // If the rat is holding on to cheese, add the grabbed cheese to the list of removed cheese.
    if (grabbedCheese != null) removedCheese.push(grabbedCheese);

    // Update the cell type/surroundings to Open if the user has eaten, grabbed or dropped the cheese.
    for (const coord of removedCheese) {
      const dx = coord.x - ratX;
      const dy = coord.y - ratY;

      switch (true) {
        case dx === 0 && dy === 0:
          editedCell.type = CellType.Open;
          break;
        case dx === 0 && dy === -1:
          editedCell.surroundings.north = CellType.Open;
          break;
        case dx === 1 && dy === 0:
          editedCell.surroundings.east = CellType.Open;
          break;
        case dx === 0 && dy === 1:
          editedCell.surroundings.south = CellType.Open;
          break;
        case dx === -1 && dy === 0:
          editedCell.surroundings.west = CellType.Open;
          break;
      }
    }
  }

  // Intentionally remove the `coordinates` property from the AdminCell to return a Cell.
  delete editedCell.coordinates;

  return editedCell;
};

export const exitMaze = async (userId: number, maze: Maze, position: Coordinate): Promise<boolean> => {
  const currentCell = await getCellAtPosition(maze, position, userId);
  if (currentCell == undefined) {
    throw new Error("Cell does not exist in maze!");
  }

  // Keep track of whether the rat exited, or not.
  const didExit = currentCell.type == CellType.Exit;

  if (didExit) {
    // If the rat exited the maze, update the cache.
    await RatRepository.saveExitMazeToCache(userId, maze.id, didExit);
  }

  // Insert an action denoting the rat attempted to exit.
  await insertAction(userId, maze.id, ActionType.Exit, position, null, didExit);

  return didExit;
};

// Helper method used to insert action record in the database.
export const insertAction = async (
  userId: number,
  mazeId: string,
  actionType: ActionType,
  position: Coordinate,
  actionData: object,
  success: boolean = true,
): Promise<any> => {
  await ActionRepository.create(userId, mazeId, actionType, position, actionData, success);
};

// Retrieve the number of actions for a rat in a maze whether they are successful actions or not.
export const getNumOfActions = (userId: number, mazeId: string): Promise<number> => {
  return ActionRepository.getActionCount(userId, mazeId);
};

// Retrieve the number of moves for a rat in a maze whether they are successful moves or not.
export const getNumOfMoves = (userId: number, mazeId: string): Promise<number> => {
  return ActionRepository.getMoveCount(userId, mazeId);
};

export const resetMaze = async (userId: number, mazeId: string): Promise<void> => {
  // Delete actions
  await ActionRepository.deleteForUserMaze(userId, mazeId);

  // Clear cache
  await RatRepository.clearRatPositionCache(userId, mazeId);
  await RatRepository.clearGrabbedCheeseCache(userId, mazeId);
  await RatRepository.clearDroppedCheeseCache(userId, mazeId);
  await RatRepository.clearEatenCheeseCache(userId, mazeId);
  await RatRepository.clearExitMazeCache(userId, mazeId);
};
