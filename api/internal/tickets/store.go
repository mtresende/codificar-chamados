package tickets

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("ticket not found")

type Store struct {
	db *pgxpool.Pool
}

func NewStore(db *pgxpool.Pool) *Store {
	return &Store{db: db}
}

func (s *Store) ListAssignees(ctx context.Context) ([]Assignee, error) {
	rows, err := s.db.Query(ctx, `SELECT id, name, last_assigned_at FROM assignees ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []Assignee
	for rows.Next() {
		var a Assignee
		if err := rows.Scan(&a.ID, &a.Name, &a.LastAssignedAt); err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, rows.Err()
}

// WorkloadEntry alimenta o painel de carga por responsável na listagem.
type WorkloadEntry struct {
	AssigneeID int64  `json:"assignee_id"`
	Name       string `json:"name"`
	OpenCount  int    `json:"open_count"`
}

func (s *Store) Workload(ctx context.Context) ([]WorkloadEntry, error) {
	rows, err := s.db.Query(ctx, `
		SELECT a.id, a.name, COUNT(t.id)
		FROM assignees a
		LEFT JOIN tickets t ON t.assignee_id = a.id AND t.status IN ('open', 'in_progress')
		GROUP BY a.id, a.name
		ORDER BY a.id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []WorkloadEntry
	for rows.Next() {
		var w WorkloadEntry
		if err := rows.Scan(&w.AssigneeID, &w.Name, &w.OpenCount); err != nil {
			return nil, err
		}
		out = append(out, w)
	}
	return out, rows.Err()
}

func (s *Store) List(ctx context.Context, f TicketFilter) ([]Ticket, error) {
	q := `SELECT id, title, description, priority, status, assignee_id, opened_at, updated_at FROM tickets WHERE 1=1`
	var args []any

	if f.Status != "" {
		args = append(args, f.Status)
		q += fmt.Sprintf(" AND status = $%d", len(args))
	}
	if f.Priority != "" {
		args = append(args, f.Priority)
		q += fmt.Sprintf(" AND priority = $%d", len(args))
	}
	if f.AssigneeID != 0 {
		args = append(args, f.AssigneeID)
		q += fmt.Sprintf(" AND assignee_id = $%d", len(args))
	}
	if f.Search != "" {
		args = append(args, "%"+strings.ToLower(f.Search)+"%")
		q += fmt.Sprintf(" AND LOWER(title) LIKE $%d", len(args))
	}
	q += ` ORDER BY (status IN ('open','in_progress')) DESC, priority DESC, opened_at ASC`

	rows, err := s.db.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []Ticket
	for rows.Next() {
		var t Ticket
		if err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Priority, &t.Status, &t.AssigneeID, &t.OpenedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, t)
	}
	return out, rows.Err()
}

func (s *Store) Get(ctx context.Context, id int64) (Ticket, error) {
	var t Ticket
	err := s.db.QueryRow(ctx, `
		SELECT id, title, description, priority, status, assignee_id, opened_at, updated_at
		FROM tickets WHERE id = $1`, id,
	).Scan(&t.ID, &t.Title, &t.Description, &t.Priority, &t.Status, &t.AssigneeID, &t.OpenedAt, &t.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Ticket{}, ErrNotFound
	}
	return t, err
}

func (s *Store) Delete(ctx context.Context, id int64) error {
	result, err := s.db.Exec(ctx, `DELETE FROM tickets WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) Create(ctx context.Context, in TicketInput) (Ticket, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return Ticket{}, err
	}
	defer tx.Rollback(ctx)

	assigneeID := in.AssigneeID
	if assigneeID == 0 {
		if assigneeID, err = PickAssignee(ctx, tx, 0); err != nil {
			return Ticket{}, err
		}
	}

	var t Ticket
	err = tx.QueryRow(ctx, `
		INSERT INTO tickets (title, description, priority, assignee_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id, title, description, priority, status, assignee_id, opened_at, updated_at`,
		in.Title, in.Description, in.Priority, assigneeID,
	).Scan(&t.ID, &t.Title, &t.Description, &t.Priority, &t.Status, &t.AssigneeID, &t.OpenedAt, &t.UpdatedAt)
	if err != nil {
		return Ticket{}, err
	}

	if _, err = tx.Exec(ctx, `UPDATE assignees SET last_assigned_at = now() WHERE id = $1`, assigneeID); err != nil {
		return Ticket{}, err
	}

	return t, tx.Commit(ctx)
}

// Update edita título/descrição/prioridade/status e, opcionalmente, reatribui o responsável.
// autoReassign=true escolhe automaticamente, ignorando este próprio chamado na contagem de carga.
func (s *Store) Update(ctx context.Context, id int64, in TicketInput, status Status, autoReassign bool) (Ticket, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return Ticket{}, err
	}
	defer tx.Rollback(ctx)

	assigneeID := in.AssigneeID
	if autoReassign {
		if assigneeID, err = PickAssignee(ctx, tx, id); err != nil {
			return Ticket{}, err
		}
	}

	var t Ticket
	err = tx.QueryRow(ctx, `
		UPDATE tickets
		SET title = $1, description = $2, priority = $3, status = $4, assignee_id = $5, updated_at = now()
		WHERE id = $6
		RETURNING id, title, description, priority, status, assignee_id, opened_at, updated_at`,
		in.Title, in.Description, in.Priority, status, assigneeID, id,
	).Scan(&t.ID, &t.Title, &t.Description, &t.Priority, &t.Status, &t.AssigneeID, &t.OpenedAt, &t.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Ticket{}, ErrNotFound
	}
	if err != nil {
		return Ticket{}, err
	}

	if _, err = tx.Exec(ctx, `UPDATE assignees SET last_assigned_at = now() WHERE id = $1`, assigneeID); err != nil {
		return Ticket{}, err
	}

	return t, tx.Commit(ctx)
}
