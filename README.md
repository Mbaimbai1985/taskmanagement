# TaskManager App - Full-Stack Task Management System

A comprehensive task management application built with **React** frontend and **Spring Boot** backend, featuring real-time updates, role-based permissions, and modern UI/UX.

##  Features

### Core Functionality
- **JWT Authentication** - Secure login/register with role-based access
- **Task Management** - Complete CRUD operations with status transitions
- **Real-time Updates** - WebSocket integration for live task updates
- **Comment System** - Full comment CRUD with permissions
- **Role-based Permissions** - Admin and User roles with different capabilities
- **Responsive Design** - Mobile-first modern UI

### Advanced Features
- **WebSocket Communication** - Real-time task and comment updates
- **Drag & Drop** - Modern task status management
- **Sample Data Seeding** - Automatic realistic test data
- **Professional UI** - Modern styling with animations
- **Comprehensive API** - RESTful endpoints with proper validation

##  Architecture

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.x
- **Security**: Spring Security with JWT
- **Database**: H2 (in-memory) / PostgreSQL
- **Real-time**: WebSocket with STOMP
- **Build**: Maven

### Frontend (React)
- **Framework**: React 18+ with Hooks
- **Routing**: React Router v6
- **State**: Context API + useState
- **HTTP**: Axios
- **Styling**: Custom CSS with modern design

##  Project Structure

```
task-management-system/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/         # Main application code
│   ├── src/test/java/         # Unit tests
│   ├── pom.xml                # Maven dependencies
│   └── README.md              # Backend documentation
├── frontend/                   # React Frontend
│   ├── src/                   # Frontend source code
│   ├── package.json           # NPM dependencies
│   └── README.md              # Frontend documentation
├── README.md                  # This file
└── SAMPLE_DATA.md            # Sample data documentation
```

##  Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- Maven 3.6+

### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Backend runs on: `http://localhost:8080`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on: `http://localhost:3000`

##  Sample Credentials

### Admin Access
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Regular Users
- **Email**: `user@example.com` | **Password**: `user123`
- **Email**: `alice@example.com` | **Password**: `alice123`
- **Email**: `bob@example.com` | **Password**: `bob123`

##  API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "User registered successfully",
  "data": {
    "id": 5,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2024-01-15T10:30:00"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTcwNTMxNDYwMCwiZXhwIjoxNzA1NDAxMDAwfQ.signature",
    "username": "admin",
    "role": "ADMIN"
  }
}
```

### Task Management Endpoints

#### Get All Tasks (with filters)
```http
GET /api/tasks?status=TODO&assignee=2
Authorization: Bearer {token}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Implement real-time notifications",
      "description": "Add WebSocket support for real-time task updates and notifications",
      "status": "TODO",
      "priority": "MEDIUM",
      "creator": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "ADMIN"
      },
      "assignee": {
        "id": 2,
        "username": "user",
        "email": "user@example.com",
        "role": "USER"
      },
      "createdAt": "2024-01-12T10:30:00",
      "updatedAt": "2024-01-12T10:30:00"
    }
  ]
}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Fix login bug",
  "description": "Resolve authentication issue on mobile devices",
  "status": "TODO",
  "priority": "HIGH",
  "assigneeId": 2
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Task Created Successfully",
  "data": {
    "id": 11,
    "title": "Fix login bug",
    "description": "Resolve authentication issue on mobile devices",
    "status": "TODO",
    "priority": "HIGH",
    "creator": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "assignee": {
      "id": 2,
      "username": "user",
      "email": "user@example.com",
      "role": "USER"
    },
    "createdAt": "2024-01-15T14:20:00",
    "updatedAt": "2024-01-15T14:20:00"
  }
}
```

#### Update Task
```http
PUT /api/tasks/11
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": 11,
  "title": "Fix login bug",
  "description": "Resolve authentication issue on mobile and desktop",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "assigneeId": 2
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Task updated successfully",
  "data": {
    "id": 11,
    "title": "Fix login bug",
    "description": "Resolve authentication issue on mobile and desktop",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "creator": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "assignee": {
      "id": 2,
      "username": "user",
      "email": "user@example.com",
      "role": "USER"
    },
    "createdAt": "2025-01-15T14:20:00",
    "updatedAt": "2025-01-15T14:25:00"
  }
}
```

#### Delete Task
```http
DELETE /api/tasks/11
Authorization: Bearer {token}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "task deleted successfully",
  "data": null
}
```

#### Get Task by ID
```http
GET /api/tasks/1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Task retrieved successfully",
  "data": {
    "id": 1,
    "title": "Set up project infrastructure",
    "description": "Initialize the project repository, set up CI/CD pipeline, and configure development environment",
    "status": "DONE",
    "priority": "HIGH",
    "creator": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "assignee": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "createdAt": "2024-01-05T10:30:00",
    "updatedAt": "2024-01-07T16:45:00"
  }
}
```

### User Management Endpoints

#### Get All Users
```http
GET /api/users
Authorization: Bearer {token}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "ADMIN",
      "createdAt": "2024-01-01T00:00:00"
    },
    {
      "id": 2,
      "username": "user",
      "email": "user@example.com",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00"
    }
  ]
}
```

#### Get Current User
```http
GET /api/users/current
Authorization: Bearer {token}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "ADMIN",
    "createdAt": "2024-01-01T00:00:00"
  }
}
```

### Comment Management Endpoints

#### Get Task Comments
```http
GET /api/tasks/1/comments
Authorization: Bearer {token}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Comments retrieved successfully",
  "data": [
    {
      "id": 1,
      "comment": "Great work on setting up the infrastructure! The CI/CD pipeline is working perfectly.",
      "username": "admin",
      "createdAt": "2024-01-07T10:30:00",
      "updatedAt": "2024-01-07T10:30:00"
    },
    {
      "id": 2,
      "comment": "Thanks! The development environment is now fully configured.",
      "username": "user",
      "createdAt": "2024-01-07T11:15:00",
      "updatedAt": "2024-01-07T11:15:00"
    }
  ]
}
```

#### Add Comment
```http
POST /api/tasks/1/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "comment": "I've started working on the next phase of the project."
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Comment added successfully",
  "data": {
    "id": 3,
    "comment": "I've started working on the next phase of the project.",
    "username": "user",
    "createdAt": "2024-01-15T14:30:00",
    "updatedAt": "2024-01-15T14:30:00"
  }
}
```

#### Update Comment
```http
PUT /api/tasks/comments/3
Authorization: Bearer {token}
Content-Type: application/json

