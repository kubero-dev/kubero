package main
package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
	"sigs.k8s.io/controller-runtime/pkg/log"
)

var rootCmd = &cobra.Command{
	Use:   "kubero",
	Short: "Kubero CLI for managing Kubero instances",
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		// Skip config validation for login command
		if cmd.Name() == "login" {
			return nil
		}

		logger := log.FromContext(cmd.Context())
		configDir, err := getConfigDir()
		if err != nil {
			return fmt.Errorf("failed to determine config directory: %v", err)
		}

		configPath := filepath.Join(configDir, "credentials")
		if _, err := os.Stat(configPath); os.IsNotExist(err) {
			logger.Error(err, "Credentials file not found", "path", configPath)
			return fmt.Errorf("credentials file not found in %s; please run 'kubero login'", configPath)
		}

		data, err := os.ReadFile(configPath)
		if err != nil {
			logger.Error(err, "Failed to read credentials file", "path", configPath)
			return fmt.Errorf("failed to read credentials file: %v", err)
		}

		var config InstanceConfig
		if err := yaml.Unmarshal(data, &config); err != nil {
			logger.Error(err, "Failed to parse credentials file", "path", configPath)
			return fmt.Errorf("failed to parse credentials file: %v", err)
		}

		// Validate at least one instance exists
		if len(config.Instances) == 0 {
			return fmt.Errorf("no instances configured; please run 'kubero login'")
		}

		return nil
	},
}

// Execute executes the root command
func Execute() error {
	return rootCmd.Execute()
}

func main() {
	if err := Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

// Add dashboard command as an example
var dashboardCmd = &cobra.Command{
	Use:   "dashboard",
	Short: "Open the Kubero dashboard in your browser",
	RunE: func(cmd *cobra.Command, args []string) error {
		fmt.Println("Opening Kubero dashboard...")
		// Implementation goes here
		return nil
	},
}

// Add list command as an example
var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List all applications in the Kubero instance",
	RunE: func(cmd *cobra.Command, args []string) error {
		fmt.Println("Listing applications...")
		// Implementation goes here
		return nil
	},
}

func init() {
	// Add commands
	rootCmd.AddCommand(dashboardCmd)
	rootCmd.AddCommand(listCmd)
}
import (
	"fmt"
	"github.com/kubero-dev/kubero/pkg/core"
)

func main() {
	fmt.Println("Starting Kubero...")
	app := core.NewApp()
	app.Run()
}
