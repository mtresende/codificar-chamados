package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
	"github.com/pressly/goose/v3"

	"github.com/mtresende/codificar-chamados/api/internal/httpx"
	"github.com/mtresende/codificar-chamados/api/internal/tickets"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("nenhum .env encontrado, usando variáveis de ambiente do sistema")
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL não definida")
	}

	if err := runMigrations(dsn); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatalf("failed to connect to postgres: %v", err)
	}
	defer pool.Close()

	store := tickets.NewStore(pool)
	handler := tickets.NewHandler(store)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(httpx.CORS)

	r.Route("/api", func(r chi.Router) {
		handler.Routes(r)
	})

	addr := ":8080"
	log.Printf("listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}

func runMigrations(dsn string) error {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return err
	}
	defer db.Close()

	if err := goose.SetDialect("postgres"); err != nil {
		return err
	}
	return goose.Up(db, "migrations")
}
