-- +goose Up
INSERT INTO assignees (name) VALUES ('Ana'), ('Bruno '), ('Carla');

-- +goose Down
DELETE FROM assignees WHERE name IN ('Ana', 'Bruno ', 'Carla');