package main

import (
	"context"
	"log"
	"net/http"
	"techvagas/internal/database"
	"techvagas/internal/handlers"
	"github.com/joho/godotenv"
)

func main() {
	_= godotenv.Load()
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
	http.HandleFunc("/details/", handlers.DetailsHandler)

	// Endpoints
	http.HandleFunc("/job-posts", handlers.JobPostsHandler(db))
	http.HandleFunc("/job-posts/", handlers.JobPostByIDHandler(db))
	http.Handle("/api/job-suggestions", handlers.JobSuggestionsHandler(db))
	http.Handle("/api/send-message", handlers.SendMessageHandler(db))
	http.HandleFunc("/api/curriculos", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			cvHandler.CreateCV(w, r)
		default:
			http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		}
	})

	log.Println("Servidor rodando na porta 10000")
	if err := http.ListenAndServe(":10000", nil); err != nil {
		log.Fatalf("Erro ao iniciar o servidor: %v", err)
	}
}