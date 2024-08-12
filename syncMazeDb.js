/* global process */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

require("dotenv").config();

// Connect to the PostgreSQL database
const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

const processMazes = async () => {
  // Loop over the directories in mazes
  const directory = "./mazes";
  const dirs = fs.readdirSync(directory, { withFileTypes: true }).filter(dir => dir.isDirectory());

  for (const dir of dirs) {
    const environment = dir.name.toUpperCase();
    const dirPath = path.join(directory, dir.name);
    const jsonFiles = fs.readdirSync(dirPath).filter(file => file.endsWith(".json"));

    for (const jsonFile of jsonFiles) {
      const mazeId = jsonFile.replace(".json", "");
      const mazeFilePath = path.join(dirPath, jsonFile);
      const mazeData = JSON.parse(fs.readFileSync(mazeFilePath, "utf8"));

      // Check if a row exists for the file in the mazes table
      const res = await client.query("SELECT COUNT(*) FROM mazes WHERE id = $1 AND environment = $2", [mazeId, environment]);
      const rowCount = res.rows[0].count;

      if (rowCount > 0) {
        // Update the existing row
        await updateMaze(mazeId, environment, mazeData);
      } else {
        // Insert a new row
        await createMaze(mazeId, environment, mazeData);
      }
    }
  }
};

const updateMaze = async (mazeId, environment, mazeData) => {
  const cells = JSON.stringify(mazeData.cells);
  const cheese = JSON.stringify(mazeData.cheese);
  const mazeExit = JSON.stringify(mazeData.exit);
  const start = JSON.stringify(mazeData.start);
  const dimensions = JSON.stringify(mazeData.dimensions);
  const openSquareCount = mazeData.openSquareCount;

  try {
    await client.query(
      "UPDATE mazes SET environment = $1, cells = $2, cheese = $3, exit = $4, start = $5, dimensions = $6, open_square_count = $7 WHERE id = $8",
      [environment, cells, cheese, mazeExit, start, dimensions, openSquareCount, mazeId],
    );
    console.log(`[*] Maze '${mazeId}' successfully updated.`);
  } catch (err) {
    console.error("error executing query", err.stack);
  }
};

const createMaze = async (mazeId, environment, mazeData) => {
  const cells = JSON.stringify(mazeData.cells);
  const cheese = JSON.stringify(mazeData.cheese);
  const mazeExit = JSON.stringify(mazeData.exit);
  const start = JSON.stringify(mazeData.start);
  const dimensions = JSON.stringify(mazeData.dimensions);
  const openSquareCount = mazeData.open_square_count;

  try {
    await client.query(
      "INSERT INTO mazes (id, environment, cells, cheese, exit, start, dimensions, open_square_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [mazeId, environment, cells, cheese, mazeExit, start, dimensions, openSquareCount],
    );
    console.log(`[+] Maze '${mazeId}' successfully created.`);
  } catch (err) {
    console.error("error executing query", err.stack);
  }
};

client
  .connect()
  .then(processMazes)
  .catch(err => {
    console.error("error executing query", err.stack);
  })
  .finally(() => {
    client.end();
  });
