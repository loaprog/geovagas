package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"techvagas/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

func SendMessageHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			var message models.ContactMessage

			err := json.NewDecoder(r.Body).Decode(&message)
			if err != nil {
				log.Printf("Erro ao decodificar mensagem: %v", err)
				http.Error(w, "Erro ao processar a mensagem", http.StatusBadRequest)
				return
			}

			_, err = db.Exec(r.Context(),
				`INSERT INTO techvagas.contact_messages (name, email, subject, message)
				VALUES ($1, $2, $3, $4)`,
				message.Name,
				message.Email,
				message.Subject,
				message.Message,
			)
			if err != nil {
				log.Printf("Erro ao inserir mensagem no banco: %v", err)
				http.Error(w, "Erro ao enviar mensagem", http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(message)

		default:
			http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		}
	}
}