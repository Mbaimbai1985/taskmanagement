# TaskManager Backend - Spring Boot API

A robust Spring Boot backend for the TaskManager application, featuring JWT authentication, role-based access control, real-time WebSocket communication, and comprehensive task management capabilities.

##  Quick Start

### Prerequisites
- **Java 17+** (OpenJDK or Oracle JDK)
- **Maven 3.6+**
- **IDE**: IntelliJ IDEA, Eclipse, or VS Code

### Installation & Setup
```bash
# Clone the repository
git clone <repository-url>
cd task-management-system/backend

# Install dependencies
mvn clean install

# Run the application
mvn spring-boot:run
```

**Backend URL**: `http://localhost:8080`

### Alternative Run Methods
```bash
# Using Maven wrapper
./mvnw spring-boot:run

# Build and run JAR
mvn clean package
java -jar target/taskmanager-0.0.1-SNAPSHOT.jar

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

##  Architecture

### Project Structure
```
backend/
├── src/main/java/com/davymbaimbai/
│   ├── config/                 # Configuration classes
│   │   ├── CorsConfig.java    # CORS configuration
│   │   ├── DataSeeder.java    # Sample data seeding
│   │   ├── JwtAuthenticationEntryPoint.java
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── SecurityConfig.java # Security configuration
│   │   └── WebSocketConfig.java # WebSocket configuration
│   ├── controller/             # REST API endpoints
│   │   ├── AuthController.java
│   │   ├── TaskController.java
│   │   └── UserController.java
│   ├── dto/                   # Data Transfer Objects
│   │   ├── CommentRequest.java
│   │   ├── CommentResponse.java
│   │   ├── LoginRequest.java
│   │   ├── Response.java
│   │   ├── TaskActivityDto.java
│   │   ├── TaskRequest.java
│   │   └── UserRequest.java
│   ├── entity/                # JPA Entities
│   │   ├── Task.java
│   │   ├── TaskActivity.java
│   │   ├── TaskComment.java
│   │   └── User.java
│   ├── enums/                 # Enumerations
│   │   ├── ActivityType.java
│   │   ├── Priority.java
│   │   ├── Role.java
│   │   └── TaskStatus.java
│   ├── exceptions/            # Custom exceptions
│   │   ├── BadRequestException.java
│   │   ├── GlobalExceptionHandler.java
│   │   └── NotFoundException.java
│   ├── repository/            # Data access layer
│   │   ├── TaskActivityRepository.java
│   │   ├── TaskCommentRepository.java
│   │   ├── TaskRepository.java
│   │   └── UserRepository.java
│   ├── service/               # Business logic layer
│   │   ├── impl/             # Service implementations
│   │   ├── TaskCommentService.java
│   │   ├── TaskService.java
│   │   ├── UserService.java
│   │   └── WebSocketService.java
│   ├── utils/                 # Utility classes
│   │   └── JwtUtils.java
│   └── TaskmanagerApplication.java # Main application class
├── src/test/java/             # Unit tests
│   └── com/davymbaimbai/
│       ├── service/
│       └── repository/
└── src/main/resources/
    ├── application.properties # Application configuration
    └── application-dev.properties # Development configuration
```

##  Technologies & Dependencies

### Core Technologies
- **Spring Boot 3.2.0** - Application framework
- **Spring Security 6.x** - Authentication & Authorization
- **Spring Data JPA** - Database operations
- **Spring WebSocket** - Real-time communication
- **H2 Database** - In-memory database (development)

### Key Dependencies
```xml
<!-- Core Spring Boot -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Security & JWT -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
</dependency>

<!-- Database -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
</dependency>

<!-- WebSocket -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

##  Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    creator_id BIGINT NOT NULL,
    assignee_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
);
```

### Task Comments Table
```sql
CREATE TABLE task_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

##  Security Configuration

### JWT Authentication
- **Algorithm**: HS256
- **Token Expiration**: 24 hours
- **Secret Key**: Configurable via environment variables

### Password Security
- **Hashing**: BCrypt with strength 12
- **Validation**: Minimum 6 characters

### CORS Configuration
```java
@CrossOrigin(origins = "http://localhost:3000")
// Allows requests from React frontend
```

### Role-Based Access Control
- **ADMIN**: Full access to all resources
- **USER**: Limited access based on ownership

## 📡 API Documentation

### Base URL
```
http://localhost:8080/api
```

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

