package main

import (
	"context"
	"log"
	"net/http"
	"techvagas/internal/database"
	"techvagas/internal/handlers"
)

func main() {
	ctx := context.Background()

	db, err := database.NewDB(ctx)
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco: %v", err)
	}
	defer db.Close()

	cvHandler := handlers.NewCVBankHandler(db)

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	

	// frontend
	http.HandleFunc("/", handlers.HomeHandler)
	http.HandleFunc("/sobre", handlers.SobreHandler)
	http.HandleFunc("/contato", handlers.ContatoHandler)
	http.HandleFunc("/mundogis", handlers.MundoGisHandler)
	http.HandleFunc("/vagas", handlers.VagasHandler)

	// Endpoints
	http.HandleFunc("/job-posts", handlers.JobPostsHandler(db))
	http.HandleFunc("/job-suggestions", handlers.JobSuggestionsHandler(db))
	http.HandleFunc("/api/curriculos", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			cvHandler.CreateCV(w, r)
		default:
			http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		}
	})

	log.Println("Servidor rodando na porta 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Erro ao iniciar o servidor: %v", err)
	}
}