import { ActionType } from "@enums";
import { pgQuery } from "data/db";
import { Action, Coordinate } from "hackthelab";

export const getAll = (userId: number, mazeId: string): Promise<Action[]> => {
  return pgQuery("SELECT * FROM actions WHERE user_id = $1 AND maze_id = $2 ORDER BY time_ts DESC", [userId, mazeId]);
};

export const deleteForUserMaze = async (userId: number, mazeId: string): Promise<void> => {
  await pgQuery("DELETE FROM actions WHERE user_id = $1 AND maze_id = $2", [userId, mazeId]);
};

// Retrieve the number of actions for a rat in a maze whether they are successful actions or not.
export const getActionCount = async (userId: number, mazeId: string): Promise<number> => {
  const numOfActions = await pgQuery(
    `
          SELECT COUNT(*)
          FROM actions
          WHERE user_id = $1
          AND maze_id = $2
          GROUP BY action_type
        `,
    [userId, mazeId],
  );

  // Verify that we return some rows from the database query.
  if (numOfActions.length === 0) {
    return 0;
  }

  // Return the count property from the database row that was queried.
  return numOfActions[0].count;
};

// Retrieve the number of moves for a rat in a maze whether they are successful moves or not.
export const getMoveCount = async (userId: number, mazeId: string): Promise<number> => {
  const numOfMoves = await pgQuery(
    `
          SELECT COUNT(*)
          FROM actions
          WHERE user_id = $1
          AND maze_id = $2
          AND action_type = 'MOVE'
          GROUP BY action_type
        `,
    [userId, mazeId],
  );

  // Verify that we return some rows from the database query.
  if (numOfMoves.length === 0) {
    return 0;
  }

  // Return the count property from the database row that was queried.
  return numOfMoves[0].count;
};

export const create = async (
  userId: number,
  mazeId: string,
  actionType: ActionType,
  position: Coordinate,
  actionData: any,
  success: boolean = true,
) => {
  await pgQuery("INSERT INTO actions (user_id, maze_id, action_type, position, action_data, success) VALUES ($1, $2, $3, $4, $5, $6)", [
    userId,
    mazeId,
    actionType,
    position,
    actionData,
    success,
  ]);
};
