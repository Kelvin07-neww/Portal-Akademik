package main

import (
	"encoding/json"
	"net/http"
	"time"
)

// ================= GET NOTIFICATIONS =================
func GetParentNotificationsHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r.Context())

	rows, err := DB.Query(`
		SELECT id, message, is_read, created_at
		FROM notifications
		WHERE parent_id = ?
		ORDER BY created_at DESC
	`, userID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var notifications []map[string]interface{}

	for rows.Next() {
		var id int
		var message string
		var isRead bool
		var createdAt time.Time

		rows.Scan(&id, &message, &isRead, &createdAt)

		notifications = append(notifications, map[string]interface{}{
			"id":         id,
			"message":    message,
			"is_read":    isRead,
			"created_at": createdAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

// ================= MARK AS READ =================
func MarkNotificationAsReadHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r.Context())

	_, err := DB.Exec(`
		UPDATE notifications
		SET is_read = true
		WHERE parent_id = ?
	`, userID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// ================= UNREAD COUNT =================
func GetParentUnreadCountHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r.Context())

	var count int
	err := DB.QueryRow(`
		SELECT COUNT(*)
		FROM notifications
		WHERE parent_id = ? AND is_read = false
	`, userID).Scan(&count)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]int{
		"unread": count,
	})
}
