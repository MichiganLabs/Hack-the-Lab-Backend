CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users
(
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(50) UNIQUE                                         NOT NULL,
    role     VARCHAR(20) CHECK (role IN ('participant', 'developer', 'admin')),
    api_key  TEXT    DEFAULT replace(uuid_generate_v4()::text, '-', '') NOT NULL,
    disabled BOOLEAN DEFAULT FALSE
);

CREATE OR REPLACE PROCEDURE create_api_key(
    IN p_name VARCHAR(50),
    IN p_role VARCHAR(50) DEFAULT 'participant')
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
            UPDATE users SET disabled = true where name = p_name;

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
            UPDATE users SET disabled = false where name = p_name;

            RAISE NOTICE 'User % has been enabled.', p_name;
        END IF;
    ELSE
        RAISE EXCEPTION 'Nonexistent key --> %', p_name
            USING HINT = 'Please check your key name';
    END IF;
END;
$$;


CALL create_api_key('Test User', 'participant');
CALL create_api_key('Test Developer', 'developer');
CALL create_api_key('Test Admin', 'admin');
