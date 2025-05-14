package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"techvagas/internal/models"
)

func timeAg(createdAt time.Time) string {
	now := time.Now()
	duration := now.Sub(createdAt)

	if duration < time.Hour {
		return fmt.Sprintf("postada há %.0f minutos", duration.Minutes())
	} else if duration < 24*time.Hour {
		return fmt.Sprintf("postada há %.0f horas", duration.Hours())
	} else if duration < 7*24*time.Hour {
		return fmt.Sprintf("postada há %.0f dias", duration.Hours()/24)
	} else if duration < 30*24*time.Hour {
		return fmt.Sprintf("postada há %.0f semanas", duration.Hours()/(24*7))
	} else {
		return fmt.Sprintf("postada há %.0f meses", duration.Hours()/(24*30))
	}
}

func JobExclusiveHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			limit := 0
			if r.URL.Query().Get("latest") == "true" {
				limit = 6
			}

			var query string
			if limit > 0 {
				query = fmt.Sprintf(`
					SELECT id, title, company_name, location, description, application_link, tags, created_at, is_active, full_description, location_stay
					FROM techvagas.job_posts 
					WHERE created_at >= NOW() - INTERVAL '1 month'
					AND is_active = true
					AND is_exclusive = true
					ORDER BY created_at DESC 
					LIMIT %d
				`, limit)
			} else {
				query = `
					SELECT id, title, company_name, location, description, application_link, tags, created_at, is_active, full_description, location_stay
					FROM techvagas.job_posts 
					WHERE created_at >= NOW() - INTERVAL '1 month'
					AND is_active = true
					AND is_exclusive = true
					ORDER BY created_at DESC
				`
			}
				

			rows, err := db.Query(r.Context(), query)
			if err != nil {
				log.Printf("Erro ao executar consulta: %v", err)
				http.Error(w, "Erro ao buscar dados", http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			var posts []models.JobPostResponse
			for rows.Next() {
				var post models.JobPost
				err := rows.Scan(
					&post.ID, &post.Title, &post.CompanyName, &post.Location,
					&post.Description, &post.ApplicationLink, &post.Tags,
					&post.CreatedAt, &post.IsActive, &post.FullDescription,
					&post.Location_stay,
				)
				if err != nil {
					log.Printf("Erro ao processar dados: %v", err)
					http.Error(w, "Erro ao processar dados", http.StatusInternalServerError)
					return
				}

				postFormatted := models.JobPostResponse{
					ID:              post.ID,
					Title:           post.Title,
					CompanyName:     post.CompanyName,
					Location:        post.Location,
					Description:     post.Description,
					ApplicationLink: post.ApplicationLink,
					Tags:            post.Tags,
					PostedAgo:       timeAg(post.CreatedAt),
					FullDescription: post.FullDescription,
					Location_stay:   post.Location_stay,
				}

				posts = append(posts, postFormatted)
			}

			if len(posts) == 0 {
				log.Println("Nenhum dado encontrado.")
			}

			response := map[string]interface{}{
				"contagem_total": len(posts),
				"vagas":          posts,
			}
			
			w.Header().Set("Content-Type", "application/json")
			if err := json.NewEncoder(w).Encode(response); err != nil {
				log.Printf("Erro ao codificar dados em JSON: %v", err)
				http.Error(w, "Erro ao enviar resposta", http.StatusInternalServerError)
			}
		}
	}
}

