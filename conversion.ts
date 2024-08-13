import * as fs from "fs";

export interface Maze {
  cells: Cell[];
  cheese: Coordinate[];
  exit: Coordinate;
  start: Coordinate;
  dimensions: Dimensions;
  openSquareCount: number;
}

export interface Row {
  cells: Cell[];
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Dimensions {
  horizontal: number;
  vertical: number;
}

export interface Cell {
  coordinates: Coordinate;
  type: CellType;
  surroundings: Surroundings;
}

export interface Surroundings {
  north: CellType;
  south: CellType;
  west: CellType;
  east: CellType;
}

enum CellType {
  Open = "Open",
  Wall = "Wall",
  Cheese = "Cheese",
  Beginning = "Start",
  End = "Exit",
}

function getCellType(cellTypeString: string): CellType {
  switch (cellTypeString.toUpperCase()) {
    case "W":
      return CellType.Wall;
    case "C":
      return CellType.Cheese;
    case "B":
      return CellType.Beginning;
    case "E":
      return CellType.End;
    default:
      return CellType.Open;
  }
}

function convertCsvToJson(csvFromGoogle: string) {
  const maze: Maze = {
    cells: [],
    cheese: [],
    exit: {
      x: 0,
      y: 0,
    },
    start: {
      x: 0,
      y: 0,
    },
    dimensions: {
      horizontal: 0,
      vertical: 0,
    },
    openSquareCount: 0,
  };

  const splitByNewLine = csvFromGoogle.replace(/\r/g, "").split("\n");
  const rows: Row[] = splitByNewLine.map((row, rowIndex): Row => {
    const splitCellTypes = row.split(",");

    const cells: Cell[] = splitCellTypes.map((csvCell: string, cellIndex): Cell => {
      const cellType: CellType = getCellType(csvCell);

      switch (cellType) {
        case CellType.Beginning:
          maze.start = {
            x: cellIndex,
            y: rowIndex,
          };
          break;
        case CellType.End:
          maze.exit = {
            x: cellIndex,
            y: rowIndex,
          };
          break;
        case CellType.Cheese:
          maze.cheese.push({
            x: cellIndex,
            y: rowIndex,
          });
          break;
        case CellType.Open:
          maze.openSquareCount++;
          break;
        default:
      }

      return {
        coordinates: {
          x: cellIndex,
          y: rowIndex,
        },
        type: cellType,
        surroundings: {
          north: CellType.Open,
          south: CellType.Open,
          west: CellType.Open,
          east: CellType.Open,
        },
      };
    });

    return {
      cells: cells,
    };
  });

  maze.dimensions.horizontal = rows[0].cells.length;
  maze.dimensions.vertical = rows.length;

  const calculatedRows: Row[] = rows.map((row: Row, rowIndex): Row => {
    const calculatedCells: Cell[] = row.cells.map((cell: Cell, cellIndex): Cell => {
      const newCell: Cell = row.cells[cellIndex];
      // North
      // If most north row, assume wall to north
      if (rowIndex == 0) {
        newCell.surroundings.north = CellType.Wall;
      } else {
        newCell.surroundings.north = rows[rowIndex - 1].cells[cellIndex].type;
      }

      // South
      // If most south row, assume wall to south
      if (rowIndex == rows.length - 1) {
        cell.surroundings.south = CellType.Wall;
      } else {
        cell.surroundings.south = rows[rowIndex + 1].cells[cellIndex].type;
      }

      // West
      // If furthest west column, assume wall to the west
      if (cellIndex == 0) {
        cell.surroundings.west = CellType.Wall;
      } else {
        cell.surroundings.west = row.cells[cellIndex - 1].type;
      }

      // East
      // If furthest east column, assume wall to the east
      if (cellIndex == row.cells.length - 1) {
        cell.surroundings.east = CellType.Wall;
      } else {
        cell.surroundings.east = row.cells[cellIndex + 1].type;
      }

      return newCell;
    });

    return {
      cells: calculatedCells,
    };
  });

  calculatedRows.forEach((row: Row) => {
    maze.cells = maze.cells.concat(row.cells);
  });

  function jsonSorter(key, value) {
    if (value === null) {
      return null;
    }
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "object") {
      return Object.fromEntries(Object.entries(value).sort());
    }
    return value;
  }

