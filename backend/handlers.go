package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	log.Println("📩 EMAIL INPUT :", req.Email)
	log.Println("🔑 PASSWORD INPUT :", req.Password)

	user, err := GetUserByEmail(req.Email)
	if err != nil {
		log.Println("❌ USER TIDAK DITEMUKAN:", err)
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	log.Println("🧾 EMAIL DB :", user.Email)
	log.Println("🔒 PASSWORD HASH DB :", user.Password)
	log.Println("👤 ROLE DB :", user.Role)

	if !user.CheckPassword(req.Password) {
		log.Println("❌ PASSWORD TIDAK MATCH")
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	log.Println("✅ LOGIN BERHASIL")

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(LoginResponse{Token: tokenString})
}

// Student Handlers

// GetStudentProfileHandler - Get student profile
func GetStudentProfileHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(float64)
	intUserID := int(userID)

	student, err := GetStudentByUserID(intUserID)
	if err != nil {
		http.Error(w, "Student not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(student)
}

// GetStudentScheduleHandler - Get student course schedule
func GetStudentScheduleHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(float64)
	intUserID := int(userID)

	student, err := GetStudentByUserID(intUserID)
	if err != nil {
		http.Error(w, "Student not found", http.StatusNotFound)
		return
	}

	courses, err := GetStudentCourses(student.ID)
	if err != nil {
		http.Error(w, "Error fetching courses", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(courses)
}

// GetStudentAttendanceHandler - Get student attendance records
func GetStudentAttendanceHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(float64)
	intUserID := int(userID)

	student, err := GetStudentByUserID(intUserID)
	if err != nil {
		http.Error(w, "Student not found", http.StatusNotFound)
		return
	}

	attendance, err := GetStudentAttendance(student.ID)
	if err != nil {
		http.Error(w, "Error fetching attendance", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(attendance)
}

// GetStudentKRSHandler - Get student KRS (Kartu Rencana Studi)
func GetStudentKRSHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(float64)
	intUserID := int(userID)

	student, err := GetStudentByUserID(intUserID)
	if err != nil {
		http.Error(w, "Student not found", http.StatusNotFound)
		return
	}

	krs, err := GetStudentKRS(student.ID)
	if err != nil {
		http.Error(w, "Error fetching KRS", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(krs)
}

// GetStudentGradesHandler - Get student grades
func GetStudentGradesHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(float64)
	intUserID := int(userID)

	student, err := GetStudentByUserID(intUserID)
	if err != nil {
		http.Error(w, "Student not found", http.StatusNotFound)
		return
	}

	grades, err := GetStudentGrades(student.ID)
	if err != nil {
		http.Error(w, "Error fetching grades", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(grades)
}

// UpdateStudentProfileHandler - Update student profile
func UpdateStudentProfileHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(float64)
	intUserID := int(userID)

	var req Student
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	err := UpdateStudentProfile(intUserID, req.Name, req.NIM)
	if err != nil {
		http.Error(w, "Error updating profile", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Profile updated successfully"})
}

// Admin Handlers

// CreateStudentHandler - Create new student account
func CreateStudentHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Name     string `json:"name"`
		NIM      string `json:"nim"`
		Major    string `json:"major"`
		Semester int    `json:"semester"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Create user account
	user := &User{
		Email:    req.Email,
		Password: req.Password,
		Role:     "student",
	}

	if err := user.HashPassword(); err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	if err := CreateUser(user); err != nil {
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	// Get the created user ID
	createdUser, err := GetUserByEmail(req.Email)
	if err != nil {
		http.Error(w, "Error retrieving created user", http.StatusInternalServerError)
		return
	}

	// Create student profile
	student := &Student{
		UserID: createdUser.ID,
		Name:   req.Name,
		NIM:    req.NIM,
	}

	if err := CreateStudent(student); err != nil {
		http.Error(w, "Error creating student profile", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Student created successfully"})
}

// GetAllStudentsHandler - Get all students
func GetAllStudentsHandler(w http.ResponseWriter, r *http.Request) {
	students, err := GetAllStudents()
	if err != nil {
		http.Error(w, "Error fetching students", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(students)
}

// UpdateStudentHandler - Update student information
func UpdateStudentHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID       int    `json:"id"`
		Name     string `json:"name"`
		NIM      string `json:"nim"`
		Major    string `json:"major"`
		Semester int    `json:"semester"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := UpdateStudent(req.ID, req.Name, req.NIM, req.Major, req.Semester); err != nil {
		http.Error(w, "Error updating student", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Student updated successfully"})
}

// DeleteStudentHandler - Delete student account
func DeleteStudentHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID int `json:"id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := DeleteStudent(req.ID); err != nil {
		http.Error(w, "Error deleting student", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Student deleted successfully"})
}

// GetAllCoursesHandler - Get all courses for enrollment management
func GetAllCoursesHandler(w http.ResponseWriter, r *http.Request) {
	courses, err := GetAllCourses()
	if err != nil {
		http.Error(w, "Error fetching courses", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(courses)
}

// EnrollStudentHandler - Enroll a student in a course
func EnrollStudentHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		StudentID int `json:"student_id"`
		CourseID  int `json:"course_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := EnrollStudent(req.StudentID, req.CourseID); err != nil {
		http.Error(w, "Error enrolling student", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Student enrolled successfully"})
}

// UnenrollStudentHandler - Remove student enrollment from a course
func UnenrollStudentHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		StudentID int `json:"student_id"`
		CourseID  int `json:"course_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := UnenrollStudent(req.StudentID, req.CourseID); err != nil {
		http.Error(w, "Error unenrolling student", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Student unenrolled successfully"})
}

// GetStudentEnrollmentsHandler - Get all enrollments for a student
func GetStudentEnrollmentsHandler(w http.ResponseWriter, r *http.Request) {
	studentIDStr := r.URL.Query().Get("student_id")
	if studentIDStr == "" {
		http.Error(w, "student_id parameter required", http.StatusBadRequest)
		return
	}

	studentID := 0
	fmt.Sscanf(studentIDStr, "%d", &studentID)

	enrollments, err := GetStudentEnrollments(studentID)
	if err != nil {
		http.Error(w, "Error fetching enrollments", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(enrollments)
}

// AdminMiddleware - Middleware to check if user is admin
func AdminMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		role := r.Context().Value("role").(string)
		if role != "admin" {
			http.Error(w, "Access denied. Admin role required", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	}
}

// Lecturer Handlers

// GetLecturerProfileHandler - Get lecturer profile
func GetLecturerProfileHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(float64)
	intUserID := int(userID)

	lecturer, err := GetLecturerByUserID(intUserID)
	if err != nil {
		http.Error(w, "Lecturer not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(lecturer)
}

// GetLecturerCoursesHandler - Get courses taught by lecturer
func GetLecturerCoursesHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(float64)
	intUserID := int(userID)

	lecturer, err := GetLecturerByUserID(intUserID)
	if err != nil {
		http.Error(w, "Lecturer not found", http.StatusNotFound)
		return
	}

	courses, err := GetLecturerCourses(lecturer.ID)
	if err != nil {
		http.Error(w, "Error fetching courses", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(courses)
}

// GetStudentsInCourseHandler - Get students enrolled in a course
func GetStudentsInCourseHandler(w http.ResponseWriter, r *http.Request) {
	courseIDStr := r.URL.Query().Get("course_id")
	if courseIDStr == "" {
		http.Error(w, "course_id parameter required", http.StatusBadRequest)
		return
	}

	courseID := 0
	fmt.Sscanf(courseIDStr, "%d", &courseID)

	students, err := GetStudentsInCourse(courseID)
	if err != nil {
		http.Error(w, "Error fetching students", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(students)
}

// MarkAttendanceHandler - Mark attendance for students
func MarkAttendanceHandler(w http.ResponseWriter, r *http.Request) {
	var attendances []Attendance
	if err := json.NewDecoder(r.Body).Decode(&attendances); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	for _, attendance := range attendances {
		if err := MarkAttendance(&attendance); err != nil {
			http.Error(w, "Error marking attendance", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Attendance marked successfully"})
}

// InputGradeHandler - Input grades for students
func InputGradeHandler(w http.ResponseWriter, r *http.Request) {
	var grades []GradeRecord
	if err := json.NewDecoder(r.Body).Decode(&grades); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	for _, grade := range grades {
		if err := InputGrade(&grade); err != nil {
			http.Error(w, "Error inputting grade", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Grades input successfully"})
}

// GetGradesForCourseHandler - Get grades for a course
func GetGradesForCourseHandler(w http.ResponseWriter, r *http.Request) {
	courseIDStr := r.URL.Query().Get("course_id")
	if courseIDStr == "" {
		http.Error(w, "course_id parameter required", http.StatusBadRequest)
		return
	}

	courseID := 0
	fmt.Sscanf(courseIDStr, "%d", &courseID)

	grades, err := GetGradesForCourse(courseID)
	if err != nil {
		http.Error(w, "Error fetching grades", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(grades)
}

// GetAttendanceForCourseHandler - Get attendance for a course
func GetAttendanceForCourseHandler(w http.ResponseWriter, r *http.Request) {
	courseIDStr := r.URL.Query().Get("course_id")
	if courseIDStr == "" {
		http.Error(w, "course_id parameter required", http.StatusBadRequest)
		return
	}

	courseID := 0
	fmt.Sscanf(courseIDStr, "%d", &courseID)

	attendance, err := GetAttendanceForCourse(courseID)
	if err != nil {
		http.Error(w, "Error fetching attendance", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(attendance)
}

// LecturerMiddleware - Middleware to check if user is lecturer
func LecturerMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		role := r.Context().Value("role").(string)
		if role != "lecturer" {
			http.Error(w, "Access denied. Lecturer role required", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	}
}

// JWTMiddleware - Middleware for JWT authentication
func JWTMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			http.Error(w, "Bearer token required", http.StatusUnauthorized)
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			ctx := context.WithValue(r.Context(), "user_id", claims["user_id"])
			ctx = context.WithValue(ctx, "email", claims["email"])
			ctx = context.WithValue(ctx, "role", claims["role"])
			r = r.WithContext(ctx)
		} else {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	}
}
