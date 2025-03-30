# Student_Management_System

A Flask-based RESTful API for managing student records with full CRUD functionality.

## Features

- **CRUD Operations**:
  - Create new student records
  - Read all/single student records
  - Update existing records
  - Delete records
- **Database**: SQLite with SQLAlchemy ORM
- **RESTful Design**: Proper HTTP methods and status codes
- **Validation**: Server-side data validation
- **Frontend**: Simple HTML/JS interface

## API Endpoints

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| GET    | `/students`      | Get all students        |
| GET    | `/students/<id>` | Get single student      |
| POST   | `/students`      | Create new student      |
| PUT    | `/students/<id>` | Update existing student |
| DELETE | `/students/<id>` | Delete student          |

## Request/Response Examples

**Create Student (POST /students)**

````json
Request:
{
  "first_name": "John",
  "last_name": "Doe",
  "dob": "2000-01-15",
  "amount_due": 250.50
}

Response (201 Created):
{
  "success": true,
  "data": {
    "student_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "dob": "2000-01-15",
    "amount_due": 250.5
  }
}

**Get All Students (GET /students)**
```json
Response (200 OK):
{
  "success": true,
  "data": [
    {
      "student_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "dob": "2000-01-15",
      "amount_due": 250.5
    }
  ],
  "count": 1
}

## Setup Instructions
1. Clone the repository:
```bash
git clone https://github.com/Moged/student-management-system.git
cd student-management-system

2. Install dependencies:
```bash
pip install flask flask-sqlalchemy

3. Run the application:
```bash
python app.py

4. Access the application:
API: http://localhost:5000/students

Web Interface: http://localhost:5000
````
