package core

import (
	"fmt"
)

// App represents the main application
type App struct {
	Version string
}

// NewApp creates a new instance of the App
func NewApp() *App {
	return &App{
		Version: "0.1.0",
	}
}

// Run starts the application
func (a *App) Run() {
	fmt.Println("Kubero is running, version:", a.Version)
}

// GetVersion returns the current version
func (a *App) GetVersion() string {
	return a.Version
}
