import { ActionType, Environment, Role } from "@enums";
import { pgQuery } from "data/db";
import { UserRepository } from "data/repository";
import { Action, Award, RankingResult, Score } from "hackthelab";
import { MazeService, ScoreService } from "services";

export const calculateScore = (actions: Action[]): number => {
  const EXIT_BONUS = 5000;
  const CHEESE_BONUS = 1000;
  const HARVEST_BONUS = 2500;
  const MOVE_PENALTY = 2;
  const ACTION_PENALTY = 1;

  // Get stats based on the rat's actions
  const numOfActions = actions.length;

  let numOfMoves = 0;
  let numOfCheeseEaten = 0;
  let numOfCheeseHarvested = 0;
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
        case ActionType.Drop:
          numOfCheeseHarvested++;
          break;
      }
    }
  });

  // Calculate the score
  const exitBonus = didExit ? EXIT_BONUS : 0;
  const cheeseBonus = numOfCheeseEaten * CHEESE_BONUS;
  const harvestBonus = numOfCheeseHarvested * HARVEST_BONUS;
  const actionPenalty = numOfActions * ACTION_PENALTY;
  const movePenalty = numOfMoves * MOVE_PENALTY;

  const bonuses = exitBonus + cheeseBonus + harvestBonus;
  const penalties = actionPenalty + movePenalty;

  // Calculate the net score
  const netScore = bonuses - penalties;

  // Add up everything, but don't let the score go below 0.
  return Math.max(0, netScore);
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
      const score = ScoreService.calculateScore(actions);

      totalScore += score;
    }

    scores.push({
      userId: userId,
      score: totalScore,
    });
  }

  const awards: Award[] = [];

  // Most moves (successful only)
  // -------------------------
  const mostMoves = await pgQuery(
    `
    SELECT user_id, COUNT(*) as move_count
    FROM actions
    WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
    GROUP BY user_id
    ORDER BY move_count DESC
    `,
    [mazeIds, ActionType.Move],
  );

  // *AWARD* Most Moves
  if (mostMoves.length > 0) {
    // Because the query is ordered by move_count DESC, the first item represents the most moves
    const maxMoveCount = mostMoves[0].moveCount;
    for (const result of mostMoves) {
      if (result != maxMoveCount) {
        break;
      }

      const mostMovesAward: Award = {
        name: "World Traveler",
        description: "The rat who made the most moves",
        userId: result.userId,
        value: result.moveCount,
      };
      awards.push(mostMovesAward);
    }
  }

  // Least moves and most completed mazes
  // -------------------------
  const leastMoves = await pgQuery(
    `
    WITH exit_counts AS (
      SELECT user_id, COUNT(*) as exit_count
      FROM actions
      WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
      GROUP BY user_id
    ),
    move_counts AS (
      SELECT user_id, COUNT(*) as move_count
      FROM actions
      WHERE maze_id = ANY($1) AND action_type = $3
      GROUP BY user_id
    )
    SELECT e.user_id, e.exit_count, m.move_count
    FROM exit_counts e
    JOIN move_counts m ON e.user_id = m.user_id
    WHERE e.exit_count = (SELECT MAX(exit_count) FROM exit_counts)
    AND m.move_count = (SELECT MIN(move_count) FROM move_counts)
    ORDER BY e.exit_count DESC, m.move_count ASC
    `,
    [mazeIds, ActionType.Exit, ActionType.Move],
  );

  // *AWARD* Least Moves
  if (leastMoves.length > 0) {
    // Because the query is ordered by exit_count DESC and move_count ASC, the first item represents the least moves
    const minMoveCount = leastMoves[0].moveCount;
    for (const result of leastMoves) {
      if (result.moveCount != minMoveCount) {
        break;
      }

      const leastMovesAward: Award = {
        name: "Move Strategist",
        description: "The rat who made the least amount of moves and completed the most mazes",
        userId: result.userId,
        value: result.moveCount,
      };
      awards.push(leastMovesAward);
    }
  }

  // Most Cheese Eaten
  // -------------------------
  const cheeseEaten = await pgQuery(
    `
    SELECT user_id, COUNT(*) as cheese_count
    FROM actions
    WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
    GROUP BY user_id
    ORDER BY cheese_count DESC
    `,
    [mazeIds, ActionType.Eat],
  );

  // *AWARD* Most Cheese Eaten
  if (cheeseEaten.length > 0) {
    // Because the query is ordered by cheese_count DESC, the first item represents the most cheese eaten
    const maxCheeseCount = cheeseEaten[0].cheeseCount;
    for (const result of cheeseEaten) {
      if (result.cheeseCount != maxCheeseCount) {
        break;
      }

      const mostCheeseEatenAward: Award = {
        name: "Cheese Hoarder",
        description: "The rat who ate the most cheese",
        userId: result.userId,
        value: result.cheeseCount,
      };
      awards.push(mostCheeseEatenAward);
    }

    const minCheeseCount = cheeseEaten[cheeseEaten.length - 1].cheeseCount;
    for (const result of cheeseEaten.reverse()) {
      if (result.cheeseCount != minCheeseCount) {
        break;
      }

      const leastCheeseEatenAward: Award = {
        name: "Famished",
        description: "The rat who ate the least amount of cheese",
        userId: result.userId,
        value: result.cheeseCount,
      };
      awards.push(leastCheeseEatenAward);
    }
  }

  // Most smells
  // -------------------------
  const mostSmells = await pgQuery(
    `
    SELECT user_id, COUNT(*) as smell_count
    FROM actions
    WHERE maze_id = ANY($1) AND action_type = $2
    GROUP BY user_id
    ORDER BY smell_count DESC
    `,
    [mazeIds, ActionType.Smell],
  );

  // *AWARD* Most Smells
  if (mostSmells.length > 0) {
    // Because the query is ordered by smell_count DESC, the first item represents the most smells
    const maxSmellCount = mostSmells[0].smellCount;
    for (const result of mostSmells) {
      if (result.smellCount != maxSmellCount) {
        break;
      }

      const mostSmellsAward: Award = {
        name: "Nosiest",
        description: "The rat who smelled the most",
        userId: result.userId,
        value: result.smellCount,
      };
      awards.push(mostSmellsAward);
    }
  }

  // Did not smell
  // -------------------------
  const noSmells = participants.filter(participant => !mostSmells.some(item => item.user_id === participant.id));

  // *AWARD* Never using smell
  if (noSmells.length > 0) {
    for (const participant of noSmells) {
      const neverSmelledAward: Award = {
        name: "Nose Blind",
        description: "The rat who never used their nose",
        userId: participant.id,
        value: "0",
      };
      awards.push(neverSmelledAward);
    }
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
  if (wallsHit.length > 0) {
    // Because the query is ordered by wall_count DESC, the first item represents the most walls hit
    const maxWallCount = wallsHit[0].wallCount;
    for (const result of wallsHit) {
      if (result.wallCount != maxWallCount) {
        break;
      }

      const mostWallsHitAward: Award = {
        name: "Dazed",
        description: "The rat who ran into the most walls",
        userId: result.userId,
        value: result.wallCount,
      };
      awards.push(mostWallsHitAward);
    }
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
    `,
    [mazeIds, ActionType.Move],
  );

  // *AWARD* Most Revisited Cell
  if (mostRevisitedCell.length > 0) {
    // Because the query is ordered by revisit_count DESC, the first item represents the most revisited cell
    const maxRevisitCount = mostRevisitedCell[0].revisitCount;
    for (const result of mostRevisitedCell) {
      if (result.revisitCount != maxRevisitCount) {
        break;
      }

      const mostRevisitedCellAward: Award = {
        name: "Favorite Spot",
        description: "The rat who revisited a single cell the most",
        userId: result.userId,
        value: result.revisitCount,
      };
      awards.push(mostRevisitedCellAward);
    }
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
  if (mostRevisitedCells.length > 0) {
    // Because the query is ordered by cells_revisited DESC, the first item represents the most revisited cells
    const maxRevisitedCount = mostRevisitedCells[0].revisitCount;
    for (const result of mostRevisitedCells) {
      if (result.revisitCount != maxRevisitedCount) {
        break;
      }

      const mostRevisitedCellsAward: Award = {
        name: "Deja Vu",
        description: "The rat who revisited the most cells",
        userId: result.userId,
        value: result.revisitCount,
      };
      awards.push(mostRevisitedCellsAward);
    }
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
    `,
    [mazeIds],
  );

  // *AWARD* Most Failed Actions
  if (mostFailedActions.length > 0) {
    // Because the query is ordered by fail_count DESC, the first item represents the most failed actions
    const maxFailCount = mostFailedActions[0].failCount;
    for (const result of mostFailedActions) {
      if (result.failCount != maxFailCount) {
        break;
      }

      const mostFailedActionsAward: Award = {
        name: "Clumsiest",
        description: "The rat who attempted actions that failed the most",
        userId: result.userId,
        value: result.failCount,
      };
      awards.push(mostFailedActionsAward);
    }
  }

  // Least failed actions while completing the most mazes
  // -------------------------
  const leastFailedActions = await pgQuery(
    `
    WITH exit_counts AS (
      SELECT user_id, COUNT(*) as exit_count
      FROM actions
      WHERE maze_id = ANY($1) AND action_type = $2 AND success = true
      GROUP BY user_id
    ),
    failed_counts AS (
      SELECT user_id, COUNT(*) as failed_count
      FROM actions
      WHERE maze_id = ANY($1) AND success = false
      GROUP BY user_id
    )
    SELECT e.user_id, e.exit_count, m.failed_count
    FROM exit_counts e
    JOIN failed_counts m ON e.user_id = m.user_id
    WHERE e.exit_count = (SELECT MAX(exit_count) FROM exit_counts)
    AND m.failed_count = (SELECT MIN(failed_count) FROM failed_counts)
    ORDER BY e.exit_count DESC, m.failed_count ASC
    `,
    [mazeIds, ActionType.Exit],
  );

  // *AWARD* No Failed Actions
  if (leastFailedActions.length > 0) {
    for (const result of leastFailedActions) {
      const noFailedActionsAward: Award = {
        name: "Coordinated",
        description: "The rat who made the least amount of failed actions while completing the most mazes",
        userId: result.id,
        value: result.failedCount,
      };
      awards.push(noFailedActionsAward);
    }
  }

  // Last to hit the API (Sandbox OR Competition)
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
  if (lastToHitAPI.length > 0) {
    const lastToHitAPIAward: Award = {
      name: "Procrastinator",
      description: "The last rat to hit the API",
      userId: lastToHitAPI[0].userId,
      value: lastToHitAPI[0].lastHit,
    };
    awards.push(lastToHitAPIAward);
  }

  // Hit the API first (Sandbox OR Competition)
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
  if (firstToHitAPI.length > 0) {
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
  if (firstToMove.length > 0) {
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
