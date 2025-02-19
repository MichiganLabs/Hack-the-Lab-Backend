CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users
(
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(50) UNIQUE                                         NOT NULL,
    role     VARCHAR(20) CHECK (role IN ('PARTICIPANT', 'DEVELOPER', 'ADMIN')),
    api_key  TEXT    DEFAULT REPLACE(uuid_generate_v4()::TEXT, '-', '') NOT NULL,
    disabled BOOLEAN DEFAULT FALSE
);

CREATE OR REPLACE PROCEDURE create_api_key(
    IN p_name VARCHAR(50),
    IN p_role VARCHAR(50) DEFAULT 'PARTICIPANT')
    LANGUAGE plpgsql
AS
$$
DECLARE
    new_user users;
BEGIN
    -- Generate unique ID for the user
    INSERT INTO users (name, role) VALUES (p_name, p_role) RETURNING * INTO new_user;
    -- Output the generated ID (optional)
    RAISE NOTICE 'New % key created with id % and api_key: "%"', new_user.role, new_user.id, new_user.api_key;
END;
$$;

CREATE OR REPLACE PROCEDURE disable_key(
    IN p_name VARCHAR(50))
    LANGUAGE plpgsql
AS
$$
DECLARE
    user_object users;
BEGIN
    SELECT * INTO user_object FROM users WHERE name = p_name;
    IF FOUND THEN
        IF user_object.disabled THEN
            RAISE WARNING 'User % is already disabled.', p_name;
        ELSE
            UPDATE users SET disabled = TRUE WHERE name = p_name;
            RAISE NOTICE 'User % has been disabled.', p_name;
        END IF;
    ELSE
        RAISE EXCEPTION 'Nonexistent key --> %', p_name
            USING HINT = 'Please check your key name';
    END IF;
END;
$$;

CREATE OR REPLACE PROCEDURE enable_key(
    IN p_name VARCHAR(50))
    LANGUAGE plpgsql
AS
$$
DECLARE
    user_object users;
BEGIN
    SELECT * INTO user_object FROM users WHERE name = p_name;
    IF FOUND THEN
        IF NOT user_object.disabled THEN
            RAISE WARNING 'User % is already enabled.', p_name;
        ELSE
            UPDATE users SET disabled = FALSE WHERE name = p_name;

            RAISE NOTICE 'User % has been enabled.', p_name;
        END IF;
    ELSE
        RAISE EXCEPTION 'Nonexistent key --> %', p_name
            USING HINT = 'Please check your key name';
    END IF;
END;
$$;


CALL create_api_key('Test User', 'PARTICIPANT');

CALL create_api_key('Test Developer', 'DEVELOPER');

CALL create_api_key('Test Admin', 'ADMIN');

CREATE TABLE
    actions
(
    action_id   SERIAL PRIMARY KEY,
    user_id     SERIAL REFERENCES users (id) ON DELETE CASCADE,
    maze_id     VARCHAR,
    action_type VARCHAR,
    position    jsonb,
    action_data jsonb,
    time_ts     timestamptz DEFAULT CURRENT_TIMESTAMP,
    success     BOOLEAN     DEFAULT TRUE
);

CREATE INDEX idx_actions_user_maze ON actions (user_id, maze_id, time_ts DESC);

CREATE TABLE
    analytics
(
    id          SERIAL PRIMARY KEY,
    user_id     SERIAL REFERENCES users (id) ON DELETE CASCADE,
    maze_id     VARCHAR,
    method      VARCHAR,
    path        VARCHAR,
    params      jsonb,
    body        jsonb,
    status_code INTEGER,
    time_ts     timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_user_maze ON analytics (user_id, maze_id, time_ts DESC);

CREATE TABLE
    mazes
(
    id              VARCHAR PRIMARY KEY,
    environment     VARCHAR CHECK (environment IN ('SANDBOX', 'COMPETITION')),
    locked          BOOLEAN DEFAULT FALSE,
    cells           jsonb,
    cheese          jsonb,
    exit            jsonb,
    start           jsonb,
    dimensions      jsonb,
    open_square_count NUMERIC
);
