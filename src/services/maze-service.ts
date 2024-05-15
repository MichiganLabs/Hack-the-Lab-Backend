import { ActionType, CellType, Environment, Role } from "@enums";
import { pgQuery } from "data/db";
import * as fs from "fs/promises";
import { Action, AdminCell, Coordinate, Maze } from "hackthelab";
import path from "path";

const mazeDir = __dirname + "/../mazes";

type MazeDictionary = { [key: string]: Maze };

const mazeStore: { [key in Environment]: MazeDictionary } = {
  [Environment.Competition]: {},
  [Environment.Sandbox]: {},
};

export const getActions = (userId: number, mazeId: string): Promise<Action[]> => {
  return pgQuery("SELECT * FROM actions WHERE user_id = $1 AND maze_id = $2 ORDER BY time_ts DESC", [userId, mazeId]);
};

export const getMazes = async (environment: Environment[] | Environment): Promise<MazeDictionary> => {
  await loadMazes();

  if (Array.isArray(environment)) {
    const combinedMazes: MazeDictionary = {};

    for (const env of environment) {
      Object.assign(combinedMazes, mazeStore[env]);
    }

    return combinedMazes;
  } else {
    return mazeStore[environment];
  }
};

export const getEnvironmentsForRole = (role: Role): Environment[] => {
  switch (role) {
    case Role.Admin:
      return Object.values(Environment);
    case Role.Developer:
      return [Environment.Sandbox];
    case Role.Participant:
      return [Environment.Competition];
    default:
      return [];
  }
};

export const getMazeById = async (env: Environment[] | Environment, mazeId: string): Promise<Maze | null> => {
  const mazes = await getMazes(env);

  if (Object.hasOwnProperty.call(mazes, mazeId)) {
    return mazes[mazeId];
  }

  return null;
};

export const getAdminCellAtPosition = (maze: Maze, position: Coordinate): AdminCell => {
  const cols = maze.dimensions.horizontal;
  const index = position.y * cols + position.x;

  return maze.cells[index];
};

export const loadMazesForEnvironment = async (environment: Environment): Promise<void> => {
  const envDir = path.join(mazeDir, environment.toLowerCase());

  try {
    await fs.access(envDir);
  } catch {
    return;
  }

  try {
    const fileNames = await fs.readdir(envDir);
    for (const fileName of fileNames) {
      if (!fileName.endsWith(".json")) {
        continue;
      }

      const mazeId = fileName.replace(".json", "");

      // Only load mazes that have not already been loaded.
      if (!Object.hasOwnProperty.call(mazeStore[environment], mazeId)) {
        const mazeData = await fs.readFile(path.join(envDir, fileName), "utf8");
        const maze: Maze = JSON.parse(mazeData);
        maze.id = mazeId;

        mazeStore[environment][mazeId] = maze;
      }
    }
  } catch (e) {
    console.error(e);
  }
};

export const loadMazes = async (): Promise<void> => {
  for (const env of Object.values(Environment)) {
    await loadMazesForEnvironment(env);
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
