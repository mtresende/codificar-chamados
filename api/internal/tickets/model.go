package tickets

import "time"

type Status string

const (
	StatusOpen       Status = "open"
	StatusInProgress Status = "in_progress"
	StatusResolved   Status = "resolved"
	StatusClosed     Status = "closed"
)

func (s Status) Valid() bool {
	switch s {
	case StatusOpen, StatusInProgress, StatusResolved, StatusClosed:
		return true
	}
	return false
}

// IsActive define o que conta como "em aberto" para fins de distribuição de carga.
func (s Status) IsActive() bool {
	return s == StatusOpen || s == StatusInProgress
}

type Priority string

const (
	PriorityLow    Priority = "low"
	PriorityMedium Priority = "medium"
	PriorityHigh   Priority = "high"
)

func (p Priority) Valid() bool {
	switch p {
	case PriorityLow, PriorityMedium, PriorityHigh:
		return true
	}
	return false
}

type Assignee struct {
	ID             int64      `json:"id"`
	Name           string     `json:"name"`
	LastAssignedAt *time.Time `json:"last_assigned_at,omitempty"`
}

type Ticket struct {
	ID          int64     `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Priority    Priority  `json:"priority"`
	Status      Status    `json:"status"`
	AssigneeID  int64     `json:"assignee_id"`
	OpenedAt    time.Time `json:"opened_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TicketInput é o payload de criação/edição vindo do front.
type TicketInput struct {
	Title       string   `json:"title" validate:"required,max=200"`
	Description string   `json:"description" validate:"max=2000"`
	Priority    Priority `json:"priority" validate:"required,oneof=low medium high"`
	// AssigneeID == 0 significa distribuição automática.
	AssigneeID int64 `json:"assignee_id" validate:"gte=0"`
}

// TicketFilter representa os filtros aceitos na listagem.
type TicketFilter struct {
	Status     Status
	Priority   Priority
	AssigneeID int64
	Search     string
}
