package main

import (
	"fmt"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
	"os"
	"path/filepath"
)

type InstanceConfig struct {
	Instances map[string]struct {
		APIURL string `yaml:"api_url"`
		Token  string `yaml:"token"`
	} `yaml:"instances"`
}

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Login to a Kubero instance",
	RunE: func(cmd *cobra.Command, args []string) error {
		configDir, err := getConfigDir()
		if err != nil {
			return fmt.Errorf("failed to determine config directory: %v", err)
		}
		if err := os.MkdirAll(configDir, 0755); err != nil {
			return fmt.Errorf("failed to create config directory %s: %v", configDir, err)
		}
		instanceName := promptString("Enter the name of the instance", "julep")
		apiURL := promptString("Enter the API URL of the instance", "http://kubero.julep.ai")
		token := promptString("Kubero Token", "")
		if apiURL == "" || !isValidURL(apiURL) {
			return fmt.Errorf("invalid API URL: %s", apiURL)
		}
		configPath := filepath.Join(configDir, "credentials")
		config := InstanceConfig{Instances: make(map[string]struct {
			APIURL string
			Token  string
		})}
		if _, err := os.Stat(configPath); err == nil {
			data, err := os.ReadFile(configPath)
			if err == nil {
				_ = yaml.Unmarshal(data, &config)
			}
		}
		config.Instances[instanceName] = struct {
			APIURL string
			Token  string
		}{APIURL: apiURL, Token: token}
		data, err := yaml.Marshal(&config)
		if err != nil {
			return fmt.Errorf("failed to marshal config: %v", err)
		}
		if err := os.WriteFile(configPath, data, 0600); err != nil {
			return fmt.Errorf("failed to write credentials file %s: %v", configPath, err)
		}
		fmt.Printf("Successfully logged in to instance %s\n", instanceName)
		return nil
	},
}

func getConfigDir() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err == nil {
		configDir := filepath.Join(homeDir, ".kubero")
		return configDir, nil
	}
	return "/etc/kubero", nil
}

func isValidURL(url string) bool {
	return len(url) > 7 && (url[:7] == "http://" || url[:8] == "https://")
}

func promptString(prompt, defaultValue string) string {
	fmt.Printf("%s [%s]: ", prompt, defaultValue)
	var input string
	fmt.Scanln(&input)
	if input == "" {
		return defaultValue
	}
	return input
}

// To test:
// 1. Build: go build -o kubero operator/api/v1/addons.go
// 2. Run: ./kubero login
// 3. Check ~/.kubero/credentials or /etc/kubero/credentials for the file and content.

// To create a PR:
// 1. Fork and clone the repo.
// 2. Create a branch: git checkout -b fix/cli-credentials-issue-261
// 3. Add and commit your changes: git add operator/api/v1/addons.go && git commit -m "Fix CLI credentials config file loading issue (closes #261)"
// 4. Push: git push origin fix/cli-credentials-issue-261
// 5. Go to your fork on GitHub, click "Contribute" > "Open pull request".
// 6. Set base to kubero-dev/kubero:main, head to your branch.
// 7. Paste the PR description, link to issue #261, and submit.
