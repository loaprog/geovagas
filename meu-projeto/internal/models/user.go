package models

import (
	"time"
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
	UserID        int       `json:"user_id"`
	Phone         string    `json:"telefone"`
	City          string    `json:"cidade"`
	State         string    `json:"estado"`
	ResumePath    string    `json:"curriculo"`
	DesiredJob    string    `json:"cargo_desejado"`
	QGIS          string    `json:"qgis"`
	ArcGIS        string    `json:"arcgis"`
	AutoCAD       string    `json:"autocad"`
	Python        string    `json:"python"`
	English       string    `json:"ingles"`
	Oratory       string    `json:"oratoria"`
	Interview     string    `json:"entrevista"`
	Bio           string    `json:"bio"`
	CreatedAt     time.Time `json:"created_at"`
	PhotoPath     string    `json:"foto_path"`
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

