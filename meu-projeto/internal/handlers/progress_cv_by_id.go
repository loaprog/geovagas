package handlers


import (
    "strconv"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/pgtype"
	"techvagas/internal/models"
)

type ProgressCVByIDRequest struct {
	IdUser string `json:"id"`
}

type ProgressCVByIDResponse struct {
	IdUser   string            `json:"id"`
	Progress float64           `json:"progress"`
	Student  map[string]string `json:"student_data"`
}

func ProgressCVByIDHandler(db *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Decodificar o request
		var req ProgressCVByIDRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Validar o ID do usuário
		if req.IdUser == "" {
			http.Error(w, "User ID is required", http.StatusBadRequest)
			return
		}

		// Buscar dados do estudante no banco de dados
		student, err := getStudentData(r.Context(), db, req.IdUser) // Passe o contexto aqui
		if err != nil {
			http.Error(w, fmt.Sprintf("Error fetching student data: %v", err), http.StatusInternalServerError)
			return
		}

		// Calcular o progresso do CV
		progress, filledFields := calculateCVProgress(student)
        formattedProgress := fmt.Sprintf("%.2f", progress)
        progressFloat, _ := strconv.ParseFloat(formattedProgress, 64)

		// Preparar a resposta
		response := ProgressCVByIDResponse{
			IdUser:   req.IdUser,
			Progress: progressFloat,
			Student:  convertStudentToMap(student, filledFields),
		}

		// Enviar a resposta
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, "Error encoding response", http.StatusInternalServerError)
			return
		}
	}
}

// getStudentData busca os dados do estudante no banco de dados
func getStudentData(ctx context.Context, db *pgxpool.Pool, userID string) (*models.Student, error) {
    conn, err := db.Acquire(ctx)
    if err != nil {
        return nil, err
    }
    defer conn.Release()

    query := `
        SELECT s.user_id, s.telefone, s.cidade, s.estado, s.curriculo, s.portfolio, s.cargo_desejado, 
               s.qgis, s.arcgis, s.autocad, s.python, s.ingles, 
               s.oratoria, s.entrevista, s.bio, s.foto_path
        FROM techvagas.students s
        WHERE s.user_id = $1
    `

    var student models.Student
    err = conn.QueryRow(ctx, query, userID).Scan(
        &student.UserID, &student.Phone, &student.City, &student.State, 
        &student.ResumePath, &student.Portfolio, &student.DesiredJob, &student.QGIS, &student.ArcGIS, 
        &student.AutoCAD, &student.Python, &student.English, &student.Oratory, 
        &student.Interview, &student.Bio, &student.PhotoPath,
    )
    if err != nil {
        return nil, err
    }

    return &student, nil
}

// calculateCVProgress calcula o percentual de campos preenchidos no perfil do estudante
func calculateCVProgress(student *models.Student) (float64, map[string]bool) {
    val := reflect.ValueOf(*student)
    typeOfS := val.Type()

    totalFields := 0
    filledFields := 0
    fieldStatus := make(map[string]bool)

    for i := 0; i < val.NumField(); i++ {
        fieldName := typeOfS.Field(i).Name
        if fieldName == "UserID" || fieldName == "CreatedAt" {
            continue
        }

        totalFields++
        fieldValue := val.Field(i).Interface()
        isFilled := false

        switch v := fieldValue.(type) {
        case pgtype.Text:
            isFilled = v.Valid && strings.TrimSpace(v.String) != ""
        case int:
            isFilled = v != 0
        case time.Time:
            isFilled = !v.IsZero()
        default:
            isFilled = false
        }

        if isFilled {
            filledFields++
        }
        fieldStatus[fieldName] = isFilled
    }

    progress := (float64(filledFields) / float64(totalFields)) * 100
    return progress, fieldStatus
}

// convertStudentToMap converte a struct Student para um map e marca os campos preenchidos
func convertStudentToMap(student *models.Student, filledFields map[string]bool) map[string]string {
    result := make(map[string]string)
    val := reflect.ValueOf(*student)
    typeOfS := val.Type()

    for i := 0; i < val.NumField(); i++ {
        fieldName := typeOfS.Field(i).Name
        jsonTag := typeOfS.Field(i).Tag.Get("json")
        if jsonTag == "" || jsonTag == "-" {
            continue
        }

        fieldValue := val.Field(i).Interface()
        var valueStr string

        switch v := fieldValue.(type) {
        case pgtype.Text:
            if v.Valid {
                valueStr = v.String
            } else {
                valueStr = ""
            }
        case int:
            valueStr = fmt.Sprintf("%d", v)
        case time.Time:
            valueStr = v.Format(time.RFC3339)
        default:
            valueStr = fmt.Sprintf("%v", v)
        }

        // Adicionar status de preenchimento ao nome do campo
        if filled, exists := filledFields[fieldName]; exists {
            if filled {
                valueStr += " (preenchido)"
            } else {
                valueStr += " (não preenchido)"
            }
        }

        result[jsonTag] = valueStr
    }

    return result
}