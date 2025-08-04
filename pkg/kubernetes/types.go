package kubernetes

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// KuberoApp defines the structure for a Kubero application
type KuberoApp struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec KuberoAppSpec `json:"spec,omitempty"`
}

// KuberoAppSpec defines the specification for a Kubero application
type KuberoAppSpec struct {
	// Domain is the custom domain for the application
	Domain string `json:"domain,omitempty"`
}
