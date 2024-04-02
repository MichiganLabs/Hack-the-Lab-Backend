CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users
(
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(50) UNIQUE                                         NOT NULL,
    role     VARCHAR(20) CHECK (role IN ('participant', 'developer', 'admin')),
    api_key  TEXT    DEFAULT replace(uuid_generate_v4()::text, '-', '') NOT NULL,
    disabled BOOLEAN DEFAULT FALSE
);

CREATE OR REPLACE PROCEDURE create_new_user(
    IN p_name VARCHAR(50),
    IN p_role VARCHAR(50) DEFAULT 'participant')
    LANGUAGE plpgsql
AS
$$
DECLARE
    user_id INT;
BEGIN
    -- Generate unique ID for the user
    INSERT INTO users (name, role) VALUES (p_name, p_role) RETURNING id INTO user_id;
    -- Output the generated ID (optional)
    RAISE NOTICE 'New user created with ID: %', user_id;
END;
$$;

CALL create_new_user('TESTUSER');