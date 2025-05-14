package handlers

import (
	"encoding/json"
	"net/http"
	"time"
	"log"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
	"github.com/golang-jwt/jwt/v5"
)

// dados para login
type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// armazenar claims do JWT
type Claims struct {
	UserID   int    `json:"user_id"`
	UserType string `json:"user_type"`
	Email    string `json:"email"`
	jwt.RegisteredClaims
}

// Configurações do JWT
var jwtKey = []byte("f5Vx6zS1T1YMAmHNbqDpChlg3EOOqFSKzivCNIlMebkr") // Substitua por uma chave segura em produção

func LoginApiHandler(db *pgxpool.Pool) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
            return
        }

        var creds Credentials
        err := json.NewDecoder(r.Body).Decode(&creds)
        if err != nil {
            http.Error(w, "Dados de login inválidos", http.StatusBadRequest)
            return
        }

        if creds.Email == "" || creds.Password == "" {
            http.Error(w, "Email e senha são obrigatórios", http.StatusBadRequest)
            return
        }

        // Buscar usuário E informações do estudante em uma única query
        var userID int
        var userType, name, hashedPassword string
        var photoPath *string // Usamos ponteiro para lidar com NULL no banco
        var xpUser int

        // Query que faz JOIN com a tabela students
        query := `
            SELECT u.id, u.name, u.user_type, u.password_hash, s.foto_path, s.xp_user
            FROM techvagas.users u
            LEFT JOIN techvagas.students s ON u.id = s.user_id
            WHERE u.email = $1
        `

        err = db.QueryRow(context.Background(), query, creds.Email).Scan(
            &userID, &name, &userType, &hashedPassword, &photoPath, &xpUser,
        )

        if err != nil {
            log.Printf("Erro ao buscar usuário: %v", err)
            http.Error(w, "Credenciais inválidas", http.StatusUnauthorized)
            return
        }

        // Verificar senha
        err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(creds.Password))
        if err != nil {
            log.Printf("Senha inválida para usuário: %s", creds.Email)
            http.Error(w, "Credenciais inválidas", http.StatusUnauthorized)
            return
        }

        // Buscar os cursos do estudante
        var courses []map[string]interface{}
        if userType == "student" {
            coursesQuery := `
                SELECT pc.id, pc.name, pc.slug
                FROM techvagas.student_courses sc
                JOIN techvagas.partner_courses pc ON sc.course_id = pc.id
                WHERE sc.student_id = $1
            `
            
            rows, err := db.Query(context.Background(), coursesQuery, userID)
            if err != nil {
                log.Printf("Erro ao buscar cursos do estudante: %v", err)
                // Não retornamos erro, apenas logamos, pois o login é válido
            } else {
                defer rows.Close()
                
                for rows.Next() {
                    var id int
                    var name, slug string
                    if err := rows.Scan(&id, &name, &slug); err != nil {
                        log.Printf("Erro ao scanear curso: %v", err)
                        continue
                    }
                    
                    courses = append(courses, map[string]interface{}{
                        "id":   id,
                        "name": name,
                        "slug": slug,
                    })
                }
                
                if err = rows.Err(); err != nil {
                    log.Printf("Erro após iterar cursos: %v", err)
                }
            }
        }

        // Criar token JWT
        expirationTime := time.Now().Add(24 * time.Hour)
        claims := &Claims{
            UserID:   userID,
            UserType: userType,
            Email:    creds.Email,
            RegisteredClaims: jwt.RegisteredClaims{
                ExpiresAt: jwt.NewNumericDate(expirationTime),
            },
        }

        token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
        tokenString, err := token.SignedString(jwtKey)
        if err != nil {
            log.Printf("Erro ao gerar token: %v", err)
            http.Error(w, "Erro ao realizar login", http.StatusInternalServerError)
            return
        }

        // Preparar resposta
        response := map[string]interface{}{
            "success": true,
            "message": "Login realizado com sucesso",
            "token":   tokenString,
            "user": map[string]interface{}{
                "id":      userID,
                "name":    name,
                "email":   creds.Email,
                "type":    userType,
                "courses": courses, // Adiciona os cursos aqui
            },
        }

        // Adicionar photoPath se existir
        if photoPath != nil && *photoPath != "" {
            response["user"].(map[string]interface{})["photo_url"] = *photoPath
        }

        // Adicionar XP se existir
        if xpUser > 0 {
            response["user"].(map[string]interface{})["xp_user"] = xpUser
        } else {
            response["user"].(map[string]interface{})["xp_user"] = 0
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)
    }
}