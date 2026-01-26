package main

import (
	"context"
	"net/http"
)

// Ambil user_id dari JWT context dengan aman
func getUserID(ctx context.Context) int {
	if ctx.Value("user_id") == nil {
		return 0
	}

	switch v := ctx.Value("user_id").(type) {
	case float64:
		return int(v)
	case int:
		return v
	default:
		return 0
	}
}

// 🔒 Middleware khusus parent
func ParentMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		roleVal := r.Context().Value("role")
		if roleVal == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		role, ok := roleVal.(string)
		if !ok || role != "parent" {
			http.Error(w, "Forbidden - Parent only", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	}
}
