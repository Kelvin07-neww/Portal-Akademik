# Portal Akademik Backend

Backend untuk Portal Akademik menggunakan Go, MySQL, dan JWT.

## Setup

1. Pastikan Go dan MySQL sudah terinstall.
2. Buat database di MySQL menggunakan script `schema.sql`.
3. Update file `.env` dengan kredensial MySQL Anda.
4. Jalankan backend: `go run .`

## API Endpoints

- POST /api/login: Login dengan email dan password, return JWT token.

## Default User

- Email: admin@gmail.com
- Password: admin123
