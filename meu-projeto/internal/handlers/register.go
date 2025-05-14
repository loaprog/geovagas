package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"log"
    "errors"
    "github.com/jackc/pgx/v5/pgconn"
	"math/rand"

	"techvagas/internal/models"
	"techvagas/internal/drive"
	"golang.org/x/crypto/bcrypt"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"context"
)


func RegisterUserHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
			return
		}

		// Parse multipart form
		err := r.ParseMultipartForm(10 << 20) // 10 MB max
		if err != nil {
			http.Error(w, "Erro ao processar formulário", http.StatusBadRequest)
			return
		}

		// Obter dados do formulário
		name := r.FormValue("nome")
		email := r.FormValue("email")
		password := r.FormValue("senha")
		phone := r.FormValue("telefone")
		city := r.FormValue("cidade")
		state := r.FormValue("estado")
		token := generateToken(12)


		// Validar campos obrigatórios
		if name == "" || email == "" || password == "" || phone == "" || city == "" || state == "" {
			http.Error(w, "Todos os campos são obrigatórios", http.StatusBadRequest)
			return
		}

		// Processar upload da foto
		file, handler, err := r.FormFile("foto")
		if err != nil {
			http.Error(w, "Erro ao obter arquivo de foto", http.StatusBadRequest)
			return
		}
		defer file.Close()

		// Criar diretório de uploads
		// Enviar a foto para o Google Drive
		driveLink, err := drive.UploadFile(name, file, handler.Filename)
		if err != nil {
			http.Error(w, "Erro ao enviar foto para o Google Drive", http.StatusInternalServerError)
			return
		}


		// Hash da senha
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Erro ao processar senha", http.StatusInternalServerError)
			return
		}

		// Iniciar transação no banco de dados
		tx, err := db.Begin(context.Background())
		if err != nil {
			http.Error(w, "Erro ao iniciar transação", http.StatusInternalServerError)
			return
		}
		defer tx.Rollback(context.Background())

		// Inserir usuário no banco de dados
		var userID int
		err = tx.QueryRow(context.Background(),
		`INSERT INTO techvagas.users (name, email, password_hash, user_type, created_at, token) 
		 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		name, email, string(hashedPassword), "student", time.Now(), token,
		).Scan(&userID)
		if err != nil {
			// Verifica se é uma violação de chave única
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				log.Printf("Tentativa de cadastro com email já existente: %s", email)
				http.Error(w, "Email já cadastrado", http.StatusConflict)
				return
			}
			log.Printf("Erro detalhado ao inserir usuário: %v", err)
			http.Error(w, "Erro ao criar usuário", http.StatusInternalServerError)
			return
		}

		// Inserir perfil de estudante
		_, err = tx.Exec(context.Background(),
			`INSERT INTO techvagas.students 
			 (user_id, telefone, cidade, estado, foto_path, created_at, xp_user) 
			 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			userID, phone, city, state, driveLink, time.Now(), 0,
		)
		if err != nil {
			log.Printf("Erro detalhado ao inserir estudante: %v", err)
			http.Error(w, "Erro ao criar perfil de estudante", http.StatusInternalServerError)
			return
		}

		// Verificar cursos premium na tabela partner_courses
		premiumCourses, err := getPremiumCoursesForEmail(tx, email)
		if err != nil {
			log.Printf("Erro detalhado ao buscar cursos premium: %v", err)
			http.Error(w, "Erro ao verificar cursos premium", http.StatusInternalServerError)
			return
		}
		log.Printf("Cursos premium encontrados: %v", premiumCourses)

		// Associar a cursos premium encontrados
		for _, course := range premiumCourses {
			_, err = tx.Exec(context.Background(),
				`INSERT INTO techvagas.student_courses 
				 (student_id, course_id, verified, joined_at) 
				 VALUES ($1, $2, $3, $4)`,
				userID, course.ID, true, time.Now(),
			)
			if err != nil {
				http.Error(w, "Erro ao associar curso premium", http.StatusInternalServerError)
				return
			}
		}

		// Commit da transação
		if err := tx.Commit(context.Background()); err != nil {
			http.Error(w, "Erro ao finalizar cadastro", http.StatusInternalServerError)
			return
		}

		// Responder com sucesso
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "Cadastro realizado com sucesso",
			"user_id": userID,
			"premium_courses": premiumCourses, // Lista de cursos premium associados
		})
	}
}

// getPremiumCoursesForEmail busca na tabela partner_courses os cursos premium associados ao email
func getPremiumCoursesForEmail(tx pgx.Tx, email string) ([]models.PartnerCourse, error) {
    rows, err := tx.Query(context.Background(),
        `SELECT id, name, COALESCE(slug, '') FROM techvagas.partner_courses
         WHERE $1 = ANY(emails)`,
        email,
    )
    if err != nil {
        return nil, fmt.Errorf("erro ao buscar cursos premium: %v", err)
    }
    defer rows.Close()

    var courses []models.PartnerCourse
    for rows.Next() {
        var course models.PartnerCourse
        if err := rows.Scan(&course.ID, &course.Name, &course.Slug); err != nil {
            return nil, fmt.Errorf("erro ao ler curso premium: %v", err)
        }
        courses = append(courses, course)
    }

    return courses, nil
}

// Função gerar token aleatorio
func generateToken(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	rand.Seed(time.Now().UnixNano())
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
