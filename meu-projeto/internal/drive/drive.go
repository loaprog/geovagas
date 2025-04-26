
package drive

import (
	"context"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"os"
	"strings"
	"time"
	"log"
	"github.com/joho/godotenv"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
)

type GoogleCredentials struct {
	Type                    string `json:"type"`
	ProjectID               string `json:"project_id"`
	PrivateKeyID            string `json:"private_key_id"`
	PrivateKey              string `json:"private_key"`
	ClientEmail             string `json:"client_email"`
	ClientID                string `json:"client_id"`
	AuthURI                 string `json:"auth_uri"`
	TokenURI                string `json:"token_uri"`
	AuthProviderX509CertURL string `json:"auth_provider_x509_cert_url"`
	ClientX509CertURL       string `json:"client_x509_cert_url"`
	UniverseDomain          string `json:"universe_domain"`
}

func loadCredentials() ([]byte, error) {
    // Tenta carregar do .env local (para desenvolvimento)
    _ = godotenv.Load() // Ignora erro se não encontrar
    
    // Substitui quebras de linha se vierem como string literal
    privateKey := strings.ReplaceAll(os.Getenv("GOOGLE_PRIVATE_KEY"), `\n`, "\n")

    creds := GoogleCredentials{
        Type:                    os.Getenv("GOOGLE_CREDENTIALS_TYPE"),
        ProjectID:               os.Getenv("GOOGLE_PROJECT_ID"),
        PrivateKeyID:            os.Getenv("GOOGLE_PRIVATE_KEY_ID"),
        PrivateKey:              privateKey,
        ClientEmail:             os.Getenv("GOOGLE_CLIENT_EMAIL"),
        ClientID:                os.Getenv("GOOGLE_CLIENT_ID"),
        AuthURI:                 os.Getenv("GOOGLE_AUTH_URI"),
        TokenURI:                os.Getenv("GOOGLE_TOKEN_URI"),
        AuthProviderX509CertURL: os.Getenv("GOOGLE_AUTH_PROVIDER_CERT_URL"),
        ClientX509CertURL:       os.Getenv("GOOGLE_CLIENT_CERT_URL"),
        UniverseDomain:          "googleapis.com",
    }

	log.Println("Credenciais carregadas com sucesso")
	log.Println("Private Key:", creds.PrivateKey)
	log.Println("todos os dados:", creds)


	// Converte a struct para JSON
    return json.Marshal(creds)
}



// UploadFile faz o upload de um arquivo para o Google Drive e retorna o link público.
func UploadFile(nome string, file multipart.File, filename string) (string, error) {
	ctx := context.Background()

	// Carrega as credenciais do .env
	credsJSON, err := loadCredentials()
	if err != nil {
		return "", fmt.Errorf("erro ao carregar credenciais: %v", err)
	}

	// Autentica usando as credenciais
	srv, err := drive.NewService(ctx, option.WithCredentialsJSON(credsJSON))
	if err != nil {
		return "", fmt.Errorf("erro ao criar serviço do Drive: %v", err)
	}

	// Cria ou obtém a pasta principal
	mainFolderID, err := getOrCreateFolder(srv, "curriculo_tech_vagas", "")
	if err != nil {
		return "", err
	}


	// Cria ou obtém a subpasta do mês (ex: 04_25)
	now := time.Now()
	subfolderName := fmt.Sprintf("%02d_%02d", now.Month(), now.Year()%100)
	subFolderID, err := getOrCreateFolder(srv, subfolderName, mainFolderID)
	if err != nil {
		return "", err
	}

	// Prepara o arquivo para upload
	driveFile := &drive.File{
		Name:    fmt.Sprintf("%s_%s", strings.ReplaceAll(nome, " ", "_"), filename),
		Parents: []string{subFolderID},
	}

	// Faz o upload
	uploadedFile, err := srv.Files.Create(driveFile).Media(file).Do()
	if err != nil {
		return "", fmt.Errorf("erro ao fazer upload: %v", err)
	}

	// Torna o arquivo público
	_, err = srv.Permissions.Create(uploadedFile.Id, &drive.Permission{
		Type: "anyone",
		Role: "reader",
	}).Do()
	if err != nil {
		return "", fmt.Errorf("erro ao definir permissão: %v", err)
	}

	// Retorna o link público
	return "https://drive.google.com/file/d/" + uploadedFile.Id + "/view", nil
}

// getOrCreateFolder cria ou obtém uma pasta no Google Drive.
func getOrCreateFolder(srv *drive.Service, name, parentID string) (string, error) {
	query := fmt.Sprintf("mimeType='application/vnd.google-apps.folder' and name='%s'", name)
	if parentID != "" {
		query += fmt.Sprintf(" and '%s' in parents", parentID)
	}

	res, err := srv.Files.List().Q(query).Fields("files(id, name)").Do()
	if err != nil {
		return "", err
	}
	if len(res.Files) > 0 {
		return res.Files[0].Id, nil
	}

	// Cria a pasta se não existir
	folder := &drive.File{
		Name:     name,
		MimeType: "application/vnd.google-apps.folder",
	}
	if parentID != "" {
		folder.Parents = []string{parentID}
	}

	createdFolder, err := srv.Files.Create(folder).Do()
	if err != nil {
		return "", err
	}
	return createdFolder.Id, nil
}
