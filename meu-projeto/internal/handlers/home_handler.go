// internal/handlers/home_handler.go
package handlers

import (
	"html/template"
	"log"
	"net/http"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/index.html")
	if err != nil {
		log.Printf("Erro ao carregar template: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}

	// Se quiser passar dados para o template, pode substituir "nil" por um struct/map
	err = tmpl.Execute(w, nil)
	if err != nil {
		log.Printf("Erro ao renderizar template: %v", err)
		http.Error(w, "Erro interno ao renderizar página", http.StatusInternalServerError)
	}
}

func SobreHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/sobre.html")
	if err != nil {
		log.Printf("Erro ao carregar template: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
	err = tmpl.Execute(w, nil)
	if err != nil {
		log.Printf("Erro ao renderizar template: %v", err)
		http.Error(w, "Erro interno ao renderizar página", http.StatusInternalServerError)
	}
}

func ContatoHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/contato.html")
	if err != nil {
		log.Printf("Erro ao carregar template: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
	err = tmpl.Execute(w, nil)
	if err != nil {
		log.Printf("Erro ao renderizar template: %v", err)
		http.Error(w, "Erro interno ao renderizar página", http.StatusInternalServerError)
	}
}

func VagasHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/vagas.html")
	if err != nil {
		log.Printf("Erro ao carregar template: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
	err = tmpl.Execute(w, nil)
	if err != nil {
		log.Printf("Erro ao renderizar template: %v", err)
		http.Error(w, "Erro interno ao renderizar página", http.StatusInternalServerError)
	}
}

func MundoGisHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/mundogis.html")
	if err != nil {
		log.Printf("Erro ao carregar template: %v", err)
		http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		return
	}
	err = tmpl.Execute(w, nil)
	if err != nil {
		log.Printf("Erro ao renderizar template: %v", err)
		http.Error(w, "Erro interno ao renderizar página", http.StatusInternalServerError)
	}
}