**Success Response (200):**
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

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "Email already exists",
  "data": null
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

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "username": "admin",
    "role": "ADMIN"
  }
}
```

### Task Management Endpoints

#### Get All Tasks
```http
GET /api/tasks?status=TODO&assignee=2
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `status` (optional): TODO, IN_PROGRESS, DONE
- `assignee` (optional): User ID

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Implement authentication",
      "description": "Add JWT authentication to the application",
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
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00"
    }
  ]
}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "title": "Fix login bug",
  "description": "Resolve authentication issue on mobile devices",
  "status": "TODO",
  "priority": "HIGH",
  "assigneeId": 2
}
```

#### Update Task
```http
PUT /api/tasks/{taskId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "id": 1,
  "title": "Updated task title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM",
  "assigneeId": 3
}
```

#### Delete Task
```http
DELETE /api/tasks/{taskId}
Authorization: Bearer {jwt_token}
```

### Comment Management Endpoints

#### Get Task Comments
```http
GET /api/tasks/{taskId}/comments
Authorization: Bearer {jwt_token}
```

#### Add Comment
```http
POST /api/tasks/{taskId}/comments
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "comment": "This task is now complete"
}
```

#### Update Comment
```http
PUT /api/tasks/comments/{commentId}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "comment": "Updated comment text"
}
```

#### Delete Comment
```http
DELETE /api/tasks/comments/{commentId}
Authorization: Bearer {jwt_token}
```

### User Management Endpoints

#### Get All Users
```http
GET /api/users
Authorization: Bearer {jwt_token}
```

#### Get Current User
```http
GET /api/users/current
Authorization: Bearer {jwt_token}
```

##  WebSocket Configuration

### Connection
```javascript
// Frontend connection
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);
```

### Topics
- `/topic/tasks` - Task updates
- `/topic/tasks/{taskId}/comments` - Comment updates

### Message Format
```json
{
  "taskId": 1,
  "action": "TASK_UPDATED",
  "username": "admin",
  "timestamp": "2024-01-15T14:30:00",
  "taskTitle": "Task title"
}
```

##  Testing

### Running Tests
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=TaskServiceTest

# Run with coverage
mvn test jacoco:report
```

### Test Structure
```
src/test/java/
├── service/
│   ├── TaskServiceTest.java
│   ├── UserServiceTest.java
│   └── TaskCommentServiceTest.java
└── repository/
    ├── TaskRepositoryTest.java
    └── UserRepositoryTest.java
```

### Sample Test
```java
@SpringBootTest
class TaskServiceTest {
    
    @Mock
    private TaskRepository taskRepository;
    
    @InjectMocks
    private TasksServiceImpl taskService;
    
    @Test
    void testCreateTask() {
        // Test implementation
    }
}
```

##  Configuration

### Application Properties
```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:h2:mem:testdb
spring.h2.console.enabled=true

# JPA Configuration
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# JWT Configuration
jwt.secret=mySecretKey
jwt.expiration=86400000

# CORS Configuration
cors.allowed-origins=http://localhost:3000
```

### Environment Variables
```bash
# Production configuration
export JWT_SECRET=your-super-secret-key
export DB_URL=jdbc:postgresql://localhost:5432/taskmanager
export DB_USERNAME=username
export DB_PASSWORD=password
```

##  Deployment

### Development
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Production Build
```bash
mvn clean package -Dmaven.test.skip=true
java -jar target/taskmanager-0.0.1-SNAPSHOT.jar
```

### Docker (Optional)
```dockerfile
FROM openjdk:17-jre-slim
COPY target/taskmanager-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

##  Performance Considerations

### Database Optimization
- JPA lazy loading for relationships
- Proper indexing on foreign keys
- Connection pooling with HikariCP

### Security Best Practices
- Password hashing with BCrypt
- JWT secret key management
- Input validation and sanitization
- CORS configuration

### Monitoring
- Actuator endpoints for health checks
- Logging configuration
- Error tracking and handling

##  Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080
# Kill the process
kill -9 <PID>
```

#### Database Connection Issues
- Verify H2 console at `http://localhost:8080/h2-console`
- Check JDBC URL: `jdbc:h2:mem:testdb`

#### JWT Token Issues
- Verify token format and expiration
- Check JWT secret configuration

### Logging
```properties
# Enable debug logging
logging.level.com.davymbaimbai=DEBUG
logging.level.org.springframework.security=DEBUG
```

##  Future Enhancements

- [ ] PostgreSQL production database
- [ ] Redis caching layer
- [ ] API rate limiting
- [ ] Comprehensive integration tests
- [ ] API documentation with OpenAPI/Swagger
- [ ] Metrics and monitoring with Micrometer
- [ ] Docker containerization
- [ ] CI/CD pipeline configuration

##  Contributing

1. Follow Spring Boot best practices
2. Write unit tests for new features
3. Use proper exception handling
4. Document API changes
5. Follow Java naming conventions

---

**TaskManager Backend** - Powering efficient task management with robust Spring Boot architecture! 
