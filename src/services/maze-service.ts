import { ActionType, CellType } from "@enums";
import { pgQuery } from "data/db";
import * as fs from "fs/promises";
import { Action, AdminCell, Coordinate, Maze } from "hackthelab";
import path from "path";

const mazeDir = __dirname + "/../mazes";
const mazes: { [key: string]: Maze } = {};

export const getActions = (userId: number, mazeId: string): Promise<Action[]> => {
  return pgQuery("SELECT * FROM actions WHERE user_id = $1 AND maze_id = $2 ORDER BY time_ts DESC", [userId, mazeId]);
};

export const getMazeById = async (mazeId: string): Promise<Maze | null> => {
  if (Object.keys(mazes).length == 0) {
    await loadMazes();
  }

  if (Object.hasOwnProperty.call(mazes, mazeId)) {
    return mazes[mazeId];
  }

  return undefined;
};

export const getAdminCellAtPosition = (maze: Maze, position: Coordinate): AdminCell => {
  const cols = maze.dimensions.horizontal;
  const index = position.y * cols + position.x;

  return maze.cells[index];
};

export const mazeExists = async (mazeId: string): Promise<boolean> => (await getMazeById(mazeId)) !== undefined;

const loadMazes = async () => {
  try {
    const fileNames = await fs.readdir(mazeDir);
    for (const fileName of fileNames) {
      if (!fileName.endsWith(".json")) {
        continue;
      }

      const mazeId = fileName.replace(".json", "");

      // Only load mazes that have not already been loaded.
      if (!Object.hasOwnProperty.call(mazes, mazeId)) {
        const mazeData = await fs.readFile(path.join(mazeDir, fileName), "utf8");

        const maze: Maze = JSON.parse(mazeData);
        maze.id = mazeId;

        mazes[mazeId] = maze;
      }
    }
  } catch (e) {
    console.error(e);
  }
};

export const getScore = (userId: number, maze: Maze, actions: Action[]): number => {
  const MOVE_EFFICIENCY_BONUS = 2500;
  const EXIT_BONUS = 5000;
  const CHEESE_BONUS = 1000;
  const ACTION_PENALTY = 1;

  // Get the maze open spaces
  const wallCount = maze.cells.filter(cell => cell.type === CellType.Wall);
  const openSpaceCount = maze.cells.length - wallCount.length;

  // Get stats based on the rat's actions
  const numOfActions = actions.length;

  let numOfMoves = 0;
  let numOfCheeseEaten = 0;
  let didExit = false;

  actions.forEach(action => {
    if (action.success) {
      switch (action.actionType) {
        case ActionType.Move:
          numOfMoves++;
          break;
        case ActionType.Eat:
          numOfCheeseEaten++;
          break;
        case ActionType.Exit:
          didExit = true;
          break;
      }
    }
  });

  // Calculate the score
  const exitBonus = didExit ? EXIT_BONUS : 0;
  const moveEfficiencyBonus = didExit
    ? Math.max(0, ((openSpaceCount - numOfMoves) / openSpaceCount) * MOVE_EFFICIENCY_BONUS)
    : 0;
  const cheeseBonus = numOfCheeseEaten * CHEESE_BONUS;
  const actionPenalty = numOfActions * ACTION_PENALTY;

  // Add up everything, but don't let the score go below 0.
  return Math.max(0, exitBonus + moveEfficiencyBonus + cheeseBonus - actionPenalty);
};
