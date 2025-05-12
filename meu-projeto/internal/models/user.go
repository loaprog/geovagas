package models

import (
	"time"
	"github.com/jackc/pgx/v5/pgtype"
)

type User struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"password_hash"`
	UserType     string    `json:"user_type"` // "student", "company", "admin"
	CreatedAt    time.Time `json:"created_at"`
	Token        string    `json:"token"`
}

type Student struct {
    UserID        int           `json:"user_id"`
    Phone         pgtype.Text   `json:"telefone"`
    City          pgtype.Text   `json:"cidade"`
    State         pgtype.Text   `json:"estado"`
    ResumePath    pgtype.Text   `json:"curriculo"`
    DesiredJob    pgtype.Text   `json:"cargo_desejado"`
    QGIS          pgtype.Text   `json:"qgis"`
    ArcGIS        pgtype.Text   `json:"arcgis"`
    AutoCAD       pgtype.Text   `json:"autocad"`
    Python        pgtype.Text   `json:"python"`
    English       pgtype.Text   `json:"ingles"`
    Oratory       pgtype.Text   `json:"oratoria"`
    Interview     pgtype.Text   `json:"entrevista"`
    Bio           pgtype.Text   `json:"bio"`
    CreatedAt     time.Time     `json:"created_at"`
    PhotoPath     pgtype.Text   `json:"foto_path"`
}

type StudentCourse struct {
	ID        int       `json:"id"`
	StudentID int       `json:"student_id"`
	CourseID  int       `json:"course_id"`
	Verified  bool      `json:"verified"`
	JoinedAt  time.Time `json:"joined_at"`
}

type PartnerCourse struct {
	ID      int      `json:"id"`
	Name    string   `json:"name"`
	Slug    string   `json:"slug"`
	Emails  []string `json:"emails"`
}

