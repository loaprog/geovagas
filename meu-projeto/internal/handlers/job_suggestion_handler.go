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
		switch r.Method {
		case http.MethodGet:
			rows, err := db.Query(r.Context(),
				`SELECT id, title, company_name, location, description, application_link, tags, suggested_by_email, created_at, full_description, location_stay, whatsapp
				FROM techvagas.job_suggestions`)
			if err != nil {
				log.Printf("Erro ao executar consulta: %v", err)
				http.Error(w, "Erro ao buscar dados", http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			var suggestions []models.JobSuggestion
			for rows.Next() {
				var suggestion models.JobSuggestion
				err := rows.Scan(
					&suggestion.ID,
					&suggestion.Title,
					&suggestion.CompanyName,
					&suggestion.Location,
					&suggestion.Description,
					&suggestion.ApplicationLink,
					&suggestion.Tags,
					&suggestion.SuggestedByEmail,
					&suggestion.CreatedAt,
					&suggestion.FullDescription,
					&suggestion.LocationStay,
					&suggestion.Whatsapp,
					
				)
				if err != nil {
					log.Printf("Erro ao processar dados: %v", err)
					http.Error(w, "Erro ao processar dados", http.StatusInternalServerError)
					return
				}
				suggestions = append(suggestions, suggestion)
			}

			w.Header().Set("Content-Type", "application/json")
			if err := json.NewEncoder(w).Encode(suggestions); err != nil {
				log.Printf("Erro ao codificar dados em JSON: %v", err)
				http.Error(w, "Erro ao enviar resposta", http.StatusInternalServerError)
			}

		case http.MethodPost:
			var suggestion models.JobSuggestion

			err := json.NewDecoder(r.Body).Decode(&suggestion)
			if err != nil {
				log.Printf("Erro ao decodificar JSON: %v", err)
				http.Error(w, "JSON inválido", http.StatusBadRequest)
				return
			}

			_, err = db.Exec(r.Context(),
				`INSERT INTO techvagas.job_suggestions 
				(title, company_name, location, description, application_link, tags, suggested_by_email, created_at, full_description, location_stay, whatsapp)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
				suggestion.Title,
				suggestion.CompanyName,
				suggestion.Location,
				suggestion.Description,
				suggestion.ApplicationLink,
				suggestion.Tags,
				suggestion.SuggestedByEmail,
				suggestion.CreatedAt,
				suggestion.FullDescription,
				suggestion.LocationStay,
				suggestion.Whatsapp,
			)

			if err != nil {
				log.Printf("Erro ao inserir no banco: %v", err)
				http.Error(w, "Erro ao salvar sugestão", http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(map[string]string{"mensagem": "Sugestão salva com sucesso!"})
		default:
			http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		}
	}
}
