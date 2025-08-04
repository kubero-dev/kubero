// +build ignore

package main

import (
	// Import the packages directly to ensure they're downloaded
	_ "github.com/evanphx/json-patch"
	_ "github.com/evanphx/json-patch/v5"
	_ "sigs.k8s.io/controller-runtime/pkg/client"
	_ "sigs.k8s.io/controller-runtime/pkg/client/fake"
)

func main() {
	// This file is just for dependency resolution
	// Run with: go run temp_deps.go
}
