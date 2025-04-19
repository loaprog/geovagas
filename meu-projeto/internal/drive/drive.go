package drive

import (
	"context"
	"fmt"
	"mime/multipart"
	"strings"
	"time"

	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
)

// UploadFile faz o upload de um arquivo para o Google Drive e retorna o link público.
func UploadFile(nome string, file multipart.File, filename string) (string, error) {
	ctx := context.Background()

	// Autentica usando a conta de serviço
	srv, err := drive.NewService(ctx, option.WithCredentialsFile("internal/drive/credentials.json"))
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
