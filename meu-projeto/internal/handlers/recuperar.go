package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	emailSender "techvagas/internal/email" // alias para evitar conflito
	"techvagas/internal/utils"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type RecuperarSenhaRequest struct {
	Email string `json:"email"`
}

type RecuperarSenhaResponse struct {
	Email string `json:"email"`
	Token string `json:"token"`
}

type AlterarSenhaRequest struct {
	Token     string `json:"token"`
	NovaSenha string `json:"nova_senha"`
}

type AlterarSenhaResponse struct {
	Message string `json:"message"`
	Token   string `json:"token"`
}


func RecuperarSenhaHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
			return
		}

		// Decodificar corpo da requisição
		var req RecuperarSenhaRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil || req.Email == "" {
			http.Error(w, "Email inválido", http.StatusBadRequest)
			return
		}

		// Buscar no banco
		var email, token string
		err = db.QueryRow(context.Background(), `
			SELECT email, token 
			FROM techvagas.users
			WHERE email = $1
		`, req.Email).Scan(&email, &token)

		if err != nil {
			http.Error(w, "Usuário não encontrado", http.StatusNotFound)
			return
		}

		if err := emailSender.EnviarEmail(email, token); err != nil {
			http.Error(w, "Erro ao enviar e-mail", http.StatusInternalServerError)
			return
		}
		

		// Retornar token
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(RecuperarSenhaResponse{
			Email: email,
			Token: token,
		})
	}
}



// endpoint mudar senha
func AlterarSenhaHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
			return
		}

		var req AlterarSenhaRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Token == "" || req.NovaSenha == "" {
			http.Error(w, "Dados inválidos", http.StatusBadRequest)
			return
		}

		// Verifica se o token existe
		var userID int
		err := db.QueryRow(context.Background(), `
			SELECT id FROM techvagas.users WHERE token = $1
		`, req.Token).Scan(&userID)
		if err != nil {
			http.Error(w, "Token inválido ou expirado", http.StatusUnauthorized)
			return
		}

		// Criptografar nova senha
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NovaSenha), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Erro ao criptografar a senha", http.StatusInternalServerError)
			return
		}

		// Gerar novo token
		newToken := utils.GenerateToken(32)

		// Atualizar senha e novo token
		_, err = db.Exec(context.Background(), `
			UPDATE techvagas.users
			SET password_hash = $1, token = $2
			WHERE id = $3
		`, string(hashedPassword), newToken, userID)
		if err != nil {
			http.Error(w, "Erro ao atualizar os dados", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AlterarSenhaResponse{
			Message: "Senha atualizada com sucesso",
			Token:   newToken,
		})
	}
}