  return JSON.stringify(maze, jsonSorter, 4);
}

async function convertFromUrl(csvUrl: string, mazeName: string) {
  try {
    const res = await fetch(csvUrl, {
      method: "get",
      headers: { "content-type": "text/csv;charset=UTF-8" },
    });

    if (res.status === 200) {
      const data = await res.text();
      const result = convertCsvToJson(data);

      const fileName = `./mazes/${mazeName}.json`;

      // Create parent folder if it doesn't exist
      const parentFolder = fileName.substring(0, fileName.lastIndexOf("/"));
      fs.mkdirSync(parentFolder, { recursive: true });

      fs.writeFile(fileName, result, function (err) {
        if (err) {
          return console.error(err);
        }
        console.log(`File created for ${mazeName} Maze!`);
      });
    } else {
      console.log(`Error code ${res.status}`);
    }
  } catch (err) {
    console.log(`Error ${err}`);
  }
}

async function createMazes() {
  // Probably want to make this into a list that loops but whatever for now

  // Practice mazes

  // Straight Maze
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=222529255&single=true&output=csv`,
    "sandbox/Practice1",
  );

  // One Turn
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1730653816&single=true&output=csv`,
    "sandbox/Practice2",
  );

  // Multiple Turns
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1271783319&single=true&output=csv`,
    "sandbox/Practice3",
  );

  // Loop
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1310950333&single=true&output=csv`,
    "sandbox/Practice4",
  );

  // Dead Ends
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=189555194&single=true&output=csv`,
    "sandbox/Practice5",
  );

  // Cheese
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=113265412&single=true&output=csv`,
    "sandbox/Practice6",
  );

  // Basic (Only One Solution)
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=2081960952&single=true&output=csv`,
    "sandbox/Practice7",
  );

  // Big Practice
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1800764000&single=true&output=csv`,
    "sandbox/Practice8",
  );

  // More Cheese
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=859322079&single=true&output=csv`,
    "sandbox/Practice9",
  );

  // Practice Cheese / Diverging Paths
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=362959152&single=true&output=csv`,
    "sandbox/Practice10",
  );

  // State of Michigan
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1179414329&single=true&output=csv`,
    "sandbox/Practice11",
  );

  // Competition mazes

  // M Shape
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1844403567&single=true&output=csv`,
    "competition/Competition1",
  );

  // Competition 2
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1337856033&single=true&output=csv`,
    "competition/Competition2",
  );

  // Devices
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1607378245&single=true&output=csv`,
    "competition/Competition3",
  );

  // Trees and Clouds
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=2040482267&single=true&output=csv`,
    "competition/Competition4",
  );

  // Hills and Mountains
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=375286197&single=true&output=csv`,
    "competition/Competition5",
  );

  // Olympic Rings
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1565258291&single=true&output=csv`,
    "competition/Competition6",
  );

  // Symmetrical
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=853659835&single=true&output=csv`,
    "competition/Competition7",
  );

  // Abstract
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1533899046&single=true&output=csv`,
    "competition/Competition8",
  );

  // Cheese
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1581402781&single=true&output=csv`,
    "competition/Competition9",
  );

  // Competition 10
  await convertFromUrl(
    `https://docs.google.com/spreadsheets/d/e/2PACX-1vQoYKSC4H6i1-UhGKfJ3qzOZPcSKqgwf9r6Kf0h_RbRiHUuJ1DUFTJ_q_VYKqXrLg4PLlFfTWpxxUcP/pub?gid=1763186329&single=true&output=csv`,
    "competition/Competition10",
  );
}

createMazes();
