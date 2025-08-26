package com.davymbaimbai.config;

import com.davymbaimbai.entity.Task;
import com.davymbaimbai.entity.User;
import com.davymbaimbai.enums.Priority;
import com.davymbaimbai.enums.Role;
import com.davymbaimbai.enums.TaskStatus;
import com.davymbaimbai.repository.TaskRepository;
import com.davymbaimbai.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initializeData() {
        if (userRepository.count() == 0) {
            log.info("Initializing sample data...");
            User admin = createUser("admin", "admin@example.com", "password", Role.ADMIN);
            User user1 = createUser("john_doe", "user@example.com", "password", Role.USER);
            User user2 = createUser("jane_smith", "jane@example.com", "password", Role.USER);
            User user3 = createUser("bob_wilson", "bob@example.com", "password", Role.USER);
            List<User> users = userRepository.saveAll(List.of(admin, user1, user2, user3));
            log.info("Created {} users", users.size());
            createSampleTasks(users);
            log.info("Sample data initialization completed");
        } else {
            log.info("Data already exists, skipping initialization");
        }
    }

    private User createUser(String username, String email, String password, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }

    private void createSampleTasks(List<User> users) {
        User admin = users.get(0);
        User user1 = users.get(1);
        User user2 = users.get(2);
        User user3 = users.get(3);
        Task task1 = createTask(
            "Setup CI/CD Pipeline",
            "Configure continuous integration and deployment pipeline for the project",
            TaskStatus.TODO,
            Priority.HIGH,
            admin,
            user1,
            LocalDateTime.now().minusDays(5)
        );

        Task task2 = createTask(
            "Design User Dashboard",
            "Create wireframes and mockups for the main user dashboard interface",
            TaskStatus.IN_PROGRESS,
            Priority.MEDIUM,
            admin,
            user2,
            LocalDateTime.now().minusDays(4)
        );

        Task task3 = createTask(
            "Implement Authentication",
            "Develop JWT-based authentication system with role management",
            TaskStatus.DONE,
            Priority.HIGH,
            user1,
            user1,
            LocalDateTime.now().minusDays(7)
        );

        Task task4 = createTask(
            "Write API Documentation",
            "Create comprehensive API documentation using Swagger/OpenAPI",
            TaskStatus.TODO,
            Priority.MEDIUM,
            user1,
            user3,
            LocalDateTime.now().minusDays(3)
        );

        Task task5 = createTask(
            "Database Optimization",
            "Optimize database queries and add proper indexing",
            TaskStatus.IN_PROGRESS,
            Priority.HIGH,
            user2,
            user2,
            LocalDateTime.now().minusDays(2)
        );

        Task task6 = createTask(
            "Unit Test Coverage",
            "Increase unit test coverage to at least 80%",
            TaskStatus.TODO,
            Priority.MEDIUM,
            user2,
            user1,
            LocalDateTime.now().minusDays(1)
        );

        Task task7 = createTask(
            "Bug Fix: Login Issues",
            "Fix intermittent login failures on mobile devices",
            TaskStatus.DONE,
            Priority.HIGH,
            user3,
            user3,
            LocalDateTime.now().minusDays(6)
        );

        Task task8 = createTask(
            "Performance Monitoring",
            "Implement application performance monitoring and alerting",
            TaskStatus.TODO,
            Priority.LOW,
            admin,
            null,
            LocalDateTime.now().minusDays(2)
        );

        Task task9 = createTask(
            "User Feedback System",
            "Create a system for collecting and managing user feedback",
            TaskStatus.IN_PROGRESS,
            Priority.MEDIUM,
            user3,
            user2,
            LocalDateTime.now().minusDays(1)
        );

        Task task10 = createTask(
            "Security Audit",
            "Conduct comprehensive security audit of the application",
            TaskStatus.TODO,
            Priority.HIGH,
            admin,
            user1,
            LocalDateTime.now()
        );

        List<Task> tasks = taskRepository.saveAll(List.of(
            task1, task2, task3, task4, task5, task6, task7, task8, task9, task10
        ));
        
        log.info("Created {} sample tasks", tasks.size());
    }

    private Task createTask(String title, String description, TaskStatus status, 
                           Priority priority, User creator, User assignee, LocalDateTime createdAt) {
        return Task.builder()
                .title(title)
                .description(description)
                .status(status)
                .priority(priority)
                .creator(creator)
                .assignee(assignee)
                .user(creator)
                .createdAt(createdAt)
                .updatedAt(createdAt)
                .build();
    }
}