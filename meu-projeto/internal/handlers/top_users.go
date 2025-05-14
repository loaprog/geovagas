package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

type TopUsersResponse struct {
	ID        int    `json:"id"`
	Nome      string `json:"name"`
	Email     string `json:"email"`
	FotoPath  string `json:"foto_path"`
	XPUser    int    `json:"xp_user"`
}

func TopUsersHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
			return
		}

		query := `
			SELECT 
				u.id, 
				u.name, 
				u.email, 
				s.foto_path, 
				s.xp_user
			FROM 
				techvagas.users u
			JOIN 
				techvagas.students s ON u.id = s.user_id
			ORDER BY 
				s.xp_user DESC
			LIMIT 10
		`

		rows, err := db.Query(r.Context(), query)
		if err != nil {
			log.Printf("Erro ao executar consulta: %v", err)
			http.Error(w, "Erro ao buscar dados", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var users []TopUsersResponse
		for rows.Next() {
			var user TopUsersResponse
			err := rows.Scan(
				&user.ID,
				&user.Nome,
				&user.Email,
				&user.FotoPath,
				&user.XPUser,
			)
			if err != nil {
				log.Printf("Erro ao processar dados: %v", err)
				http.Error(w, "Erro ao processar dados", http.StatusInternalServerError)
				return
			}
			users = append(users, user)
		}

		if err := rows.Err(); err != nil {
			log.Printf("Erro após iteração: %v", err)
			http.Error(w, "Erro ao processar dados", http.StatusInternalServerError)
			return
		}

		if len(users) == 0 {
			log.Println("Nenhum usuário encontrado.")
			users = []TopUsersResponse{} // Retorna array vazio ao invés de null
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(users); err != nil {
			log.Printf("Erro ao codificar dados em JSON: %v", err)
			http.Error(w, "Erro ao enviar resposta", http.StatusInternalServerError)
		}
	}
}