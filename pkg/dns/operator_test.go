package dns

import (
	"testing"
)

func TestNewOperator(t *testing.T) {
	config := DNSConfig{
		Provider: ProviderCloudflare,
		Domain:   "example.com",
		TTL:      300,
	}
	
	operator := NewOperator(config)
	
	if operator == nil {
		t.Errorf("Expected NewOperator() to return a non-nil value")
	}
	
	if operator.Config.Provider != ProviderCloudflare {
		t.Errorf("Expected provider to be %s, got %s", ProviderCloudflare, operator.Config.Provider)
	}
	
	if operator.Config.Domain != "example.com" {
		t.Errorf("Expected domain to be %s, got %s", "example.com", operator.Config.Domain)
	}
}

func TestCreateDNSEntry(t *testing.T) {
	config := DNSConfig{
		Provider: ProviderCloudflare,
		Domain:   "example.com",
		TTL:      300,
	}
	
	operator := NewOperator(config)
	
	err := operator.CreateDNSEntry("myapp", "default", "192.168.1.1")
	if err != nil {
		t.Errorf("Expected CreateDNSEntry to succeed, got error: %v", err)
	}
}

func TestDeleteDNSEntry(t *testing.T) {
	config := DNSConfig{
		Provider: ProviderCloudflare,
		Domain:   "example.com",
		TTL:      300,
	}
	
	operator := NewOperator(config)
	
	err := operator.DeleteDNSEntry("myapp", "default")
	if err != nil {
		t.Errorf("Expected DeleteDNSEntry to succeed, got error: %v", err)
	}
}
