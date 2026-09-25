package httpx

import "net/http"

type errorBody struct {
	Error string `json:"error"`
}

func WriteError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, errorBody{Error: message})
}
