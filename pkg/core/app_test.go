package core

import (
	"testing"
)

func TestNewApp(t *testing.T) {
	app := NewApp()
	if app == nil {
		t.Errorf("Expected NewApp() to return a non-nil value")
	}
}

func TestGetVersion(t *testing.T) {
	app := NewApp()
	version := app.GetVersion()
	if version == "" {
		t.Errorf("Expected version to be non-empty")
	}
}
