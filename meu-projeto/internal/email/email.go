package email

import (
	"gopkg.in/gomail.v2"
	"log"
	"os"
	"github.com/joho/godotenv"
)

func EnviarEmail(destinatario, token string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", "techvagasgeo@gmail.com")
	m.SetHeader("To", destinatario)
	m.SetHeader("Subject", "GeoVagas - Recuperação de Senha")

	// Substitua com o link da sua tela de recuperação:
	link := "http://127.0.0.1:10000/redefinir_senha" 
	_ = godotenv.Load()
	login := os.Getenv("LOGIN_GMAIL")
	senha := os.Getenv("SENHA_GMAIL")


	m.SetBody("text/html", `
		<p>Olá,</p>
		<p>Você solicitou a recuperação de senha.</p>
		<p>Use o seguinte token para redefinir sua senha: <strong>`+token+`</strong></p>
		<p>Acesse o link para redefinir e insira seu token: <a href="`+link+`">Redefinir Senha</a></p>
	`)

	d := gomail.NewDialer("smtp.gmail.com", 587, login, senha)

	if err := d.DialAndSend(m); err != nil {
		log.Println("Erro ao enviar e-mail:", err)
		return err
	}
	return nil
}
