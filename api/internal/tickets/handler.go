package tickets

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"

	"github.com/mtresende/codificar-chamados/api/internal/httpx"
)

type Handler struct {
	store    *Store
	validate *validator.Validate
}

func NewHandler(store *Store) *Handler {
	return &Handler{store: store, validate: validator.New()}
}

func (h *Handler) Routes(r chi.Router) {
	r.Get("/tickets", h.list)
	r.Post("/tickets", h.create)
	r.Get("/tickets/{id}", h.get)
	r.Put("/tickets/{id}", h.update)
	r.Delete("/tickets/{id}", h.delete)
	r.Get("/assignees", h.listAssignees)
	r.Get("/assignees/workload", h.workload)
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	f := TicketFilter{
		Status:   Status(q.Get("status")),
		Priority: Priority(q.Get("priority")),
		Search:   q.Get("search"),
	}
	if aid := q.Get("assignee_id"); aid != "" {
		f.AssigneeID, _ = strconv.ParseInt(aid, 10, 64)
	}

	tickets, err := h.store.List(r.Context(), f)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "failed to list tickets")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, tickets)
}

func (h *Handler) get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid id")
		return
	}

	t, err := h.store.Get(r.Context(), id)
	if err == ErrNotFound {
		httpx.WriteError(w, http.StatusNotFound, "ticket not found")
		return
	}
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "failed to get ticket")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, t)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	var in TicketInput
	if err := httpx.DecodeJSON(r, &in); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if err := h.validate.Struct(in); err != nil {
		httpx.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	t, err := h.store.Create(r.Context(), in)
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "failed to create ticket")
		return
	}
	httpx.WriteJSON(w, http.StatusCreated, t)
}

type updatePayload struct {
	TicketInput
	Status       Status `json:"status" validate:"required"`
	AutoReassign bool   `json:"auto_reassign"`
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid id")
		return
	}

	var in updatePayload
	if err := httpx.DecodeJSON(r, &in); err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if err := h.validate.Struct(in); err != nil {
		httpx.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	if !in.Status.Valid() {
		httpx.WriteError(w, http.StatusUnprocessableEntity, "invalid status")
		return
	}

	t, err := h.store.Update(r.Context(), id, in.TicketInput, in.Status, in.AutoReassign)
	if err == ErrNotFound {
		httpx.WriteError(w, http.StatusNotFound, "ticket not found")
		return
	}
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "failed to update ticket")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, t)
}

func (h *Handler) delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		httpx.WriteError(w, http.StatusBadRequest, "invalid id")
		return
	}

	if err := h.store.Delete(r.Context(), id); err == ErrNotFound {
		httpx.WriteError(w, http.StatusNotFound, "ticket not found")
		return
	} else if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "failed to delete ticket")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) listAssignees(w http.ResponseWriter, r *http.Request) {
	list, err := h.store.ListAssignees(r.Context())
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "failed to list assignees")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, list)
}

func (h *Handler) workload(w http.ResponseWriter, r *http.Request) {
	list, err := h.store.Workload(r.Context())
	if err != nil {
		httpx.WriteError(w, http.StatusInternalServerError, "failed to compute workload")
		return
	}
	httpx.WriteJSON(w, http.StatusOK, list)
}
