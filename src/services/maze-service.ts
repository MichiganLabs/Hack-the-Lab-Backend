import { ActionType, CellType, Environment, Role } from "@enums";
import { ActionRepository, MazeRepository } from "data/repository";
import { Action, AdminCell, AdminMaze, Coordinate, Maze } from "hackthelab";
import { MazeService } from "services";

type MazeDictionary = { [key: string]: AdminMaze };

const mazeStore: { [key in Environment]: MazeDictionary } = {
  [Environment.Competition]: {},
  [Environment.Sandbox]: {},
};

export const getActions = async (userId: number, mazeId: string): Promise<Action[]> => {
  return await ActionRepository.getAll(userId, mazeId);
};

export const getMazes = async (): Promise<MazeDictionary> => {
  await loadMazes();

  const combinedMazes: MazeDictionary = {};

  for (const mazes of Object.values(mazeStore)) {
    Object.assign(combinedMazes, mazes);
  }

  return combinedMazes;
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

export const getMazeById = async (mazeId: string): Promise<AdminMaze | null> => {
  const mazes = await getMazes();

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

export const loadMazes = async (): Promise<void> => {
  const mazes = await MazeRepository.getAll();

  for (const mazeDbo of mazes) {
    mazeStore[mazeDbo.environment][mazeDbo.id] = mazeDbo;
  }
};

export const setLocked = async (mazeId: string, locked: boolean): Promise<void> => {
  await MazeRepository.updateLocked(mazeId, locked);
};

export const isLocked = async (mazeId: string): Promise<boolean> => {
  return (await MazeService.getMazeById(mazeId)).locked;
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
  const moveEfficiencyBonus = didExit ? Math.max(0, ((openSpaceCount - numOfMoves) / openSpaceCount) * MOVE_EFFICIENCY_BONUS) : 0;
  const cheeseBonus = numOfCheeseEaten * CHEESE_BONUS;
  const actionPenalty = numOfActions * ACTION_PENALTY;

  // Add up everything, but don't let the score go below 0.
  return Math.max(0, exitBonus + moveEfficiencyBonus + cheeseBonus - actionPenalty);
};
