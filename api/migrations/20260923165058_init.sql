-- +goose Up
CREATE TABLE assignees (
    id               BIGSERIAL PRIMARY KEY,
    name             TEXT NOT NULL,
    last_assigned_at TIMESTAMPTZ
);

CREATE TABLE tickets (
    id          BIGSERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    priority    TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assignee_id BIGINT NOT NULL REFERENCES assignees (id),
    opened_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tickets_active_by_assignee ON tickets (assignee_id) WHERE status IN ('open', 'in_progress');

-- +goose Down
DROP TABLE tickets;
DROP TABLE assignees;