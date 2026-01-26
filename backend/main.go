package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	// 🔌 Init Database
	InitDB()

	// 🌐 Router
	r := mux.NewRouter()

	// ================= AUTH =================
	r.HandleFunc("/api/login", LoginHandler).Methods("POST", "OPTIONS")

	// ================= STUDENT =================
	r.HandleFunc(
		"/api/student/profile",
		JWTMiddleware(GetStudentProfileHandler),
	).Methods("GET", "OPTIONS")

	r.HandleFunc(
		"/api/student/profile",
		JWTMiddleware(UpdateStudentProfileHandler),
	).Methods("PUT", "OPTIONS")

	r.HandleFunc(
		"/api/student/schedule",
		JWTMiddleware(GetStudentScheduleHandler),
	).Methods("GET", "OPTIONS")

	r.HandleFunc(
		"/api/student/attendance",
		JWTMiddleware(GetStudentAttendanceHandler),
	).Methods("GET", "OPTIONS")

	r.HandleFunc(
		"/api/student/krs",
		JWTMiddleware(GetStudentKRSHandler),
	).Methods("GET", "OPTIONS")

	r.HandleFunc(
		"/api/student/grades",
		JWTMiddleware(GetStudentGradesHandler),
	).Methods("GET", "OPTIONS")

	// ================= ADMIN / ACADEMIC =================
	r.HandleFunc(
		"/api/admin/students",
		JWTMiddleware(AdminMiddleware(GetAllStudentsHandler)),
	).Methods("GET", "OPTIONS")

	r.HandleFunc(
		"/api/admin/students",
		JWTMiddleware(AdminMiddleware(CreateStudentHandler)),
	).Methods("POST", "OPTIONS")

	r.HandleFunc(
		"/api/admin/students",
		JWTMiddleware(AdminMiddleware(UpdateStudentHandler)),
	).Methods("PUT", "OPTIONS")

	r.HandleFunc(
		"/api/admin/students",
		JWTMiddleware(AdminMiddleware(DeleteStudentHandler)),
	).Methods("DELETE", "OPTIONS")

	// Enrollment management routes
	r.HandleFunc(
		"/api/admin/courses",
		JWTMiddleware(AdminMiddleware(GetAllCoursesHandler)),
	).Methods("GET", "OPTIONS")

	r.HandleFunc(
		"/api/admin/enroll",
		JWTMiddleware(AdminMiddleware(EnrollStudentHandler)),
	).Methods("POST", "OPTIONS")

	r.HandleFunc(
		"/api/admin/unenroll",
		JWTMiddleware(AdminMiddleware(UnenrollStudentHandler)),
	).Methods("POST", "OPTIONS")

	r.HandleFunc(
		"/api/admin/enrollments",
		JWTMiddleware(AdminMiddleware(GetStudentEnrollmentsHandler)),
	).Methods("GET", "OPTIONS")

	// ================= LECTURER =================
	r.HandleFunc(
		"/api/lecturer/courses",
		JWTMiddleware(LecturerMiddleware(GetLecturerCoursesHandler)),
	).Methods("GET", "OPTIONS")

	r.HandleFunc(
		"/api/lecturer/students",
		JWTMiddleware(LecturerMiddleware(GetStudentsInCourseHandler)),
	).Methods("GET", "OPTIONS")

	r.HandleFunc(
		"/api/lecturer/attendance",
		JWTMiddleware(LecturerMiddleware(MarkAttendanceHandler)),
	).Methods("POST", "OPTIONS")

	r.HandleFunc(
		"/api/lecturer/attendance",
		JWTMiddleware(LecturerMiddleware(GetAttendanceForCourseHandler)),
	).Methods("GET", "OPTIONS")

	r.HandleFunc(
		"/api/lecturer/grades",
		JWTMiddleware(LecturerMiddleware(InputGradeHandler)),
	).Methods("POST", "OPTIONS")

	r.HandleFunc(
		"/api/lecturer/grades",
		JWTMiddleware(LecturerMiddleware(GetGradesForCourseHandler)),
	).Methods("GET", "OPTIONS")

	// ================= PARENT =================
	r.HandleFunc(
		"/api/parent/notifications",
		JWTMiddleware(ParentMiddleware(GetParentNotificationsHandler)),
	).Methods("GET", "OPTIONS")

	r.HandleFunc(
		"/api/parent/notifications",
		JWTMiddleware(ParentMiddleware(MarkNotificationAsReadHandler)),
	).Methods("PUT", "OPTIONS")

	// 🔥 FIX 404 — UNREAD COUNT
	r.HandleFunc(
		"/api/parent/notifications/unread-count",
		JWTMiddleware(ParentMiddleware(GetParentUnreadCountHandler)),
	).Methods("GET", "OPTIONS")

	// ================= CORS =================
	handler := enableCORS(r)

	// 🚀 Start Server
	fmt.Println("🚀 Server running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
