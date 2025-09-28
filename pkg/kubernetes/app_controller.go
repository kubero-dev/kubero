package kubernetes

import (
	"context"
	"fmt"
	
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// AppReconciler reconciles a KuberoApp object
type AppReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// AddDNSAnnotationsToIngress adds External-DNS annotations to Ingress resources
// if the External-DNS add-on is enabled and the app has a custom domain
func (r *AppReconciler) AddDNSAnnotationsToIngress(ctx context.Context, app *KuberoApp) error {
	// Check if app has a custom domain
	if app.Spec.Domain == "" {
		return nil
	}
	
	// Check if External-DNS add-on is enabled
	externalDNSEnabled, err := r.IsExternalDNSEnabled(ctx)
	if err != nil || !externalDNSEnabled {
		return err
	}
	
	// Find Ingress for the app
	ingressName := fmt.Sprintf("%s-kuberoapp", app.Name)
	ingress := &networkingv1.Ingress{}
	err = r.Get(ctx, client.ObjectKey{Namespace: app.Namespace, Name: ingressName}, ingress)
	if err != nil {
		return err
	}
	
	// Add External-DNS annotations
	if ingress.Annotations == nil {
		ingress.Annotations = make(map[string]string)
	}
	
	// Set DNS annotations
	ingress.Annotations["external-dns.alpha.kubernetes.io/hostname"] = app.Spec.Domain
	ingress.Annotations["external-dns.alpha.kubernetes.io/ttl"] = "60"
	
	// Update the Ingress resource
	return r.Update(ctx, ingress)
}

// IsExternalDNSEnabled checks if the External-DNS add-on is enabled
func (r *AppReconciler) IsExternalDNSEnabled(ctx context.Context) (bool, error) {
	// Check for External-DNS deployment in kubero-system namespace
	deployment := &appsv1.Deployment{}
	err := r.Get(ctx, client.ObjectKey{Namespace: "kubero-system", Name: "external-dns"}, deployment)
	if err != nil {
		if errors.IsNotFound(err) {
			return false, nil
		}
		return false, err
	}
	
	// Check for kubero.dev/addon=true label
	addonLabel, exists := deployment.Labels["kubero.dev/addon"]
	return exists && addonLabel == "true", nil
}

// Reconcile is the main reconciliation loop for KuberoApp
func (r *AppReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	// Get the KuberoApp instance
	app := &KuberoApp{}
	if err := r.Get(ctx, req.NamespacedName, app); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}
	
	// Add DNS annotations to Ingress if needed
	if err := r.AddDNSAnnotationsToIngress(ctx, app); err != nil {
		return ctrl.Result{}, err
	}
	
	// Continue with other reconciliation tasks
	
	return ctrl.Result{}, nil
}
