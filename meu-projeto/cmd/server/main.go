package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"techvagas/internal/database"
	"techvagas/internal/handlers"
	"fmt"
	"github.com/joho/godotenv"
)

func main() {
	_= godotenv.Load()
	ctx := context.Background()

	// Configuração para produção no Render
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" 
	}

	fmt.Println("Porta:", port)

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

	log.Println("Servidor rodando na porta 8080")
	// if err := http.ListenAndServe(":8080", nil); err != nil {
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Erro ao iniciar o servidor: %v", err)
	}
}