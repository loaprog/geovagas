package main

import (
	"context"
	"log"
	"net/http"
	"techvagas/internal/database"
	"techvagas/internal/handlers"
	"github.com/joho/godotenv"
)

func main() {
	_= godotenv.Load()
	ctx := context.Background()

	db, err := database.NewDB(ctx)
	if err != nil {
		log.Fatalf("Erro ao conectar ao banco: %v", err)
	}
	defer db.Close()

	cvHandler := handlers.NewCVBankHandler(db)

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	

	// frontend Inicial
	http.HandleFunc("/", handlers.HomeHandler)
	http.HandleFunc("/sobre", handlers.SobreHandler)
	http.HandleFunc("/contato", handlers.ContatoHandler)
	http.HandleFunc("/mundogis", handlers.MundoGisHandler)
	http.HandleFunc("/vagas", handlers.VagasHandler)
	http.HandleFunc("/details/", handlers.DetailsHandler)

	// Frontend Sistema
	http.HandleFunc(("/login"), handlers.LoginHandler)
	http.HandleFunc("/login_profissional", handlers.LoginProfissionalHandler)
	http.HandleFunc("/login_empresa", handlers.LoginEmpresaHandler)
	http.HandleFunc("/register", handlers.RegisterPageHandler)
	http.HandleFunc("/interface_profissional", handlers.InterfaceProfissionalHandler)
	http.HandleFunc("/redefinir_senha", handlers.RedefinirSenhaHandler)
	http.HandleFunc("/student_dashboard", handlers.StudentDashdboardHandler)
	http.HandleFunc("/student_dashboard_cv", handlers.StudentDashboardCVHandler)
	http.HandleFunc("/student_dashboard_courses", handlers.StudentDashboardCoursesHandler)
	http.HandleFunc("/student_dashboard_community", handlers.StudentDashboardCommunityHandler)
	http.HandleFunc("/student_dashboard_jobs", handlers.StudentDashboardJobsHandler)
	http.HandleFunc("/student_dashboard_chat", handlers.StudentDashboardChatHandler)




	// Endpoints Inicial
	http.HandleFunc("/job-posts", handlers.JobPostsHandler(db))
	http.HandleFunc("/job-posts/", handlers.JobPostByIDHandler(db))
	http.Handle("/api/job-suggestions", handlers.JobSuggestionsHandler(db))
	http.Handle("/api/send-message", handlers.SendMessageHandler(db))
	http.HandleFunc("/api/curriculos", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			cvHandler.CreateCV(w, r)
		default:
			http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		}
	})

	// Endpoints Sistema
	http.HandleFunc("/register_user/", handlers.RegisterUserHandler(db))
	http.HandleFunc("/alterar_dados/", handlers.UpdateStudentProfileHandler(db))
	http.HandleFunc("/recuperar_senha/", handlers.RecuperarSenhaHandler(db))
	http.HandleFunc("/alterar_senha/", handlers.AlterarSenhaHandler(db))
	http.HandleFunc("/login_api/", handlers.LoginApiHandler(db))
	http.HandleFunc("/api/progress_cv_by_id/", handlers.ProgressCVByIDHandler(db))
	http.HandleFunc("/job_exclusive", handlers.JobExclusiveHandler(db))
	http.HandleFunc("/top_users", handlers.TopUsersHandler(db))

	log.Println("Servidor rodando na porta 10000")
	if err := http.ListenAndServe(":10000", nil); err != nil {
		log.Fatalf("Erro ao iniciar o servidor: %v", err)
	}
}