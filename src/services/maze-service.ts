import { Environment } from "@enums";
import { ActionRepository, MazeRepository } from "data/repository";
import { Action, AdminCell, AdminMaze, Coordinate, Maze, MazeDictionary, UserActions } from "hackthelab";

const mazeStore: { [key in Environment]: MazeDictionary } = {
  [Environment.Competition]: {},
  [Environment.Sandbox]: {},
};

export const getActions = (userId: number, mazeId: string): Promise<Action[]> => {
  return ActionRepository.getAllForUserMaze(userId, mazeId);
};

export const getAllActions = async (mazeId: string): Promise<UserActions[]> => {
  return ActionRepository.GetAllForMaze(mazeId);
};

export const getMazes = async (): Promise<MazeDictionary> => {
  await loadMazes();

  const combinedMazes: MazeDictionary = {};

  for (const mazes of Object.values(mazeStore)) {
    Object.assign(combinedMazes, mazes);
  }

  return combinedMazes;
};

export const getMazesForEnvironments = async (environments: Environment[], includeLocked: boolean): Promise<MazeDictionary> => {
  const mazes = await getMazes();

  return Object.fromEntries(
    Object.entries(mazes).filter(([_key, maze]) => environments.includes(maze.environment) && (includeLocked || !maze.locked)),
  );
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
  for (const environment of Object.values(Environment)) {
    mazeStore[environment] = {};
  }

  const mazes = await MazeRepository.getAll();

  for (const mazeDbo of mazes) {
    mazeStore[mazeDbo.environment][mazeDbo.id] = mazeDbo;
  }
};

export const setLocked = async (mazeId: string, locked: boolean): Promise<void> => {
  await MazeRepository.updateLocked(mazeId, locked);
};

export const isLocked = async (mazeId: string): Promise<boolean> => {
  return (await getMazeById(mazeId)).locked;
};
