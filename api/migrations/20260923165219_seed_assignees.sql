-- +goose Up
INSERT INTO assignees (name) VALUES ('Ana'), ('Bruno'), ('João');

-- +goose Down
DELETE FROM assignees WHERE name IN ('Ana', 'Bruno', 'João');