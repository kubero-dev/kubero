package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
	"sigs.k8s.io/controller-runtime/pkg/log"
)

type InstanceConfig struct {
	Instances map[string]struct {
		APIURL string `yaml:"api_url"`
		Token  string `yaml:"token"`
	} `yaml:"instances"`
}

func init() {
	rootCmd.AddCommand(loginCmd)
}

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Login to a Kubero instance",
	RunE: func(cmd *cobra.Command, args []string) error {
		logger := log.FromContext(cmd.Context())
		configDir, err := getConfigDir()
		if err != nil {
			return fmt.Errorf("failed to determine config directory: %v", err)
		}

		// Ensure config directory exists
		if err := os.MkdirAll(configDir, 0755); err != nil {
			logger.Error(err, "Failed to create config directory", "path", configDir)
			return fmt.Errorf("failed to create config directory %s: %v", configDir, err)
		}

		// Prompt for instance details
		instanceName := promptString("Enter the name of the instance", "julep")
		apiURL := promptString("Enter the API URL of the instance", "http://kubero.julep.ai")
		token := promptString("Kubero Token", "")

		// Validate API URL
		if apiURL == "" || !isValidURL(apiURL) {
			return fmt.Errorf("invalid API URL: %s", apiURL)
		}

		// Create or update credentials file
		configPath := filepath.Join(configDir, "credentials")
		config := InstanceConfig{Instances: make(map[string]struct {
			APIURL string
			Token  string
		})}
		if _, err := os.Stat(configPath); err == nil {
			// Load existing config
			data, err := os.ReadFile(configPath)
			if err != nil {
				logger.Error(err, "Failed to read existing credentials file", "path", configPath)
				return fmt.Errorf("failed to read credentials file: %v", err)
			}
			if err := yaml.Unmarshal(data, &config); err != nil {
				logger.Error(err, "Failed to parse existing credentials file", "path", configPath)
				return fmt.Errorf("failed to parse credentials file: %v", err)
			}
		}

		// Update config with new instance
		config.Instances[instanceName] = struct {
			APIURL string
			Token  string
		}{APIURL: apiURL, Token: token}

		// Write config to file
		data, err := yaml.Marshal(&config)
		if err != nil {
			logger.Error(err, "Failed to marshal config")
			return fmt.Errorf("failed to marshal config: %v", err)
		}
		if err := os.WriteFile(configPath, data, 0600); err != nil {
			logger.Error(err, "Failed to write credentials file", "path", configPath)
			return fmt.Errorf("failed to write credentials file %s: %v", configPath, err)
		}

		fmt.Printf("Successfully logged in to instance %s\n", instanceName)
		return nil
	},
}

// Helper function to determine config directory
func getConfigDir() (string, error) {
	// Try ~/.kubero first
	homeDir, err := os.UserHomeDir()
	if err == nil {
		configDir := filepath.Join(homeDir, ".kubero")
		if _, err := os.Stat(configDir); err == nil || os.IsNotExist(err) {
			return configDir, nil
		}
	}
	// Fallback to /etc/kubero
	if _, err := os.Stat("/etc/kubero"); err == nil || os.IsNotExist(err) {
		return "/etc/kubero", nil
	}
	return "", fmt.Errorf("no writable config directory found in [/etc/kubero, ~/.kubero]")
}

// Helper function to validate URL (simplified; add more validation if needed)
func isValidURL(url string) bool {
	return len(url) > 7 && (url[:7] == "http://" || url[:8] == "https://")
}

// Helper function for prompting (replace with actual prompt logic, e.g., survey)
func promptString(prompt, defaultValue string) string {
	fmt.Printf("%s [%s]: ", prompt, defaultValue)
	var input string
	fmt.Scanln(&input)
	if input == "" {
		return defaultValue
	}
	return input
}
