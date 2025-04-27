package database

import (
	"context"  // Importando o pacote context
	"log"
	"github.com/jackc/pgx/v5/pgxpool"
	"os"
	"fmt"
	"github.com/joho/godotenv"
)

func NewDB(ctx context.Context) (*pgxpool.Pool, error) {  
    // No Render não precisa do godotenv.Load(), mas deixar não quebra.
    _ = godotenv.Load()

	databaseUrl := os.Getenv("DATABASE_URL")
	if databaseUrl == "" {
		log.Fatal("A variável de ambiente DATABASE_URL não está definida.")
		return nil, fmt.Errorf("DATABASE_URL não está definida")
	}

	// databaseUrl := os.Getenv("DATABASE_URL")
	// if databaseUrl == "" {
	// 	log.Fatal("A variável de ambiente DATABASE_URL não está definida.")
	// 	return nil, fmt.Errorf("DATABASE_URL não está definida")
	// }

	db, err := pgxpool.New(ctx, databaseUrl)  
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados: %v", err)
		return nil, err
	}

	return db, nil
}
