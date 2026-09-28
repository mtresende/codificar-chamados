package tickets_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"

	"github.com/mtresende/codificar-chamados/api/internal/tickets"
)

func newRouter(t *testing.T) (http.Handler, []int64) {
	t.Helper()
	ids := resetDB(t)

	r := chi.NewRouter()
	r.Route("/api", func(r chi.Router) {
		tickets.NewHandler(tickets.NewStore(pool)).Routes(r)
	})
	return r, ids
}

func do(h http.Handler, method, path, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func TestHandler_TicketLifecycle(t *testing.T) {
	h, _ := newRouter(t)

	// create (assignee_id omitido => distribuição automática)
	rec := do(h, http.MethodPost, "/api/tickets", `{"title":"Impressora quebrada","priority":"high"}`)
	if rec.Code != http.StatusCreated {
		t.Fatalf("POST status = %d, want %d (body: %s)", rec.Code, http.StatusCreated, rec.Body)
	}
	var created tickets.Ticket
	if err := json.NewDecoder(rec.Body).Decode(&created); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if created.AssigneeID == 0 || created.Status != tickets.StatusOpen {
		t.Errorf("created = %+v, want assignee definido e status open", created)
	}
	id := strconv.FormatInt(created.ID, 10)
	path := "/api/tickets/" + id

	// get
	if rec := do(h, http.MethodGet, path, ""); rec.Code != http.StatusOK {
		t.Errorf("GET status = %d, want %d", rec.Code, http.StatusOK)
	}

	// update
	rec = do(h, http.MethodPut, path,
		`{"title":"Impressora quebrada","priority":"high","status":"resolved","assignee_id":`+strconv.FormatInt(created.AssigneeID, 10)+`}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("PUT status = %d, want %d (body: %s)", rec.Code, http.StatusOK, rec.Body)
	}
	var updated tickets.Ticket
	if err := json.NewDecoder(rec.Body).Decode(&updated); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if updated.Status != tickets.StatusResolved {
		t.Errorf("Status = %q, want %q", updated.Status, tickets.StatusResolved)
	}

	// delete + get => 404
	if rec := do(h, http.MethodDelete, path, ""); rec.Code != http.StatusNoContent {
		t.Errorf("DELETE status = %d, want %d", rec.Code, http.StatusNoContent)
	}
	if rec := do(h, http.MethodGet, path, ""); rec.Code != http.StatusNotFound {
		t.Errorf("GET após DELETE status = %d, want %d", rec.Code, http.StatusNotFound)
	}
}

func TestHandler_StatusCodes(t *testing.T) {
	h, _ := newRouter(t)

	tests := []struct {
		name   string
		method string
		path   string
		body   string
		want   int
	}{
		{"create sem título", http.MethodPost, "/api/tickets", `{"priority":"low"}`, http.StatusUnprocessableEntity},
		{"create com prioridade inválida", http.MethodPost, "/api/tickets", `{"title":"x","priority":"urgent"}`, http.StatusUnprocessableEntity},
		{"create com JSON malformado", http.MethodPost, "/api/tickets", `{"title":`, http.StatusBadRequest},
		{"create com campo desconhecido", http.MethodPost, "/api/tickets", `{"title":"x","priority":"low","foo":1}`, http.StatusBadRequest},
		{"get com id inválido", http.MethodGet, "/api/tickets/abc", "", http.StatusBadRequest},
		{"get inexistente", http.MethodGet, "/api/tickets/999999", "", http.StatusNotFound},
		{"update sem status", http.MethodPut, "/api/tickets/1", `{"title":"x","priority":"low"}`, http.StatusUnprocessableEntity},
		{"update com status inválido", http.MethodPut, "/api/tickets/1", `{"title":"x","priority":"low","status":"banana"}`, http.StatusUnprocessableEntity},
		{"update inexistente", http.MethodPut, "/api/tickets/999999", `{"title":"x","priority":"low","status":"open","assignee_id":1}`, http.StatusNotFound},
		{"delete inexistente", http.MethodDelete, "/api/tickets/999999", "", http.StatusNotFound},
		{"listar responsáveis", http.MethodGet, "/api/assignees", "", http.StatusOK},
		{"carga por responsável", http.MethodGet, "/api/assignees/workload", "", http.StatusOK},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := do(h, tt.method, tt.path, tt.body)
			if rec.Code != tt.want {
				t.Errorf("status = %d, want %d (body: %s)", rec.Code, tt.want, rec.Body)
			}
		})
	}
}
