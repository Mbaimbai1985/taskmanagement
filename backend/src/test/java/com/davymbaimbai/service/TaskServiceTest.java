package com.davymbaimbai.service;

import com.davymbaimbai.dto.Response;
import com.davymbaimbai.dto.TaskRequest;
import com.davymbaimbai.entity.Task;
import com.davymbaimbai.entity.User;
import com.davymbaimbai.enums.Priority;
import com.davymbaimbai.enums.Role;
import com.davymbaimbai.enums.TaskStatus;
import com.davymbaimbai.repository.TaskRepository;
import com.davymbaimbai.repository.UserRepository;
import com.davymbaimbai.service.impl.TasksServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private TasksServiceImpl taskService;

    private User testUser;
    private User assigneeUser;
    private Task testTask;
    private TaskRequest taskRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setRole(Role.USER);
        testUser.setCreatedAt(LocalDateTime.now());

        assigneeUser = new User();
        assigneeUser.setId(2L);
        assigneeUser.setUsername("assignee");
        assigneeUser.setEmail("assignee@example.com");
        assigneeUser.setRole(Role.USER);
        assigneeUser.setCreatedAt(LocalDateTime.now());

        testTask = Task.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .status(TaskStatus.TODO)
                .priority(Priority.MEDIUM)
                .creator(testUser)
                .user(testUser)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        taskRequest = new TaskRequest();
        taskRequest.setTitle("Test Task");
        taskRequest.setDescription("Test Description");
        taskRequest.setStatus(TaskStatus.TODO);
        taskRequest.setPriority(Priority.MEDIUM);
    }

    @Test
    void createTask_Success() {
        when(userService.getCurrentLoggedInUser()).thenReturn(testUser);
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);
        Response<Task> response = taskService.createTask(taskRequest);
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertEquals("Task Created Successfully", response.getMessage());
        assertNotNull(response.getData());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void createTask_WithAssignee_Success() {
        taskRequest.setAssigneeId(2L);
        when(userService.getCurrentLoggedInUser()).thenReturn(testUser);
        when(userRepository.findById(2L)).thenReturn(Optional.of(assigneeUser));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);
        Response<Task> response = taskService.createTask(taskRequest);
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        verify(userRepository, times(1)).findById(2L);
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void getAllMyTasks_Success() {
        List<Task> tasks = Arrays.asList(testTask);
        when(userService.getCurrentLoggedInUser()).thenReturn(testUser);
        when(taskRepository.findByUser(eq(testUser), any(Sort.class))).thenReturn(tasks);
        Response<List<Task>> response = taskService.getAllMyTasks();
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertEquals("Tasks retrieved successfully", response.getMessage());
        assertEquals(1, response.getData().size());
        verify(taskRepository, times(1)).findByUser(eq(testUser), any(Sort.class));
    }

    @Test
    void updateTask_Success() {
        // Arrange
        taskRequest.setId(1L);
        taskRequest.setTitle("Updated Task");
        testTask.setCreator(testUser);
        
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(userService.getCurrentLoggedInUser()).thenReturn(testUser);
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // Act
        Response<Task> response = taskService.updateTask(taskRequest);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertEquals("Task updated successfully", response.getMessage());
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void deleteTask_Success() {
        // Arrange
        when(taskRepository.existsById(1L)).thenReturn(true);

        // Act
        Response<Void> response = taskService.deleteTask(1L);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertEquals("task deleted successfully", response.getMessage());
        verify(taskRepository, times(1)).existsById(1L);
        verify(taskRepository, times(1)).deleteById(1L);
    }

    @Test
    void getTasksWithFilters_Success() {
        // Arrange
        List<Task> tasks = Arrays.asList(testTask);
        when(userService.getCurrentLoggedInUser()).thenReturn(testUser);
        when(taskRepository.findTasksWithFilters(eq(TaskStatus.TODO), isNull(), eq(testUser), any(Sort.class)))
                .thenReturn(tasks);

        // Act
        Response<List<Task>> response = taskService.getTasksWithFilters("TODO", null);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertEquals("Tasks filtered successfully", response.getMessage());
        assertEquals(1, response.getData().size());
        verify(taskRepository, times(1)).findTasksWithFilters(eq(TaskStatus.TODO), isNull(), eq(testUser), any(Sort.class));
    }
}