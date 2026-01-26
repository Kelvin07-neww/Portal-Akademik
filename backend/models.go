package main

import (
	"fmt"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        int    `json:"id"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Role      string `json:"role"`
	CreatedAt string `json:"created_at"`
}

// 🔐 PASSWORD METHODS
func (u *User) HashPassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(u.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		log.Println("ERROR HASH PASSWORD:", err)
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword(
		[]byte(u.Password),
		[]byte(password),
	)
	return err == nil
}

// 🗄️ DATABASE METHODS
func GetUserByEmail(email string) (*User, error) {
	var user User

	row := DB.QueryRow(`
		SELECT id, email, password, role, created_at
		FROM users
		WHERE email = ?
	`, email)

	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func CreateUser(user *User) error {
	user.CreatedAt = time.Now().Format("2006-01-02 15:04:05")

	result, err := DB.Exec(`
		INSERT INTO users (email, password, role, created_at)
		VALUES (?, ?, ?, ?)
	`, user.Email, user.Password, user.Role, user.CreatedAt)

	if err != nil {
		log.Println("❌ INSERT USER ERROR:", err)
		return err
	}

	rows, _ := result.RowsAffected()
	log.Println("✅ USER INSERTED, rows affected:", rows)
	return nil
}

// Student struct
type Student struct {
	ID     int    `json:"id"`
	UserID int    `json:"user_id"`
	Name   string `json:"name"`
	NIM    string `json:"nim"`
}

// Lecturer struct
type Lecturer struct {
	ID     int    `json:"id"`
	UserID int    `json:"user_id"`
	Name   string `json:"name"`
	NIP    string `json:"nip"`
}

// Parent struct
type Parent struct {
	ID             int    `json:"id"`
	UserID         int    `json:"user_id"`
	Name           string `json:"name"`
	ChildStudentID int    `json:"child_student_id"`
}

// Course struct
type Course struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Code         string `json:"code"`
	LecturerID   int    `json:"lecturer_id"`
	LecturerName string `json:"lecturer_name,omitempty"`
}

// Attendance struct
type Attendance struct {
	ID         int    `json:"id"`
	StudentID  int    `json:"student_id"`
	CourseID   int    `json:"course_id"`
	Date       string `json:"date"`
	Status     string `json:"status"`
	CourseName string `json:"course_name,omitempty"`
}

// Notification struct
type Notification struct {
	ID        int    `json:"id"`
	ParentID  int    `json:"parent_id"`
	Message   string `json:"message"`
	IsRead    bool   `json:"is_read"`
	CreatedAt string `json:"created_at"`
}

// Grade struct for viewing grades
type Grade struct {
	CourseName string  `json:"course_name"`
	CourseCode string  `json:"course_code"`
	Grade      string  `json:"grade"`
	GPA        float64 `json:"gpa"`
}

// GradeRecord struct for managing grades
type GradeRecord struct {
	ID          int     `json:"id"`
	StudentID   int     `json:"student_id"`
	CourseID    int     `json:"course_id"`
	GradeType   string  `json:"grade_type"`
	Score       float64 `json:"score"`
	StudentName string  `json:"student_name,omitempty"`
	CourseName  string  `json:"course_name,omitempty"`
}

// Enrollment struct
type Enrollment struct {
	ID         int    `json:"id"`
	StudentID  int    `json:"student_id"`
	CourseID   int    `json:"course_id"`
	EnrolledAt string `json:"enrolled_at"`
}

// Student database methods
func GetStudentByUserID(userID int) (*Student, error) {
	var student Student

	row := DB.QueryRow(`
		SELECT id, user_id, name, nim
		FROM students
		WHERE user_id = ?
	`, userID)

	err := row.Scan(&student.ID, &student.UserID, &student.Name, &student.NIM)
	if err != nil {
		return nil, err
	}

	return &student, nil
}

func GetStudentCourses(studentID int) ([]Course, error) {
	rows, err := DB.Query(`
		SELECT c.id, c.name, c.code, c.lecturer_id, l.name as lecturer_name
		FROM courses c
		JOIN lecturers l ON c.lecturer_id = l.id
		JOIN attendance a ON c.id = a.course_id
		WHERE a.student_id = ?
		GROUP BY c.id
	`, studentID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []Course
	for rows.Next() {
		var course Course
		err := rows.Scan(&course.ID, &course.Name, &course.Code, &course.LecturerID, &course.LecturerName)
		if err != nil {
			return nil, err
		}
		courses = append(courses, course)
	}

	return courses, nil
}

func GetStudentAttendance(studentID int) ([]Attendance, error) {
	rows, err := DB.Query(`
		SELECT a.id, a.student_id, a.course_id, a.date, a.status, c.name as course_name
		FROM attendance a
		JOIN courses c ON a.course_id = c.id
		WHERE a.student_id = ?
		ORDER BY a.date DESC
	`, studentID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attendances []Attendance
	for rows.Next() {
		var attendance Attendance
		err := rows.Scan(&attendance.ID, &attendance.StudentID, &attendance.CourseID, &attendance.Date, &attendance.Status, &attendance.CourseName)
		if err != nil {
			return nil, err
		}
		attendances = append(attendances, attendance)
	}

	return attendances, nil
}

// Send notification to parent when student attends class
func SendAttendanceNotification(studentID, courseID int, date string) error {
	// Get parent ID for the student
	var parentID int
	err := DB.QueryRow(`
		SELECT p.id
		FROM parents p
		WHERE p.child_student_id = ?
	`, studentID).Scan(&parentID)

	if err != nil {
		// No parent found for this student, skip notification
		return nil
	}

	// Get course name
	var courseName string
	err = DB.QueryRow("SELECT name FROM courses WHERE id = ?", courseID).Scan(&courseName)
	if err != nil {
		return err
	}

	// Get student name
	var studentName string
	err = DB.QueryRow("SELECT name FROM students WHERE id = ?", studentID).Scan(&studentName)
	if err != nil {
		return err
	}

	// Create notification message
	message := fmt.Sprintf("Anak Anda %s telah hadir di kelas %s pada tanggal %s", studentName, courseName, date)

	// Insert notification
	_, err = DB.Exec(`
		INSERT INTO notifications (parent_id, message, is_read, created_at)
		VALUES (?, ?, false, NOW())
	`, parentID, message)

	return err
}

// Parent notification methods
func GetParentNotifications(parentID int) ([]Notification, error) {
	rows, err := DB.Query(`
		SELECT id, parent_id, message, is_read, created_at
		FROM notifications
		WHERE parent_id = ?
		ORDER BY created_at DESC
	`, parentID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var notification Notification
		err := rows.Scan(&notification.ID, &notification.ParentID, &notification.Message, &notification.IsRead, &notification.CreatedAt)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}

	return notifications, nil
}

func MarkNotificationAsRead(notificationID int) error {
	_, err := DB.Exec(`
		UPDATE notifications
		SET is_read = true
		WHERE id = ?
	`, notificationID)

	return err
}

func GetParentByUserID(userID int) (*Parent, error) {
	var parent Parent

	row := DB.QueryRow(`
		SELECT id, user_id, name, child_student_id
		FROM parents
		WHERE user_id = ?
	`, userID)

	err := row.Scan(&parent.ID, &parent.UserID, &parent.Name, &parent.ChildStudentID)
	if err != nil {
		return nil, err
	}

	return &parent, nil
}

func GetStudentKRS(studentID int) ([]Course, error) {
	// For simplicity, return all courses the student is enrolled in
	return GetStudentCourses(studentID)
}

func GetStudentGrades(studentID int) ([]Grade, error) {
	// Mock grades - in real app, this would come from a grades table
	grades := []Grade{
		{CourseName: "Pemrograman Web", CourseCode: "PW101", Grade: "A", GPA: 4.0},
		{CourseName: "Basis Data", CourseCode: "BD102", Grade: "B+", GPA: 3.5},
		{CourseName: "Algoritma", CourseCode: "ALG103", Grade: "A-", GPA: 3.75},
	}
	return grades, nil
}

func UpdateStudentProfile(userID int, name, nim string) error {
	_, err := DB.Exec(`
		UPDATE students
		SET name = ?, nim = ?
		WHERE user_id = ?
	`, name, nim, userID)

	return err
}

// Admin functions for managing students

func CreateStudent(student *Student) error {
	result, err := DB.Exec(`
		INSERT INTO students (user_id, name, nim)
		VALUES (?, ?, ?)
	`, student.UserID, student.Name, student.NIM)

	if err != nil {
		log.Println("❌ INSERT STUDENT ERROR:", err)
		return err
	}

	rows, _ := result.RowsAffected()
	log.Println("✅ STUDENT INSERTED, rows affected:", rows)
	return nil
}

func GetAllStudents() ([]Student, error) {
	rows, err := DB.Query(`
		SELECT s.id, s.user_id, s.name, s.nim, u.email
		FROM students s
		JOIN users u ON s.user_id = u.id
		WHERE u.role = 'student'
	`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var students []Student
	for rows.Next() {
		var student Student
		var email string
		err := rows.Scan(&student.ID, &student.UserID, &student.Name, &student.NIM, &email)
		if err != nil {
			return nil, err
		}
		students = append(students, student)
	}

	return students, nil
}

func UpdateStudent(id int, name, nim, major string, semester int) error {
	_, err := DB.Exec(`
		UPDATE students
		SET name = ?, nim = ?
		WHERE id = ?
	`, name, nim, id)

	return err
}

func DeleteStudent(id int) error {
	// First get the user_id to delete from users table
	var userID int
	err := DB.QueryRow("SELECT user_id FROM students WHERE id = ?", id).Scan(&userID)
	if err != nil {
		return err
	}

	// Delete from students table
	_, err = DB.Exec("DELETE FROM students WHERE id = ?", id)
	if err != nil {
		return err
	}

	// Delete from users table
	_, err = DB.Exec("DELETE FROM users WHERE id = ?", userID)
	return err
}

// Lecturer database methods

func GetLecturerByUserID(userID int) (*Lecturer, error) {
	var lecturer Lecturer

	row := DB.QueryRow(`
		SELECT id, user_id, name, nip
		FROM lecturers
		WHERE user_id = ?
	`, userID)

	err := row.Scan(&lecturer.ID, &lecturer.UserID, &lecturer.Name, &lecturer.NIP)
	if err != nil {
		return nil, err
	}

	return &lecturer, nil
}

func GetLecturerCourses(lecturerID int) ([]Course, error) {
	rows, err := DB.Query(`
		SELECT id, name, code, lecturer_id
		FROM courses
		WHERE lecturer_id = ?
	`, lecturerID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []Course
	for rows.Next() {
		var course Course
		err := rows.Scan(&course.ID, &course.Name, &course.Code, &course.LecturerID)
		if err != nil {
			return nil, err
		}
		courses = append(courses, course)
	}

	return courses, nil
}

func GetStudentsInCourse(courseID int) ([]Student, error) {
	rows, err := DB.Query(`
		SELECT DISTINCT s.id, s.user_id, s.name, s.nim
		FROM students s
		JOIN enrollments e ON s.id = e.student_id
		WHERE e.course_id = ?
	`, courseID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var students []Student
	for rows.Next() {
		var student Student
		err := rows.Scan(&student.ID, &student.UserID, &student.Name, &student.NIM)
		if err != nil {
			return nil, err
		}
		students = append(students, student)
	}

	return students, nil
}

func MarkAttendance(attendance *Attendance) error {
	result, err := DB.Exec(`
		INSERT INTO attendance (student_id, course_id, date, status)
		VALUES (?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE status = VALUES(status)
	`, attendance.StudentID, attendance.CourseID, attendance.Date, attendance.Status)

	if err != nil {
		log.Println("❌ INSERT ATTENDANCE ERROR:", err)
		return err
	}

	rows, _ := result.RowsAffected()
	log.Println("✅ ATTENDANCE MARKED, rows affected:", rows)

	// Send notification to parent when student is present
	if attendance.Status == "present" {
		err = SendAttendanceNotification(attendance.StudentID, attendance.CourseID, attendance.Date)
		if err != nil {
			log.Printf("Error sending notification: %v", err)
			// Don't fail the attendance marking if notification fails
		}
	}

	return nil
}

func InputGrade(grade *GradeRecord) error {
	result, err := DB.Exec(`
		INSERT INTO grades (student_id, course_id, grade_type, score)
		VALUES (?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE score = VALUES(score)
	`, grade.StudentID, grade.CourseID, grade.GradeType, grade.Score)

	if err != nil {
		log.Println("❌ INSERT GRADE ERROR:", err)
		return err
	}

	rows, _ := result.RowsAffected()
	log.Println("✅ GRADE INPUT, rows affected:", rows)
	return nil
}

func GetGradesForCourse(courseID int) ([]GradeRecord, error) {
	rows, err := DB.Query(`
		SELECT g.id, g.student_id, g.course_id, g.grade_type, g.score, s.name as student_name, c.name as course_name
		FROM grades g
		JOIN students s ON g.student_id = s.id
		JOIN courses c ON g.course_id = c.id
		WHERE g.course_id = ?
		ORDER BY s.name, g.grade_type
	`, courseID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var grades []GradeRecord
	for rows.Next() {
		var grade GradeRecord
		err := rows.Scan(&grade.ID, &grade.StudentID, &grade.CourseID, &grade.GradeType, &grade.Score, &grade.StudentName, &grade.CourseName)
		if err != nil {
			return nil, err
		}
		grades = append(grades, grade)
	}

	return grades, nil
}

func GetAttendanceForCourse(courseID int) ([]Attendance, error) {
	rows, err := DB.Query(`
		SELECT a.id, a.student_id, a.course_id, a.date, a.status, s.name as student_name, c.name as course_name
		FROM attendance a
		JOIN students s ON a.student_id = s.id
		JOIN courses c ON a.course_id = c.id
		WHERE a.course_id = ?
		ORDER BY a.date DESC, s.name
	`, courseID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attendances []Attendance
	for rows.Next() {
		var attendance Attendance
		var studentName, courseName string
		err := rows.Scan(&attendance.ID, &attendance.StudentID, &attendance.CourseID, &attendance.Date, &attendance.Status, &studentName, &courseName)
		if err != nil {
			return nil, err
		}
		attendance.CourseName = courseName
		attendances = append(attendances, attendance)
	}

	return attendances, nil
}

// Enrollment management functions

func GetAllCourses() ([]Course, error) {
	rows, err := DB.Query(`
		SELECT c.id, c.name, c.code, c.lecturer_id, l.name as lecturer_name
		FROM courses c
		JOIN lecturers l ON c.lecturer_id = l.id
	`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []Course
	for rows.Next() {
		var course Course
		err := rows.Scan(&course.ID, &course.Name, &course.Code, &course.LecturerID, &course.LecturerName)
		if err != nil {
			return nil, err
		}
		courses = append(courses, course)
	}

	return courses, nil
}

func EnrollStudent(studentID, courseID int) error {
	result, err := DB.Exec(`
		INSERT INTO enrollments (student_id, course_id)
		VALUES (?, ?)
		ON DUPLICATE KEY UPDATE enrolled_at = CURRENT_TIMESTAMP
	`, studentID, courseID)

	if err != nil {
		log.Println("❌ INSERT ENROLLMENT ERROR:", err)
		return err
	}

	rows, _ := result.RowsAffected()
	log.Println("✅ STUDENT ENROLLED, rows affected:", rows)
	return nil
}

func UnenrollStudent(studentID, courseID int) error {
	result, err := DB.Exec(`
		DELETE FROM enrollments
		WHERE student_id = ? AND course_id = ?
	`, studentID, courseID)

	if err != nil {
		log.Println("❌ DELETE ENROLLMENT ERROR:", err)
		return err
	}

	rows, _ := result.RowsAffected()
	log.Println("✅ STUDENT UNENROLLED, rows affected:", rows)
	return nil
}

func GetStudentEnrollments(studentID int) ([]Enrollment, error) {
	rows, err := DB.Query(`
		SELECT e.id, e.student_id, e.course_id, e.enrolled_at, c.name as course_name, c.code as course_code
		FROM enrollments e
		JOIN courses c ON e.course_id = c.id
		WHERE e.student_id = ?
		ORDER BY e.enrolled_at DESC
	`, studentID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var enrollments []Enrollment
	for rows.Next() {
		var enrollment Enrollment
		var courseName, courseCode string
		err := rows.Scan(&enrollment.ID, &enrollment.StudentID, &enrollment.CourseID, &enrollment.EnrolledAt, &courseName, &courseCode)
		if err != nil {
			return nil, err
		}
		enrollments = append(enrollments, enrollment)
	}

	return enrollments, nil
}
