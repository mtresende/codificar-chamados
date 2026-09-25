package tickets

import (
	"context"

	"github.com/jackc/pgx/v5"
)

func PickAssignee(ctx context.Context, tx pgx.Tx, excludeID int64) (int64, error) {
	if _, err := tx.Exec(ctx, `SELECT 1 FROM assignees ORDER BY id FOR UPDATE`); err != nil {
		return 0, err
	}

	var id int64
	err := tx.QueryRow(ctx, `
		SELECT a.id
		FROM assignees a
		LEFT JOIN tickets t ON t.assignee_id = a.id
			AND t.status IN ('open', 'in_progress') AND t.id <> $1
		GROUP BY a.id
		ORDER BY COUNT(t.id), a.last_assigned_at NULLS FIRST, a.id
		LIMIT 1`, excludeID,
	).Scan(&id)
	return id, err
}
