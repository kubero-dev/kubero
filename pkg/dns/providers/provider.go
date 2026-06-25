// Package providers contains DNS provider implementations
package providers

// GetAvailableProviders returns a list of available DNS providers
func GetAvailableProviders() []string {
	return []string{
		"cloudflare",
		"route53",
		"azure",
		"google",
	}
}
