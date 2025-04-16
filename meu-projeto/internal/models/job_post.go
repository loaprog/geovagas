package models

import "time"

// Modelo de JobPost para manipulação interna
type JobPost struct {
	ID              int       `json:"id"`
	Title           string    `json:"title"`
	CompanyName     string    `json:"company_name"`
	Location        string    `json:"location"`
	Description     string    `json:"description"`
	ApplicationLink string    `json:"application_link"`
	Tags            []string  `json:"tags"`
	CreatedAt       time.Time `json:"created_at"`
	IsActive        bool      `json:"is_active"`
	FullDescription string    `json:"full_description"`
	Location_stay   string    `json:"location_stay"`
}

// Modelo para formatar a resposta com os dados que serão enviados
type JobPostResponse struct {
	ID              int       `json:"vaga"`
	Title           string    `json:"vaga_nome"`
	CompanyName     string    `json:"empresa"`
	Location        string    `json:"cidade"`
	Description     string    `json:"descricao"`
	ApplicationLink string    `json:"link"`
	Tags            []string  `json:"tags"`
	PostedAgo       string    `json:"postada_ha"`
	FullDescription string    `json:"descricao_completa"`
	Location_stay   string    `json:"estado"`
}
