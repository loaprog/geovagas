package models

import "time"

type JobSuggestion struct {
	ID               int       `json:"id"`
	Title            string    `json:"title"`
	CompanyName      string    `json:"company_name"`
	Location         string    `json:"location"`
	Description      string    `json:"description"`
	ApplicationLink  string    `json:"application_link"`
	Tags             []string  `json:"tags"`
	SuggestedByEmail string    `json:"suggested_by_email"`
	CreatedAt        time.Time `json:"created_at"`
	IsApproved       bool      `json:"is_approved"`
}
