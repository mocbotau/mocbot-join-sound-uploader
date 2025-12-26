package main

import (
	"context"

	"dagger/mocbot-join-sound-uploader/internal/dagger"
)

const (
	nodeJSVersion = "23"
)

type MocbotJoinSoundUploader struct {
	// Repository name
	// +private
	RepoName string
	// Source code directory
	// +private
	Source *dagger.Directory
	// +private
	InfisicalClientSecret *dagger.Secret
}

func New(
	repoName string,
	// Source code directory
	// +defaultPath="."
	source *dagger.Directory,
	// Infisical client secret
	infisicalClientSecret *dagger.Secret,
) *MocbotJoinSoundUploader {
	return &MocbotJoinSoundUploader{
		RepoName:              repoName,
		Source:                source,
		InfisicalClientSecret: infisicalClientSecret,
	}
}

// CI runs the complete CI pipeline
func (m *MocbotJoinSoundUploader) CI(ctx context.Context) (string, error) {
	backend := dag.NodeCi(m.Source.Directory("frontend"), dagger.NodeCiOpts{
		NodeVersion:    nodeJSVersion,
		PackageManager: dagger.NodeCiPackageManagerPnpm,
	})

	return backend.
		Install().
		WithLint().
		Stdout(ctx)
}

// BuildAndPush builds and pushes the Docker image to the container registry
func (m *MocbotJoinSoundUploader) BuildAndPush(
	ctx context.Context,
	// +default="prod"
	env string,
) (string, error) {
	return dag.Docker(m.Source, m.InfisicalClientSecret, m.RepoName, dagger.DockerOpts{
		Environment: env,
	}).Build().Publish(ctx)
}
