package main

import (
	"flag"
	"fmt"
	"os"
	
	"github.com/kubero-dev/kubero/pkg/dns"
	"github.com/kubero-dev/kubero/pkg/dns/providers"
)

func main() {
	var (
		provider    string
		domain      string
		action      string
		appName     string
		namespace   string
		ipAddress   string
		ttl         int
		cfAPIToken  string
		cfZoneID    string
	)
	
	// Parse command-line flags
	flag.StringVar(&provider, "provider", "cloudflare", "DNS provider (cloudflare, aws, gcp, azure)")
	flag.StringVar(&domain, "domain", "", "Base domain for DNS entries")
	flag.StringVar(&action, "action", "", "Action to perform (create, update, delete)")
	flag.StringVar(&appName, "app", "", "Application name")
	flag.StringVar(&namespace, "namespace", "default", "Kubernetes namespace")
	flag.StringVar(&ipAddress, "ip", "", "IP address for the DNS record")
	flag.IntVar(&ttl, "ttl", 300, "TTL for DNS records in seconds")
	flag.StringVar(&cfAPIToken, "cf-token", "", "Cloudflare API token")
	flag.StringVar(&cfZoneID, "cf-zone", "", "Cloudflare Zone ID")
	
	flag.Parse()
	
	// Validate required flags
	if domain == "" {
		fmt.Println("Error: domain is required")
		flag.Usage()
		os.Exit(1)
	}
	
	if action == "" {
		fmt.Println("Error: action is required")
		flag.Usage()
		os.Exit(1)
	}
	
	if appName == "" {
		fmt.Println("Error: app name is required")
		flag.Usage()
		os.Exit(1)
	}
	
	// Create DNS configuration
	providerType := dns.ProviderType(provider)
	config := dns.DNSConfig{
		Provider: providerType,
		Domain:   domain,
		TTL:      ttl,
	}
	
	// Create DNS operator
	operator := dns.NewOperator(config)
	
	// Perform requested action
	var err error
	switch action {
	case "create":
		if ipAddress == "" {
			fmt.Println("Error: IP address is required for create action")
			flag.Usage()
			os.Exit(1)
		}
		err = operator.CreateDNSEntry(appName, namespace, ipAddress)
	case "update":
		if ipAddress == "" {
			fmt.Println("Error: IP address is required for update action")
			flag.Usage()
			os.Exit(1)
		}
		err = operator.UpdateDNSEntry(appName, namespace, ipAddress)
	case "delete":
		err = operator.DeleteDNSEntry(appName, namespace)
	default:
		fmt.Printf("Error: unknown action %s\n", action)
		flag.Usage()
		os.Exit(1)
	}
	
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
	
	fmt.Println("DNS operation completed successfully")
}
