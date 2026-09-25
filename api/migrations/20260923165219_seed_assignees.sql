-- +goose Up
INSERT INTO assignees (name) VALUES ('test1'), ('test2'), ('test3');

-- +goose Down
DELETE FROM assignees WHERE name IN ('test1', 'test2', 'test3');