{
  "comment": "I've started working on the next phase of the project. ETA is next week."
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Comment updated successfully",
  "data": {
    "id": 3,
    "comment": "I've started working on the next phase of the project. ETA is next week.",
    "username": "user",
    "createdAt": "2024-01-15T14:30:00",
    "updatedAt": "2024-01-15T14:35:00"
  }
}
```

#### Delete Comment
```http
DELETE /api/tasks/comments/3
Authorization: Bearer {token}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Comment deleted successfully",
  "data": null
}
```

## 🔌 WebSocket Endpoints

### Task Updates
- **Topic**: `/topic/tasks`
- **Description**: Real-time task creation, updates, and deletions

**Message Format:**
```json
{
  "taskId": 1,
  "action": "TASK_UPDATED",
  "username": "admin",
  "timestamp": "2024-01-15T14:30:00",
  "taskTitle": "Set up project infrastructure",
  "oldStatus": "IN_PROGRESS",
  "newStatus": "DONE"
}
```

### Comment Updates
- **Topic**: `/topic/tasks/{taskId}/comments`
- **Description**: Real-time comment additions, updates, and deletions

**Message Format:**
```json
{
  "taskId": 1,
  "action": "COMMENT_ADDED",
  "username": "user",
  "comment": "Great progress on this task!",
  "timestamp": "2024-01-15T14:30:00"
}
```

##  Technologies Used

### Backend
- **Spring Boot 3.x** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **H2 Database** - In-memory database
- **JWT** - Token-based authentication
- **WebSocket** - Real-time communication
- **Maven** - Build management

### Frontend
- **React 18+** - UI framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **WebSocket** - Real-time updates
- **Custom CSS** - Modern styling
- **React Hooks** - State management

##  Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - BCrypt encryption
- **Role-based Authorization** - ADMIN/USER permissions
- **CORS Configuration** - Cross-origin request handling
- **Input Validation** - Bean validation and frontend validation
- **SQL Injection Protection** - JPA parameterized queries

##  Testing

### Backend Tests
- Unit tests for service layer
- Integration tests for repositories
- Security configuration tests

### Frontend Testing
- Component testing capabilities
- API integration testing
- User interaction testing

##  Performance Features

- **Optimistic Updates** - Better UX with immediate feedback
- **Lazy Loading** - Efficient component loading
- **Connection Pooling** - Database optimization
- **Caching** - JWT token caching
- **Responsive Design** - Mobile-optimized performance

##  Deployment

### Development
```bash
# Backend
cd backend && mvn spring-boot:run

# Frontend
cd frontend && npm start
```

### Production Ready
- Environment-specific configurations
- Docker containerization ready
- Database migration support
- Logging configuration

##  Future Enhancements

- [ ] Task attachments and file uploads
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Task templates
- [ ] Time tracking
- [ ] Reporting and analytics
- [ ] Mobile app (React Native)

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

##  Team

Built for the love of code by David Mbaimbai.

---

**TaskManager App** - Making task management simple, efficient, and collaborative! 🚀
