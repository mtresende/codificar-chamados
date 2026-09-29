package httpx_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/mtresende/codificar-chamados/api/internal/httpx"
)

func TestWriteError(t *testing.T) {
	rec := httptest.NewRecorder()

	httpx.WriteError(rec, http.StatusNotFound, "ticket not found")

	if rec.Code != http.StatusNotFound {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusNotFound)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("Content-Type = %q, want application/json", ct)
	}
	if got, want := strings.TrimSpace(rec.Body.String()), `{"error":"ticket not found"}`; got != want {
		t.Errorf("body = %s, want %s", got, want)
	}
}

func TestDecodeJSON(t *testing.T) {
	type payload struct {
		Name string `json:"name"`
	}

	tests := []struct {
		name    string
		body    string
		wantErr bool
	}{
		{"válido", `{"name":"ana"}`, false},
		{"campo desconhecido", `{"name":"ana","extra":1}`, true},
		{"malformado", `{"name":`, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(tt.body))
			var p payload

			err := httpx.DecodeJSON(req, &p)

			if (err != nil) != tt.wantErr {
				t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestCORS(t *testing.T) {
	called := false
	h := httpx.CORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusOK)
	}))

	t.Run("preflight responde 204 sem chamar o próximo handler", func(t *testing.T) {
		called = false
		rec := httptest.NewRecorder()

		h.ServeHTTP(rec, httptest.NewRequest(http.MethodOptions, "/", nil))

		if rec.Code != http.StatusNoContent {
			t.Errorf("status = %d, want %d", rec.Code, http.StatusNoContent)
		}
		if called {
			t.Error("próximo handler não deveria ser chamado no preflight")
		}
		if rec.Header().Get("Access-Control-Allow-Origin") != "*" {
			t.Error("header Access-Control-Allow-Origin ausente")
		}
	})

	t.Run("requisição normal segue para o próximo handler com os headers", func(t *testing.T) {
		called = false
		rec := httptest.NewRecorder()

		h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))

		if !called || rec.Code != http.StatusOK {
			t.Errorf("called = %v, status = %d; want true e %d", called, rec.Code, http.StatusOK)
		}
		if rec.Header().Get("Access-Control-Allow-Origin") != "*" {
			t.Error("header Access-Control-Allow-Origin ausente")
		}
	})
}
