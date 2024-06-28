import { CellType } from "@enums";
import { Coordinate, Maze } from "hackthelab";
import { MazeService } from "services";

export const dijkstra = (maze: Maze, start: Coordinate, goals: Coordinate[], maxDistance: number) => {
  const dist = new Map<string, number>();
  const parent = new Map<string, Coordinate>();
  const priorityQueue = [];

  const toKey = (c: Coordinate) => `${c.x},${c.y}`;

  dist.set(toKey(start), 0);
  priorityQueue.push([0, start]);

  while (priorityQueue.length > 0) {
    priorityQueue.sort((a, b) => a[0] - b[0]);
    const [currentDistance, currentCell] = priorityQueue.shift()!;

    if (goals.some(exit => exit.x === currentCell.x && exit.y === currentCell.y)) {
      return currentDistance;
    }

    for (const neighbor of getNeighbors(currentCell, maze)) {
      const neighborKey = toKey(neighbor);
      const distance = currentDistance + 1;
      if (distance < (dist.get(neighborKey) || Infinity) && distance <= maxDistance) {
        dist.set(neighborKey, distance);
        priorityQueue.push([distance, neighbor]);
        parent.set(neighborKey, currentCell);
      }
    }
  }

  return null;
};

const getNeighbors = (origin: Coordinate, maze: Maze): Coordinate[] => {
  const neighbors: Coordinate[] = [];
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  for (const [dx, dy] of directions) {
    const x = origin.x + dx;
    const y = origin.y + dy;

    if (x < 0 || x >= maze.dimensions.horizontal || y < 0 || y >= maze.dimensions.vertical) {
      continue;
    }

    const cell = MazeService.getAdminCellAtPosition(maze, { x, y });
    if (cell.type !== CellType.Wall) {
      neighbors.push({ x, y });
    }
  }

  return neighbors;
};
