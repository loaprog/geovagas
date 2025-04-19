package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"techvagas/internal/models"
	"techvagas/internal/drive"

	"github.com/jackc/pgx/v5/pgxpool"
)

type CVBankHandler struct {
	db *pgxpool.Pool
}

func NewCVBankHandler(db *pgxpool.Pool) *CVBankHandler {
	return &CVBankHandler{db: db}
}

func (h *CVBankHandler) CreateCV(w http.ResponseWriter, r *http.Request) {
	// Parseia o formulário com suporte a arquivos de até 10MB
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Erro ao parsear o formulário", http.StatusBadRequest)
		return
	}

	// Obtém os campos do formulário
	nome := r.FormValue("nome")
	email := r.FormValue("email")
	telefone := r.FormValue("telefone")
	cidade := r.FormValue("cidade")
	estado := r.FormValue("estado")
	cargo := r.FormValue("cargo")
	qgis := r.FormValue("qgis")
	arcgis := r.FormValue("arcgis")
	autocad := r.FormValue("autocad")
	python := r.FormValue("python")
	ingles := r.FormValue("ingles")
	oratoria := r.FormValue("oratoria")
	entrevista := r.FormValue("entrevista")

	// Obtém o arquivo do formulário
	file, handler, err := r.FormFile("curriculo")
	if err != nil {
		http.Error(w, "Erro ao receber o arquivo", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Faz o upload para o Google Drive
	driveLink, err := drive.UploadFile(nome, file, handler.Filename)
	if err != nil {
		http.Error(w, "Erro ao enviar currículo para o Google Drive", http.StatusInternalServerError)
		return
	}

	// Prepara o modelo para inserção no banco
	cv := models.CVBank{
		Nome:       nome,
		Email:      email,
		Telefone:   telefone,
		Cidade:     cidade,
		Estado:     estado,
		Cargo:      cargo,
		Curriculo:  driveLink,
		Qgis:       qgis,
		Arcgis:     arcgis,	
		Autocad:    autocad,
		Python:     python,
		Ingles:     ingles,
		Oratoria:   oratoria,
		Entrevista: entrevista,
	}

	// Insere no banco de dados
	query := `
		INSERT INTO techvagas.cv_bank (nome, email, telefone, cidade, estado, cargo, qgis, arcgis, autocad, python, ingles, oratoria, entrevista, curriculo)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`

		_, err = h.db.Exec(r.Context(), query,
		cv.Nome, cv.Email, cv.Telefone, cv.Cidade, cv.Estado, cv.Cargo,
		cv.Qgis, cv.Arcgis, cv.Autocad, cv.Python, cv.Ingles,
		cv.Oratoria, cv.Entrevista, cv.Curriculo, // esse é o 14º
	)

	if err != nil {
		log.Printf("Erro ao inserir no banco: %v", err)
		http.Error(w, "Erro ao salvar no banco de dados", http.StatusInternalServerError)
		return
	}

	// Resposta de sucesso
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message":  "Currículo enviado com sucesso!",
		"curriculo_link": driveLink,
	})
}
