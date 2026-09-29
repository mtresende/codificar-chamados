package tickets_test

import (
	"context"
	"errors"
	"sync"
	"testing"

	"github.com/mtresende/codificar-chamados/api/internal/tickets"
)

func input(title string, assigneeID int64) tickets.TicketInput {
	return tickets.TicketInput{Title: title, Priority: tickets.PriorityMedium, AssigneeID: assigneeID}
}

func mustCreate(t *testing.T, s *tickets.Store, in tickets.TicketInput) tickets.Ticket {
	t.Helper()
	tk, err := s.Create(context.Background(), in)
	if err != nil {
		t.Fatalf("Create(%q) error = %v", in.Title, err)
	}
	return tk
}

func TestStore_Create_AutoAssign(t *testing.T) {
	ctx := context.Background()
	s := tickets.NewStore(pool)

	tests := []struct {
		name  string
		setup func(t *testing.T, ids []int64)
		want  int // índice do responsável esperado (0=Ana, 1=Bruno, 2=Carla)
	}{
		{
			name:  "sem carga nenhuma escolhe o primeiro",
			setup: func(t *testing.T, ids []int64) {},
			want:  0,
		},
		{
			name: "escolhe o menos carregado",
			setup: func(t *testing.T, ids []int64) {
				mustCreate(t, s, input("a1", ids[0]))
				mustCreate(t, s, input("a2", ids[0]))
				mustCreate(t, s, input("b1", ids[1]))
			},
			want: 2,
		},
		{
			name: "empate na carga desempata por quem recebeu chamado há mais tempo",
			setup: func(t *testing.T, ids []int64) {
				mustCreate(t, s, input("a1", ids[0]))
				mustCreate(t, s, input("b1", ids[1]))
				mustCreate(t, s, input("c1", ids[2]))
			},
			want: 0,
		},
		{
			name: "chamados resolvidos não contam como carga",
			setup: func(t *testing.T, ids []int64) {
				mustCreate(t, s, input("b1", ids[1]))
				mustCreate(t, s, input("c1", ids[2]))
				done := mustCreate(t, s, input("a1", ids[0]))
				if _, err := s.Update(ctx, done.ID, input("a1", ids[0]), tickets.StatusResolved, false); err != nil {
					t.Fatalf("Update() error = %v", err)
				}
			},
			want: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ids := resetDB(t)
			tt.setup(t, ids)

			got := mustCreate(t, s, input("novo", 0))
			if got.AssigneeID != ids[tt.want] {
				t.Errorf("AssigneeID = %d, want %d", got.AssigneeID, ids[tt.want])
			}
		})
	}
}

func TestStore_Update_AutoReassignIgnoresOwnTicket(t *testing.T) {
	ids := resetDB(t)
	s := tickets.NewStore(pool)

	mustCreate(t, s, input("b1", ids[1]))
	mustCreate(t, s, input("c1", ids[2]))
	own := mustCreate(t, s, input("a1", ids[0]))

	// Todos têm 1 chamado. Sem ignorar o próprio chamado, o empate cairia no Bruno
	// (recebeu há mais tempo); ignorando, Ana fica com carga 0 e é escolhida.
	got, err := s.Update(context.Background(), own.ID, input("a1", 0), tickets.StatusOpen, true)
	if err != nil {
		t.Fatalf("Update() error = %v", err)
	}
	if got.AssigneeID != ids[0] {
		t.Errorf("AssigneeID = %d, want %d", got.AssigneeID, ids[0])
	}
}

// Garante que o FOR UPDATE em PickAssignee evita que criações simultâneas
// enxerguem a mesma carga e escolham o mesmo responsável.
func TestStore_Create_ConcurrentAutoAssignIsBalanced(t *testing.T) {
	resetDB(t)
	s := tickets.NewStore(pool)

	const n = 9
	var wg sync.WaitGroup
	for i := 0; i < n; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if _, err := s.Create(context.Background(), input("concorrente", 0)); err != nil {
				t.Errorf("Create() error = %v", err)
			}
		}()
	}
	wg.Wait()

	load, err := s.Workload(context.Background())
	if err != nil {
		t.Fatalf("Workload() error = %v", err)
	}
	for _, w := range load {
		if w.OpenCount != n/3 {
			t.Errorf("%s: OpenCount = %d, want %d", w.Name, w.OpenCount, n/3)
		}
	}
}

