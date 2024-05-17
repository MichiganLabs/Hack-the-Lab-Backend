import { ActionType, CellType, Environment, Role } from "@enums";
import { pgQuery } from "data/db";
import { UserRepository } from "data/repository";
import { Action, Award, Maze, RankingResult, Score } from "hackthelab";
import { MazeService, ScoreService } from "services";

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
  return Math.floor(Math.max(0, exitBonus + moveEfficiencyBonus + cheeseBonus - actionPenalty));
};

// Returns the rankings for all participants for the given maze ids
export const getRankings = async (environment: Environment): Promise<RankingResult> => {
  // Get all mazes for the provided environment
  const mazes = await MazeService.getMazesForEnvironments([environment], true);
  const mazeIds = Object.keys(mazes);

  // Get all participants in the competition
  const participants = await UserRepository.getUsersOfRole(Role.Participant);
  const participantIds = participants.map(participant => participant.id);

  const scores: Score[] = [];

  // For each participant, calculate their score
  // Loop through all of the participants of the provided mazes
  for (const userId of participantIds) {
    let totalScore: number = 0;

    // Loop through each maze to determine the participant's score for each maze
    for (const mazeId of mazeIds) {
      const maze = mazes[mazeId];
      if (!maze) {
        continue;
      }

      const actions = await MazeService.getActions(userId, mazeId);
      const score = ScoreService.getScore(userId, mazes[mazeId], actions);

      totalScore += score;
    }

    scores.push({
      userId: userId,
      score: totalScore,
    });
  }

  const awards: Award[] = [];

  /*
    -------------------------
    --------- Ideas ---------
    -------------------------

    Fastest action calls

    Rats who ran out of moves

    Rat who went North the most

    Sent the same request the most
    */

  // Most moves (successful only)
  // -------------------------
  const mostMoves = await pgQuery(
    `
        SELECT user_id, COUNT(*) as move_count
        FROM actions
        WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
        GROUP BY user_id
        ORDER BY move_count DESC
        LIMIT 1
    `,
    [mazeIds, ActionType.Move],
  );

  // *AWARD* Most Moves
  if (mostMoves.length != 0) {
    const mostMovesAward: Award = {
      name: "World Traveler",
      description: "The rat who made the most moves",
      userId: mostMoves[0].userId,
      value: mostMoves[0].moveCount,
    };
    awards.push(mostMovesAward);
  }

  // Least Moves and still completed all mazes
  // -------------------------
  const leastMoves = await pgQuery(
    `
        SELECT user_id, COUNT(*) as move_count
        FROM actions
        WHERE maze_id = ANY($1) AND action_type = $2
        GROUP BY user_id
        HAVING ARRAY_LENGTH(ARRAY_AGG(DISTINCT actions.maze_id), 1) = ARRAY_LENGTH($1, 1)
        ORDER BY move_count ASC
        LIMIT 1
    `,
    [mazeIds, ActionType.Move],
  );

  // *AWARD* Least Moves
  if (leastMoves.length != 0) {
    const leastMovesAward: Award = {
      name: "Move Strategist",
      description: "The rat who made the least amount of moves and still completed all mazes",
      userId: leastMoves[0].userId,
      value: leastMoves[0].moveCount,
    };
    awards.push(leastMovesAward);
  }

  // Most Cheese Eaten
  // -------------------------
  const cheeseEaten = await pgQuery(
    `
        SELECT user_id, COUNT(*) as cheese_count
        FROM actions
        WHERE maze_id = ANY($1) AND action_type = $2
        GROUP BY user_id
        ORDER BY cheese_count DESC
        LIMIT 1
    `,
    [mazeIds, ActionType.Eat],
  );

  // *AWARD* Most Cheese Eaten
  const mostCheeseEaten = cheeseEaten[0];
  if (mostCheeseEaten != undefined) {
    const mostCheeseEatenAward: Award = {
      name: "Cheese Hoarder",
      description: "The rat who ate the most cheese",
      userId: mostCheeseEaten.userId,
      value: mostCheeseEaten.cheeseCount,
    };
    awards.push(mostCheeseEatenAward);
  }

  // *AWARD* Least Cheese Eaten
  const leastCheeseEaten = cheeseEaten[cheeseEaten.length - 1];
  if (leastCheeseEaten != undefined && leastCheeseEaten.userId != mostCheeseEaten.userId) {
    const leastCheeseEatenAward: Award = {
      name: "Famished",
      description: "The rat who ate the least amount of cheese",
      userId: leastCheeseEaten.userId,
      value: leastCheeseEaten.cheeseCount,
    };
    awards.push(leastCheeseEatenAward);
  }

  // Most smells
  // -------------------------
  const mostSmells = await pgQuery(
    `
        SELECT user_id, COUNT(*) as smell_count
        FROM actions
        WHERE maze_id = ANY($1) AND action_type = $2
        GROUP BY user_id
        ORDER BY smell_count
        DESC
    `,
    [mazeIds, ActionType.Smell],
  );

  // *AWARD* Most Smells
  if (mostSmells.length != 0) {
    const mostSmellsAward: Award = {
      name: "Nosiest",
      description: "The rat who smelled the most",
      userId: mostSmells[0].userId,
      value: mostSmells[0].smellCount,
    };
    awards.push(mostSmellsAward);
  }

  // Did not smell
  // -------------------------
  const noSmells = await pgQuery(
    `
        SELECT user_id, COUNT(*) as smell_count
        FROM actions
        WHERE maze_id = ANY($1) AND action_type = $2
        GROUP BY user_id
        HAVING COUNT(*) = 0
        LIMIT 1
    `,
    [mazeIds, ActionType.Smell],
  );

  // *AWARD* Never using smell
  if (noSmells.length != 0) {
    const leastSmellsAward: Award = {
      name: "Nose Blind",
      description: "The rat who never used their nose",
      userId: noSmells[0].userId,
      value: noSmells[0].smellCount,
    };
    awards.push(leastSmellsAward);
  }

  // Ran into the most walls
  // -------------------------
  const wallsHit = await pgQuery(
    `
        SELECT user_id, COUNT(*) as wall_count
        FROM actions
        WHERE maze_id = ANY($1) AND action_type = $2 AND success = false
        GROUP BY user_id
        ORDER BY wall_count DESC
    `,
    [mazeIds, ActionType.Move],
  );

  // *AWARD* Most Walls Hit
  const mostWallsHit = wallsHit[0];
  if (mostWallsHit != undefined) {
    const mostWallsHitAward: Award = {
      name: "Dazed",
      description: "The rat who ran into the most walls",
      userId: mostWallsHit.userId,
      value: mostWallsHit.wallCount,
    };
    awards.push(mostWallsHitAward);
  }

  // Revisited the same cell the most
  // -------------------------
  const mostRevisitedCell = await pgQuery(
    `
        SELECT user_id, maze_id, position::text, COUNT(*) as revisit_count
        FROM actions
        WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
        GROUP BY user_id, maze_id, position::text
        HAVING COUNT(*) >= 2
        ORDER BY revisit_count DESC
        LIMIT 1
    `,
    [mazeIds, ActionType.Move],
  );

  // *AWARD* Most Revisited Cell
  if (mostRevisitedCell.length != 0) {
    const mostRevisitedCellAward: Award = {
      name: "Favorite Spot",
      description: "The rat who revisited a single cell the most",
      userId: mostRevisitedCell[0].userId,
      value: mostRevisitedCell[0].revisitCount,
    };
    awards.push(mostRevisitedCellAward);
  }

  // Most Revisited Cells
  // -------------------------
  const mostRevisitedCells = await pgQuery(
    `
        SELECT user_id, count(user_id) as cells_revisited
        FROM (
          SELECT user_id, position::text, COUNT(*) as revisit_count
            FROM actions
            WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
            GROUP BY position::text, user_id
            HAVING COUNT(*) >= 2
        ) subquery
        GROUP BY user_id
        ORDER BY cells_revisited DESC
    `,
    [mazeIds, ActionType.Move],
  );

  // *AWARD* Most Revisited Cells
  if (mostRevisitedCells.length != 0) {
    const mostRevisitedCellsAward: Award = {
      name: "Deja Vu",
      description: "The rat who revisited the most cells",
      userId: mostRevisitedCells[0].userId,
      value: mostRevisitedCells[0].revisitCount,
    };
    awards.push(mostRevisitedCellsAward);
  }

  // Most failed actions
  // -------------------------
  const mostFailedActions = await pgQuery(
    `
        SELECT user_id, COUNT(*) as fail_count
        FROM actions
        WHERE maze_id = ANY($1) AND success = false
        GROUP BY user_id
        ORDER BY fail_count DESC
        LIMIT 1
    `,
    [mazeIds],
  );

  // *AWARD* Most Failed Actions
  if (mostFailedActions.length != 0) {
    const mostFailedActionsAward: Award = {
      name: "Clumsiest",
      description: "The rat who attempted actions that failed the most",
      userId: mostFailedActions[0].userId,
      value: mostFailedActions[0].failCount,
    };
    awards.push(mostFailedActionsAward);
  }

  const noFailedActions = await pgQuery(
    `
        SELECT user_id, COUNT(*) as fail_count
        FROM actions
        WHERE maze_id = ANY($1) AND success = false
        GROUP BY user_id
        HAVING COUNT(*) = 0 AND ARRAY_LENGTH(ARRAY_AGG(DISTINCT actions.maze_id), 1) = ARRAY_LENGTH($1, 1)
        LIMIT 1
    `,
    [mazeIds],
  );

  // *AWARD* No Failed Actions
  if (noFailedActions.length != 0) {
    const leastFailedActionsAward: Award = {
      name: "Coordinated",
      description: "The rat who did not make a single failed action and completed all mazes",
      userId: noFailedActions[0].userId,
      value: noFailedActions[0].failCount,
    };
    awards.push(leastFailedActionsAward);
  }

  // Last to hit the API
  // -------------------------
  const lastToHitAPI = await pgQuery(
    `
        SELECT user_id, MAX(time_ts) as last_hit
        FROM analytics
        WHERE user_id = ANY($1)
        GROUP BY user_id
        ORDER BY last_hit DESC
        LIMIT 1
    `,
    [participantIds],
  );

  // *AWARD* Last to hit the API
  if (lastToHitAPI.length != 0) {
    const lastToHitAPIAward: Award = {
      name: "Procrastinator",
      description: "The last rat to hit the API",
      userId: lastToHitAPI[0].userId,
      value: lastToHitAPI[0].lastHit,
    };
    awards.push(lastToHitAPIAward);
  }

  // Hit the API first
  // -------------------------
  const firstToHitAPI = await pgQuery(
    `
        SELECT user_id, MIN(time_ts) as first_hit
        FROM analytics
        WHERE user_id = ANY($1)
        GROUP BY user_id
        ORDER BY first_hit ASC
        LIMIT 1
    `,
    [participantIds],
  );

  // *AWARD* First to hit the API
  if (firstToHitAPI.length != 0) {
    const firstToHitAPIAward: Award = {
      name: "Is This Thing On?",
      description: "The first rat to hit the API",
      userId: firstToHitAPI[0].userId,
      value: firstToHitAPI[0].firstHit,
    };
    awards.push(firstToHitAPIAward);
  }

  // First to make a move in one of the competition mazes
  // -------------------------
  const firstToMove = await pgQuery(
    `
        SELECT user_id, MIN(time_ts) as first_move
        FROM actions
        WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
        GROUP BY user_id
        ORDER BY first_move ASC
        LIMIT 1
    `,
    [mazeIds, ActionType.Move],
  );

  // *AWARD* First to make a move
  if (firstToMove.length != 0) {
    const firstToMoveAward: Award = {
      name: "Trail Blazer",
      description: "The first rat to make a move in one of the competition mazes",
      userId: firstToMove[0].userId,
      value: firstToMove[0].firstMove,
    };
    awards.push(firstToMoveAward);
  }

  return {
    scores: scores,
    awards: awards,
  };
};
