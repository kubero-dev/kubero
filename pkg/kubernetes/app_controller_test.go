package kubernetes

import (
	"context"
	"testing"

	appsv1 "k8s.io/api/apps/v1"
	networkingv1 "k8s.io/api/networking/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
)

// mockClient implements a mock client for testing
type mockClient struct {
	client.Client
	getFunc    func(ctx context.Context, key client.ObjectKey, obj client.Object, opts ...client.GetOption) error
	updateFunc func(ctx context.Context, obj client.Object, opts ...client.UpdateOption) error
}

func (m *mockClient) Get(ctx context.Context, key client.ObjectKey, obj client.Object, opts ...client.GetOption) error {
	if m.getFunc != nil {
		return m.getFunc(ctx, key, obj, opts...)
	}
	return nil
}

func (m *mockClient) Update(ctx context.Context, obj client.Object, opts ...client.UpdateOption) error {
	if m.updateFunc != nil {
		return m.updateFunc(ctx, obj, opts...)
	}
	return nil
}

func TestAddDNSAnnotationsToIngress(t *testing.T) {
	// Create a test ingress
	testIngress := &networkingv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-ingress",
			Namespace: "test-namespace",
		},
	}

	// Setup the mock client
	mockClient := &mockClient{
		getFunc: func(ctx context.Context, key client.ObjectKey, obj client.Object, opts ...client.GetOption) error {
			switch obj.(type) {
			case *networkingv1.Ingress:
				testIngress.DeepCopyInto(obj.(*networkingv1.Ingress))
				return nil
			}
			return errors.NewNotFound(schema.GroupResource{}, key.Name)
		},
		updateFunc: func(ctx context.Context, obj client.Object, opts ...client.UpdateOption) error {
			// Store updated annotations for verification
			ingress, ok := obj.(*networkingv1.Ingress)
			if !ok {
				t.Errorf("Expected Ingress, got %T", obj)
			}
			testIngress.Annotations = ingress.Annotations
			return nil
		},
	}

	// Create the reconciler with mock client
	reconciler := &AppReconciler{
		Client: mockClient,
		Scheme: runtime.NewScheme(),
	}

	// Test adding annotations
	ctx := context.Background()
	testDomain := "test.example.com"
	err := reconciler.AddDNSAnnotationsToIngress(ctx, "test-namespace", "test-ingress", testDomain)

	// Check for errors
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	// Verify annotations were added correctly
	if testIngress.Annotations["external-dns.alpha.kubernetes.io/hostname"] != testDomain {
		t.Errorf("Expected hostname annotation to be %s, got %s",
			testDomain, testIngress.Annotations["external-dns.alpha.kubernetes.io/hostname"])
	}

	if testIngress.Annotations["external-dns.alpha.kubernetes.io/ttl"] != "60" {
		t.Errorf("Expected TTL annotation to be 60, got %s",
			testIngress.Annotations["external-dns.alpha.kubernetes.io/ttl"])
	}
}

func TestIsExternalDNSEnabled(t *testing.T) {
	// Test cases
	testCases := []struct {
		name           string
		deploymentFunc func() *appsv1.Deployment
		expectEnabled  bool
		expectError    bool
	}{
		{
			name: "ExternalDNS enabled",
			deploymentFunc: func() *appsv1.Deployment {
				return &appsv1.Deployment{
					ObjectMeta: metav1.ObjectMeta{
						Name:      "external-dns",
						Namespace: "kubero-system",
					},
					Status: appsv1.DeploymentStatus{
						ReadyReplicas: 1,
					},
				}
			},
			expectEnabled: true,
			expectError:   false,
		},
		{
			name: "ExternalDNS deployment exists but not ready",
			deploymentFunc: func() *appsv1.Deployment {
				return &appsv1.Deployment{
					ObjectMeta: metav1.ObjectMeta{
						Name:      "external-dns",
						Namespace: "kubero-system",
					},
					Status: appsv1.DeploymentStatus{
						ReadyReplicas: 0,
					},
				}
			},
			expectEnabled: false,
			expectError:   false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create a test scheme
			scheme := runtime.NewScheme()
			_ = appsv1.AddToScheme(scheme)

			// Create fake client with the deployment
			client := fake.NewClientBuilder().
				WithScheme(scheme).
				WithObjects(tc.deploymentFunc()).
				Build()

			// Create the reconciler
			reconciler := &AppReconciler{
				Client: client,
				Scheme: scheme,
			}

			// Test IsExternalDNSEnabled
			ctx := context.Background()
			enabled, err := reconciler.IsExternalDNSEnabled(ctx)

			// Check results
			if tc.expectError && err == nil {
				t.Error("Expected error but got none")
			}

			if !tc.expectError && err != nil {
				t.Errorf("Expected no error, got %v", err)
			}

			if enabled != tc.expectEnabled {
				t.Errorf("Expected enabled=%v, got %v", tc.expectEnabled, enabled)
			}
		})
	}

	// Test with no deployment (ExternalDNS not found)
	t.Run("ExternalDNS not deployed", func(t *testing.T) {
		// Create a test scheme
		scheme := runtime.NewScheme()
		_ = appsv1.AddToScheme(scheme)

		// Create empty fake client
		client := fake.NewClientBuilder().
			WithScheme(scheme).
			Build()

		// Create the reconciler
		reconciler := &AppReconciler{
			Client: client,
			Scheme: scheme,
		}

		// Test IsExternalDNSEnabled
		ctx := context.Background()
		enabled, err := reconciler.IsExternalDNSEnabled(ctx)

		// Check results
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}

		if enabled {
			t.Error("Expected ExternalDNS to be disabled, but it was enabled")
		}
	})
}