func TestStore_Workload(t *testing.T) {
	ctx := context.Background()
	ids := resetDB(t)
	s := tickets.NewStore(pool)

	mustCreate(t, s, input("a1", ids[0]))
	mustCreate(t, s, input("a2", ids[0]))
	mustCreate(t, s, input("b1", ids[1]))
	closed := mustCreate(t, s, input("b2", ids[1]))
	if _, err := s.Update(ctx, closed.ID, input("b2", ids[1]), tickets.StatusClosed, false); err != nil {
		t.Fatalf("Update() error = %v", err)
	}

	got, err := s.Workload(ctx)
	if err != nil {
		t.Fatalf("Workload() error = %v", err)
	}

	want := []int{2, 1, 0}
	if len(got) != len(want) {
		t.Fatalf("len = %d, want %d", len(got), len(want))
	}
	for i, w := range want {
		if got[i].OpenCount != w {
			t.Errorf("%s: OpenCount = %d, want %d", got[i].Name, got[i].OpenCount, w)
		}
	}
}

func TestStore_List_Filters(t *testing.T) {
	ctx := context.Background()
	ids := resetDB(t)
	s := tickets.NewStore(pool)

	mustCreate(t, s, tickets.TicketInput{Title: "Erro no login", Priority: tickets.PriorityHigh, AssigneeID: ids[0]})
	mustCreate(t, s, tickets.TicketInput{Title: "Lentidão no relatório", Priority: tickets.PriorityLow, AssigneeID: ids[1]})
	paid := mustCreate(t, s, tickets.TicketInput{Title: "Erro no pagamento", Priority: tickets.PriorityHigh, AssigneeID: ids[2]})
	if _, err := s.Update(ctx, paid.ID, tickets.TicketInput{Title: paid.Title, Priority: paid.Priority, AssigneeID: ids[2]}, tickets.StatusResolved, false); err != nil {
		t.Fatalf("Update() error = %v", err)
	}

	tests := []struct {
		name   string
		filter tickets.TicketFilter
		want   int
	}{
		{"sem filtro", tickets.TicketFilter{}, 3},
		{"por status", tickets.TicketFilter{Status: tickets.StatusResolved}, 1},
		{"por prioridade", tickets.TicketFilter{Priority: tickets.PriorityHigh}, 2},
		{"por responsável", tickets.TicketFilter{AssigneeID: ids[1]}, 1},
		{"busca no título (case-insensitive)", tickets.TicketFilter{Search: "ERRO"}, 2},
		{"filtros combinados", tickets.TicketFilter{Priority: tickets.PriorityHigh, Status: tickets.StatusOpen}, 1},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := s.List(ctx, tt.filter)
			if err != nil {
				t.Fatalf("List() error = %v", err)
			}
			if len(got) != tt.want {
				t.Errorf("len = %d, want %d", len(got), tt.want)
			}
		})
	}
}

func TestStore_NotFound(t *testing.T) {
	ctx := context.Background()
	resetDB(t)
	s := tickets.NewStore(pool)
	const missing = 999999

	if _, err := s.Get(ctx, missing); !errors.Is(err, tickets.ErrNotFound) {
		t.Errorf("Get() error = %v, want ErrNotFound", err)
	}
	if err := s.Delete(ctx, missing); !errors.Is(err, tickets.ErrNotFound) {
		t.Errorf("Delete() error = %v, want ErrNotFound", err)
	}
	if _, err := s.Update(ctx, missing, input("x", 1), tickets.StatusOpen, false); !errors.Is(err, tickets.ErrNotFound) {
		t.Errorf("Update() error = %v, want ErrNotFound", err)
	}
}
