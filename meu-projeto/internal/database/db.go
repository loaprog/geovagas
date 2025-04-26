package database

import (
	"context"  // Importando o pacote context
	"log"
	"github.com/jackc/pgx/v5/pgxpool"
	"os"
	"fmt"
)

func NewDB(ctx context.Context) (*pgxpool.Pool, error) {  
    // databaseUrl := "postgresql://neondb_owner:npg_TgAy3E1baFtK@ep-aged-glitter-ackvv1y3-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
	databaseUrl := os.Getenv("DATABASE_URL")
	if databaseUrl == "" {
		log.Fatal("A variável de ambiente DATABASE_URL não está definida.")
		return nil, fmt.Errorf("DATABASE_URL não está definida")
	}

	db, err := pgxpool.New(ctx, databaseUrl)  
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados: %v", err)
		return nil, err
	}

	return db, nil
}
