import os
import psycopg2
from psycopg2.extras import Json
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv('../.env')

# Get database credentials from environment variables
db_host = os.getenv('POSTGRES_HOST')
db_port = os.getenv('POSTGRES_PORT')
db_name = os.getenv('POSTGRES_DB')
db_user = os.getenv('POSTGRES_USER')
db_password = os.getenv('POSTGRES_PASSWORD')

# Connect to the PostgreSQL database


def connect():
    conn = psycopg2.connect(
        host=db_host,
        port=db_port,
        dbname=db_name,
        user=db_user,
        password=db_password
    )
    return conn


def update_maze(cursor, maze_id: str, environment: str, maze_data):
    print(f"Updating {maze_id}")

    cells = maze_data['cells']
    cheese = maze_data['cheese']
    maze_exit = maze_data['exit']
    start = maze_data['start']
    dimensions = maze_data['dimensions']
    open_square_count = maze_data['open_square_count']

    cursor.execute("UPDATE mazes SET environment = %s, cells = %s, cheese=  %s, exit = %s, start = %s, dimensions = %s, opensquarecount = %s WHERE id = %s",
                   (environment, Json(cells), Json(cheese), Json(maze_exit), Json(start), Json(dimensions), open_square_count, maze_id, ))


def create_maze(cursor, maze_id: str, environment: str, maze_data):
    print(f"Creating: {maze_id}")

    cells = maze_data['cells']
    cheese = maze_data['cheese']
    maze_exit = maze_data['exit']
    start = maze_data['start']
    dimensions = maze_data['dimensions']
    open_square_count = maze_data['open_square_count']

    cursor.execute("INSERT INTO mazes (id, environment, cells, cheese, exit, start, dimensions, opensquarecount) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                   (maze_id, environment, Json(cells), Json(cheese), Json(maze_exit), Json(start), Json(dimensions), open_square_count))


# Loop over the directories in mazes
for dirpath, dirnames, filenames in os.walk("./"):
    for filename in filenames:
        if filename[-5:] != ".json":
            continue

        # Cut off .json from the end of the filename
        maze_id = filename[:-5]
        environment = dirpath[2:].upper()
        filepath = os.path.join(dirpath, filename)

        with open(filepath, "r") as f:
            maze_data = json.loads(f.read())

            with connect() as conn:
                with conn.cursor() as cursor:
                    # Check if a row exists for the file in the mazes table
                    cursor.execute(
                        "SELECT COUNT(*) FROM mazes WHERE id = %s AND environment = %s", (maze_id, environment))
                    row_count = cursor.fetchone()[0]

                    if row_count > 0:
                        # Update the existing row
                        update_maze(cursor, maze_id, environment, maze_data)
                    else:
                        # Insert a new row
                        create_maze(cursor, maze_id, environment, maze_data)
