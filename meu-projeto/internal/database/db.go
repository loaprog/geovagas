package database

import (
	"context"  // Importando o pacote context
	"log"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewDB(ctx context.Context) (*pgxpool.Pool, error) {  // Recebendo o contexto como argumento
	// Substitua pela URL de conexão com seu banco de dados
    databaseUrl := "postgresql://neondb_owner:npg_TgAy3E1baFtK@ep-aged-glitter-ackvv1y3-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"

	db, err := pgxpool.New(ctx, databaseUrl)  // Passando o contexto correto
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco de dados: %v", err)
		return nil, err
	}

	return db, nil
}
