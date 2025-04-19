package models

import (
	"time"
)

type CVBank struct {
	ID         int       `json:"id"`
	Nome       string    `json:"nome"`
	Email      string    `json:"email"`
	Telefone   string    `json:"telefone"`
	Cidade     string    `json:"cidade"`
	Estado     string    `json:"estado"`
	Cargo      string    `json:"cargo"`
	Curriculo  string    `json:"curriculo"`
	Qgis       string    `json:"qgis"`
	Arcgis     string    `json:"arcgis"`
	Autocad    string    `json:"autocad"`
	Python     string    `json:"python"`
	Ingles     string    `json:"ingles"`
	Oratoria   string    `json:"oratoria"`
	Entrevista string    `json:"entrevista"`
	CreatedAt  time.Time `json:"created_at"`
}

