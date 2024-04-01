CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users(
    id serial PRIMARY KEY,
    name varchar(50) UNIQUE NOT NULL,
    api_key text DEFAULT replace(uuid_generate_v4()::text, '-', '') NOT NULL
);

CREATE OR REPLACE PROCEDURE create_new_user(IN p_name varchar(50))
LANGUAGE plpgsql
AS $$
DECLARE
    user_id int;
BEGIN
    -- Generate unique ID for the user
    INSERT INTO users(name)
        VALUES (p_name)
    RETURNING
        id INTO user_id;
    -- Output the generated ID (optional)
    RAISE NOTICE 'New user created with ID: %', user_id;
END;
$$;

CALL create_new_user('CREATEUSER');