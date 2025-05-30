package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"techvagas/internal/models"
)

func timeAgo(createdAt time.Time) string {
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

func JobPostsHandler(db *pgxpool.Pool) http.HandlerFunc {
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
					ORDER BY created_at DESC 
					LIMIT %d
				`, limit)
			} else {
				query = `
					SELECT id, title, company_name, location, description, application_link, tags, created_at, is_active, full_description, location_stay
					FROM techvagas.job_posts 
					WHERE created_at >= NOW() - INTERVAL '1 month'
					AND is_active = true
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
					PostedAgo:       timeAgo(post.CreatedAt),
					FullDescription: post.FullDescription,
					Location_stay:   post.Location_stay,
				}

				posts = append(posts, postFormatted)
			}

			if len(posts) == 0 {
				log.Println("Nenhum dado encontrado.")
			}

			w.Header().Set("Content-Type", "application/json")
			if err := json.NewEncoder(w).Encode(posts); err != nil {
				log.Printf("Erro ao codificar dados em JSON: %v", err)
				http.Error(w, "Erro ao enviar resposta", http.StatusInternalServerError)
			}
		}
	}
}



func JobPostByIDHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extrai o ID da URL
		pathParts := strings.Split(r.URL.Path, "/")
		if len(pathParts) < 3 {
			http.Error(w, "ID da vaga não fornecido", http.StatusBadRequest)
			return
		}

		id, err := strconv.Atoi(pathParts[2])
		if err != nil {
			http.Error(w, "ID inválido", http.StatusBadRequest)
			return
		}

		query := `
			SELECT id, title, company_name, location, description, application_link, tags, created_at, is_active, full_description, location_stay
			FROM techvagas.job_posts
			WHERE id = $1 AND is_active = true
		`

		var post models.JobPost
		err = db.QueryRow(r.Context(), query, id).Scan(
			&post.ID, &post.Title, &post.CompanyName, &post.Location,
			&post.Description, &post.ApplicationLink, &post.Tags,
			&post.CreatedAt, &post.IsActive, &post.FullDescription,
			&post.Location_stay,
		)
		if err != nil {
			log.Printf("Vaga não encontrada ou erro ao buscar: %v", err)
			http.Error(w, "Vaga não encontrada", http.StatusNotFound)
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
			PostedAgo:       timeAgo(post.CreatedAt),
			FullDescription: post.FullDescription,
			Location_stay:   post.Location_stay,
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(postFormatted); err != nil {
			log.Printf("Erro ao codificar resposta JSON: %v", err)
			http.Error(w, "Erro ao enviar resposta", http.StatusInternalServerError)
		}
	}
}
