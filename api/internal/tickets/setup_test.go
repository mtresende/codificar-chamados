package tickets_test

import (
	"context"
	"database/sql"
	"log"
	"os"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
)

var pool *pgxpool.Pool

func TestMain(m *testing.M) {
	os.Exit(run(m))
}

func run(m *testing.M) int {
	ctx := context.Background()

	ctr, err := postgres.Run(ctx, "postgres:16-alpine",
		postgres.WithDatabase("chamados_test"),
		postgres.WithUsername("test"),
		postgres.WithPassword("test"),
		postgres.BasicWaitStrategies(),
	)
	if err != nil {
		log.Printf("falha ao subir o container do postgres (o Docker está rodando?): %v", err)
		return 1
	}
	defer testcontainers.TerminateContainer(ctr)

	dsn, err := ctr.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		log.Printf("falha ao obter a connection string: %v", err)
		return 1
	}

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Printf("falha ao abrir conexão para migrations: %v", err)
		return 1
	}
	if err := goose.SetDialect("postgres"); err != nil {
		log.Printf("falha no dialect do goose: %v", err)
		return 1
	}
	if err := goose.Up(db, "../../migrations"); err != nil {
		log.Printf("falha ao rodar migrations: %v", err)
		return 1
	}
	db.Close()

	if pool, err = pgxpool.New(ctx, dsn); err != nil {
		log.Printf("falha ao criar pool: %v", err)
		return 1
	}
	defer pool.Close()

	return m.Run()
}

func resetDB(t *testing.T) []int64 {
	t.Helper()
	ctx := context.Background()

	if _, err := pool.Exec(ctx, `TRUNCATE tickets, assignees RESTART IDENTITY CASCADE`); err != nil {
		t.Fatalf("truncate: %v", err)
	}

	var ids []int64
	for _, name := range []string{"Ana", "Bruno", "Carla"} {
		var id int64
		if err := pool.QueryRow(ctx, `INSERT INTO assignees (name) VALUES ($1) RETURNING id`, name).Scan(&id); err != nil {
			t.Fatalf("seed assignee %s: %v", name, err)
		}
		ids = append(ids, id)
	}
	return ids
}
