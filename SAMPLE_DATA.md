# TaskManager App - Sample Data

This document describes the sample data that is automatically seeded when you start the application for the first time.

##   Sample Users & Login Credentials

### Admin User
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: ADMIN
- **Permissions**: Full access - can create, edit, delete tasks, manage users

### Regular Users
- **Email**: `user@example.com` | **Password**: `user123` | **Role**: USER
- **Email**: `alice@example.com` | **Password**: `alice123` | **Role**: USER  
- **Email**: `bob@example.com` | **Password**: `bob123` | **Role**: USER

**User Permissions**: Can view tasks, comment, and move task status (TODO ↔ IN_PROGRESS ↔ DONE)

##  Sample Tasks

The application comes pre-loaded with **10 realistic tasks** representing a software development project:

### Completed Tasks (DONE)
1. **Set up project infrastructure** - *High Priority*
   - Assigned to: admin
   - Description: Initialize repository, CI/CD pipeline, development environment

2. **Implement task management API** - *High Priority*  
   - Assigned to: bob
   - Description: REST API endpoints for CRUD operations

3. **Set up database schema** - *High Priority*
   - Assigned to: bob  
   - Description: Database tables for users, tasks, and related entities

### In Progress Tasks (IN_PROGRESS)
4. **Design user authentication system** - *High Priority*
   - Assigned to: alice
   - Description: Wireframes and mockups for login/registration

5. **Create responsive frontend layout** - *Medium Priority*
   - Assigned to: alice
   - Description: React components with mobile-first approach

6. **Create user documentation** - *Low Priority*
   - Assigned to: user
   - Description: User guide and API documentation

### Pending Tasks (TODO)
7. **Implement real-time notifications** - *Medium Priority*
   - Assigned to: user
   - Description: WebSocket support for real-time updates

8. **Write unit tests** - *Medium Priority*
   - Assigned to: alice
   - Description: Comprehensive unit tests for services and controllers

9. **Optimize database queries** - *Low Priority*
   - Assigned to: bob
   - Description: Review and optimize slow queries, add indexes

10. **Deploy to production** - *High Priority*
    - Assigned to: admin
    - Description: Production environment setup and deployment

##  Sample Comments

Each task includes realistic comments showing collaboration between team members:
- Progress updates
- Technical discussions  
- Coordination between team members
- Completion confirmations

##  Testing Scenarios

With this sample data, you can test:

### As Admin (`admin@example.com`)
- View all tasks across all users
- Create new tasks and assign to any user
- Edit and delete any task
- Edit and delete any comment
- Full administrative capabilities

### As Regular User (`user@example.com`, `alice@example.com`, `bob@example.com`)  
- View tasks assigned to you
- Comment on tasks
- Move task status between TODO ↔ IN_PROGRESS ↔ DONE
- Edit/delete only your own comments
- Limited user capabilities

##  Data Reset

To reset the sample data:
1. Stop the application
2. Delete the database file (if using H2) or clear the database
3. Restart the application - sample data will be automatically recreated

##  Getting Started

1. Start the application
2. Navigate to the login page
3. Use any of the sample credentials above
4. Explore the pre-loaded tasks and comments
5. Test the real-time features by logging in as different users in multiple browser windows

The sample data provides a realistic scenario for testing all application features including role-based permissions, task management, commenting, and real-time updates!