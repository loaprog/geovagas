package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"techvagas/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

func JobSuggestionsHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			rows, err := db.Query(r.Context(),
				"SELECT id, title, company_name, location, description, application_link, tags, suggested_by_email, created_at, is_approved FROM job_suggestions")
			if err != nil {
				log.Printf("Erro ao executar consulta: %v", err)
				http.Error(w, "Erro ao buscar dados", 500)
				return
			}
			defer rows.Close()

			var suggestions []models.JobSuggestion
			for rows.Next() {
				var suggestion models.JobSuggestion
				err := rows.Scan(&suggestion.ID, &suggestion.Title, &suggestion.CompanyName, &suggestion.Location,
					&suggestion.Description, &suggestion.ApplicationLink, &suggestion.Tags, &suggestion.SuggestedByEmail, &suggestion.CreatedAt, &suggestion.IsApproved)
				if err != nil {
					log.Printf("Erro ao processar dados: %v", err)
					http.Error(w, "Erro ao processar dados", 500)
					return
				}
				suggestions = append(suggestions, suggestion)
			}

			w.Header().Set("Content-Type", "application/json")
			if err := json.NewEncoder(w).Encode(suggestions); err != nil {
				log.Printf("Erro ao codificar dados em JSON: %v", err)
				http.Error(w, "Erro ao enviar resposta", 500)
			}
		}
	}
}
