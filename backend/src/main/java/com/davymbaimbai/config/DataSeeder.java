package com.davymbaimbai.config;

import com.davymbaimbai.entity.Task;
import com.davymbaimbai.entity.TaskComment;
import com.davymbaimbai.entity.User;
import com.davymbaimbai.enums.Priority;
import com.davymbaimbai.enums.Role;
import com.davymbaimbai.enums.TaskStatus;
import com.davymbaimbai.repository.TaskCommentRepository;
import com.davymbaimbai.repository.TaskRepository;
import com.davymbaimbai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final TaskCommentRepository taskCommentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data seeding...");
        if (userRepository.count() > 0) {
            log.info("Data already exists, skipping seeding");
            return;
        }

        seedUsers();
        seedTasks();
        seedComments();

        log.info("Data seeding completed successfully!");
    }

    private void seedUsers() {
        log.info("Seeding users...");
        User admin = User.builder()
                .username("admin")
                .email("admin@example.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .build();
        User user = User.builder()
                .username("user")
                .email("user@example.com")
                .password(passwordEncoder.encode("user123"))
                .role(Role.USER)
                .build();
        User alice = User.builder()
                .username("alice")
                .email("alice@example.com")
                .password(passwordEncoder.encode("alice123"))
                .role(Role.USER)
                .build();

        User bob = User.builder()
                .username("bob")
                .email("bob@example.com")
                .password(passwordEncoder.encode("bob123"))
                .role(Role.USER)
                .build();

        userRepository.saveAll(Arrays.asList(admin, user, alice, bob));
        log.info("Created {} users", 4);
    }

    private void seedTasks() {
        log.info("Seeding tasks...");

        List<User> users = userRepository.findAll();
        User admin = users.stream().filter(u -> u.getRole() == Role.ADMIN).findFirst().orElse(users.get(0));
        User user1 = users.stream().filter(u -> "user".equals(u.getUsername())).findFirst().orElse(users.get(1));
        User alice = users.stream().filter(u -> "alice".equals(u.getUsername())).findFirst().orElse(users.get(2));
        User bob = users.stream().filter(u -> "bob".equals(u.getUsername())).findFirst().orElse(users.get(3));
        Random random = new Random();
        LocalDateTime now = LocalDateTime.now();
        Task[] sampleTasks = {
            Task.builder()
                .title("Set up project infrastructure")
                .description("Initialize the project repository, set up CI/CD pipeline, and configure development environment")
                .status(TaskStatus.DONE)
                .priority(Priority.HIGH)
                .creator(admin)
                .assignee(admin)
                .user(admin) // for backward compatibility
                .createdAt(now.minusDays(10))
                .updatedAt(now.minusDays(8))
                .build(),

            Task.builder()
                .title("Design user authentication system")
                .description("Create wireframes and design mockups for login, registration, and user profile pages")
                .status(TaskStatus.IN_PROGRESS)
                .priority(Priority.HIGH)
                .creator(admin)
                .assignee(alice)
                .user(alice)
                .createdAt(now.minusDays(7))
                .updatedAt(now.minusDays(2))
                .build(),

            Task.builder()
                .title("Implement task management API")
                .description("Develop REST API endpoints for creating, reading, updating, and deleting tasks")
                .status(TaskStatus.DONE)
                .priority(Priority.HIGH)
                .creator(admin)
                .assignee(bob)
                .user(bob)
                .createdAt(now.minusDays(9))
                .updatedAt(now.minusDays(1))
                .build(),

            Task.builder()
                .title("Create responsive frontend layout")
                .description("Build responsive React components for task dashboard with mobile-first approach")
                .status(TaskStatus.IN_PROGRESS)
                .priority(Priority.MEDIUM)
                .creator(admin)
                .assignee(alice)
                .user(alice)
                .createdAt(now.minusDays(5))
                .updatedAt(now.minusDays(1))
                .build(),

            Task.builder()
                .title("Set up database schema")
                .description("Design and implement database tables for users, tasks, and related entities")
                .status(TaskStatus.DONE)
                .priority(Priority.HIGH)
                .creator(admin)
                .assignee(bob)
                .user(bob)
                .createdAt(now.minusDays(8))
                .updatedAt(now.minusDays(6))
                .build(),

            Task.builder()
                .title("Implement real-time notifications")
                .description("Add WebSocket support for real-time task updates and notifications")
                .status(TaskStatus.TODO)
                .priority(Priority.MEDIUM)
                .creator(admin)
                .assignee(user1)
                .user(user1)
                .createdAt(now.minusDays(3))
                .updatedAt(now.minusDays(3))
                .build(),

            Task.builder()
                .title("Write unit tests")
                .description("Create comprehensive unit tests for all service classes and controllers")
                .status(TaskStatus.TODO)
                .priority(Priority.MEDIUM)
                .creator(admin)
                .assignee(alice)
                .user(alice)
                .createdAt(now.minusDays(2))
                .updatedAt(now.minusDays(2))
                .build(),

            Task.builder()
                .title("Optimize database queries")
                .description("Review and optimize slow database queries, add proper indexes")
                .status(TaskStatus.TODO)
                .priority(Priority.LOW)
                .creator(user1)
                .assignee(bob)
                .user(bob)
                .createdAt(now.minusDays(1))
                .updatedAt(now.minusDays(1))
                .build(),

            Task.builder()
                .title("Create user documentation")
                .description("Write comprehensive user guide and API documentation")
                .status(TaskStatus.IN_PROGRESS)
                .priority(Priority.LOW)
                .creator(alice)
                .assignee(user1)
                .user(user1)
                .createdAt(now.minusDays(4))
                .updatedAt(now.minusHours(12))
                .build(),

            Task.builder()
                .title("Deploy to production")
                .description("Set up production environment and deploy the application")
                .status(TaskStatus.TODO)
                .priority(Priority.HIGH)
                .creator(admin)
                .assignee(admin)
                .user(admin)
                .createdAt(now.minusHours(6))
                .updatedAt(now.minusHours(6))
                .build()
        };

        taskRepository.saveAll(Arrays.asList(sampleTasks));
        log.info("Created {} tasks", sampleTasks.length);
    }

    private void seedComments() {
        log.info("Seeding comments...");

        List<User> users = userRepository.findAll();
        List<Task> tasks = taskRepository.findAll();
        
        User admin = users.stream().filter(u -> u.getRole() == Role.ADMIN).findFirst().orElse(users.get(0));
        User user1 = users.stream().filter(u -> "user".equals(u.getUsername())).findFirst().orElse(users.get(1));
        User alice = users.stream().filter(u -> "alice".equals(u.getUsername())).findFirst().orElse(users.get(2));
        User bob = users.stream().filter(u -> "bob".equals(u.getUsername())).findFirst().orElse(users.get(3));
        LocalDateTime now = LocalDateTime.now();
        if (!tasks.isEmpty()) {
            TaskComment[] sampleComments = {
                TaskComment.builder()
                    .task(tasks.get(0))
                    .user(admin)
                    .comment("Great work on setting up the infrastructure! The CI/CD pipeline is working perfectly.")
                    .createdAt(now.minusDays(8))
                    .updatedAt(now.minusDays(8))
                    .build(),

                TaskComment.builder()
                    .task(tasks.get(1))
                    .user(alice)
                    .comment("I'm working on the authentication mockups. Should have the first draft ready by tomorrow.")
                    .createdAt(now.minusDays(2))
                    .updatedAt(now.minusDays(2))
                    .build(),

                TaskComment.builder()
                    .task(tasks.get(1))
                    .user(admin)
                    .comment("Looks good! Make sure to include 2FA in the design.")
                    .createdAt(now.minusDays(1))
                    .updatedAt(now.minusDays(1))
                    .build(),

                TaskComment.builder()
                    .task(tasks.get(2))
                    .user(bob)
                    .comment("API implementation is complete. All endpoints are tested and documented.")
                    .createdAt(now.minusDays(1))
                    .updatedAt(now.minusDays(1))
                    .build(),

                TaskComment.builder()
                    .task(tasks.get(3))
                    .user(alice)
                    .comment("Working on mobile responsiveness. The dashboard looks great on tablets now!")
                    .createdAt(now.minusHours(12))
                    .updatedAt(now.minusHours(12))
                    .build(),

                TaskComment.builder()
                    .task(tasks.get(4))
                    .user(bob)
                    .comment("Database schema is finalized. Added proper indexes for better performance.")
                    .createdAt(now.minusDays(6))
                    .updatedAt(now.minusDays(6))
                    .build(),

                TaskComment.builder()
                    .task(tasks.get(5))
                    .user(user1)
                    .comment("I'll start working on this next week after finishing the documentation.")
                    .createdAt(now.minusDays(1))
                    .updatedAt(now.minusDays(1))
                    .build(),

                TaskComment.builder()
                    .task(tasks.get(8))
                    .user(user1)
                    .comment("Documentation is about 70% complete. Focusing on the API reference section now.")
                    .createdAt(now.minusHours(12))
                    .updatedAt(now.minusHours(12))
                    .build(),

                TaskComment.builder()
                    .task(tasks.get(8))
                    .user(alice)
                    .comment("Thanks! Let me know if you need help with the screenshots for the user guide.")
                    .createdAt(now.minusHours(6))
                    .updatedAt(now.minusHours(6))
                    .build(),

                TaskComment.builder()
                    .task(tasks.get(9))
                    .user(admin)
                    .comment("Production environment is almost ready. We'll deploy as soon as testing is complete.")
                    .createdAt(now.minusHours(3))
                    .updatedAt(now.minusHours(3))
                    .build()
            };

            taskCommentRepository.saveAll(Arrays.asList(sampleComments));
            log.info("Created {} comments", sampleComments.length);
        }
    }
}