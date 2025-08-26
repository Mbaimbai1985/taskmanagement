package com.davymbaimbai.service.impl;
import com.davymbaimbai.dto.Response;
import com.davymbaimbai.dto.TaskRequest;
import com.davymbaimbai.entity.Task;
import com.davymbaimbai.entity.User;
import com.davymbaimbai.enums.Priority;
import com.davymbaimbai.enums.TaskStatus;
import com.davymbaimbai.exceptions.BadRequestException;
import com.davymbaimbai.exceptions.NotFoundException;
import com.davymbaimbai.repository.TaskRepository;
import com.davymbaimbai.repository.UserRepository;
import com.davymbaimbai.service.TaskService;
import com.davymbaimbai.service.TaskActivityService;
import com.davymbaimbai.service.UserService;
import com.davymbaimbai.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TasksServiceImpl implements TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final WebSocketService webSocketService;
    private final TaskActivityService taskActivityService;
    @Override
    public Response<Task> createTask(TaskRequest taskRequest) {
        log.info("INSIDE createTask()");
        User creator = userService.getCurrentLoggedInUser();
        
        // Convert completed boolean to TaskStatus for backward compatibility
        TaskStatus status = taskRequest.getStatus();
        if (status == null && taskRequest.getCompleted() != null) {
            status = taskRequest.getCompleted() ? TaskStatus.DONE : TaskStatus.TODO;
        }
        if (status == null) {
            status = TaskStatus.TODO; // Default status
        }
        
        // Find assignee if provided
        User assignee = null;
        if (taskRequest.getAssigneeId() != null) {
            assignee = userRepository.findById(taskRequest.getAssigneeId())
                    .orElseThrow(() -> new NotFoundException("Assignee not found"));
        }
        
        Task taskToSave = Task.builder()
                .title(taskRequest.getTitle())
                .description(taskRequest.getDescription())
                .status(status)
                .priority(taskRequest.getPriority())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .creator(creator)
                .assignee(assignee)
                .user(creator) // Keep for backward compatibility
                .build();
        Task savedTask = taskRepository.save(taskToSave);
        
        // Log task creation activity
        taskActivityService.logTaskCreated(savedTask.getId(), creator.getId());
        
        // Log assignment activity if task is assigned
        if (assignee != null) {
            taskActivityService.logTaskAssigned(savedTask.getId(), creator.getId(), assignee.getUsername());
        }
        
        // Broadcast task creation via WebSocket
        webSocketService.broadcastTaskUpdate(savedTask, "TASK_CREATED", creator.getUsername());
        
        return Response.<Task>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Task Created Successfully")
                .data(savedTask)
                .build();

    }

    @Override
    @Transactional
    public Response<List<Task>> getAllMyTasks() {
        log.info("inside getAllMyTasks()");
        User currentUser = userService.getCurrentLoggedInUser();
        List<Task> tasks = taskRepository.findByUser(currentUser, Sort.by(Sort.Direction.DESC, "id"));
        return Response.<List<Task>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Tasks retrieved successfully")
                .data(tasks)
                .build();
    }

    @Override
    public Response<Task> getTaskById(Long id) {
        log.info("inside getTaskById()");
        Task task = taskRepository.findById(id)
                .orElseThrow(()-> new NotFoundException("Tasks not found"));
        return Response.<Task>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Task retrieved successfully")
                .data(task)
                .build();
    }
    @Override
    public Response<Task> updateTask(TaskRequest taskRequest) {
        log.info("inside updateTask()");
        Task task = taskRepository.findById(taskRequest.getId())
                .orElseThrow(()-> new NotFoundException("Tasks not found"));
        
        User currentUser = userService.getCurrentLoggedInUser();
        
        // Check if user has permission to update (creator or assignee)
        if (!task.getCreator().getId().equals(currentUser.getId()) && 
            (task.getAssignee() == null || !task.getAssignee().getId().equals(currentUser.getId()))) {
            throw new BadRequestException("You don't have permission to update this task");
        }
        
        // Store original values for activity logging
        TaskStatus originalStatus = task.getStatus();
        Priority originalPriority = task.getPriority();
        User originalAssignee = task.getAssignee();
        
        if (taskRequest.getTitle() != null) task.setTitle(taskRequest.getTitle());
        if (taskRequest.getDescription() != null) task.setDescription(taskRequest.getDescription());
        
        // Handle status update with validation
        if (taskRequest.getStatus() != null) {
            // Allow setting the same status (no actual transition)
            if (task.getStatus() == taskRequest.getStatus() || task.getStatus().canTransitionTo(taskRequest.getStatus())) {
                task.setStatus(taskRequest.getStatus());
            } else {
                throw new BadRequestException("Invalid status transition from " + task.getStatus() + " to " + taskRequest.getStatus());
            }
        }
        
        // Handle backward compatibility with completed field
        if (taskRequest.getCompleted() != null) {
            TaskStatus newStatus = taskRequest.getCompleted() ? TaskStatus.DONE : TaskStatus.TODO;
            // Allow setting the same status (no actual transition)
            if (task.getStatus() == newStatus || task.getStatus().canTransitionTo(newStatus)) {
                task.setStatus(newStatus);
            }
        }
        
        if (taskRequest.getPriority() != null) task.setPriority(taskRequest.getPriority());
        
        // Handle assignee changes
        if (taskRequest.getAssigneeId() != null) {
            User assignee = userRepository.findById(taskRequest.getAssigneeId())
                    .orElseThrow(() -> new NotFoundException("Assignee not found"));
            task.setAssignee(assignee);
        }
        
        task.setUpdatedAt(LocalDateTime.now());
        Task updatedTask = taskRepository.save(task);
        
        // Log activities for changes
        boolean hasChanges = false;
        
        // Log status change
        if (!originalStatus.equals(updatedTask.getStatus())) {
            taskActivityService.logStatusChanged(updatedTask.getId(), currentUser.getId(), 
                originalStatus.toString(), updatedTask.getStatus().toString());
            hasChanges = true;
        }
        
        // Log priority change
        if (originalPriority != updatedTask.getPriority()) {
            taskActivityService.logPriorityChanged(updatedTask.getId(), currentUser.getId(), 
                originalPriority != null ? originalPriority.toString() : "None", 
                updatedTask.getPriority() != null ? updatedTask.getPriority().toString() : "None");
            hasChanges = true;
        }
        
        // Log assignee change
        if (!java.util.Objects.equals(originalAssignee, updatedTask.getAssignee())) {
            if (originalAssignee != null && updatedTask.getAssignee() == null) {
                // Unassigned
                taskActivityService.logTaskUnassigned(updatedTask.getId(), currentUser.getId(), 
                    originalAssignee.getUsername());
            } else if (originalAssignee == null && updatedTask.getAssignee() != null) {
                // Assigned
                taskActivityService.logTaskAssigned(updatedTask.getId(), currentUser.getId(), 
                    updatedTask.getAssignee().getUsername());
            } else if (originalAssignee != null && updatedTask.getAssignee() != null) {
                // Reassigned
                taskActivityService.logTaskUnassigned(updatedTask.getId(), currentUser.getId(), 
                    originalAssignee.getUsername());
                taskActivityService.logTaskAssigned(updatedTask.getId(), currentUser.getId(), 
                    updatedTask.getAssignee().getUsername());
            }
            hasChanges = true;
        }
        
        // Log general update if there were other changes
        if (hasChanges || taskRequest.getTitle() != null || taskRequest.getDescription() != null) {
            taskActivityService.logTaskUpdated(updatedTask.getId(), currentUser.getId(), 
                "Task details updated");
        }
        
        // Broadcast updates via WebSocket
        if (!originalStatus.equals(updatedTask.getStatus())) {
            // Status changed - broadcast status change
            webSocketService.broadcastTaskStatusChange(updatedTask, originalStatus.toString(), 
                    updatedTask.getStatus().toString(), currentUser.getUsername());
        } else {
            // General update - broadcast task update
            webSocketService.broadcastTaskUpdate(updatedTask, "TASK_UPDATED", currentUser.getUsername());
        }
        
        return Response.<Task>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Task updated successfully")
                .data(updatedTask)
                .build();
    }

    @Override
    public Response<Void> deleteTask(Long id) {
        log.info("inside delete task");
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task does not exists"));
        
        User currentUser = userService.getCurrentLoggedInUser();
        
        // Log task deletion activity before deleting
        taskActivityService.logTaskDeleted(task.getId(), currentUser.getId());
        
        // Broadcast task deletion via WebSocket before deleting
        webSocketService.broadcastTaskUpdate(task, "TASK_DELETED", currentUser.getUsername());
        
        taskRepository.deleteById(id);
        return Response.<Void>builder()
                .statusCode(HttpStatus.OK.value())
                .message("task deleted successfully")
                .build();
    }

    @Override
    @Transactional
    public Response<List<Task>> getMyTasksByCompletionStatus(boolean completed) {
        log.info("inside getMyTasksByCompletionStatus()");
        User currentUser = userService.getCurrentLoggedInUser();
        // Convert boolean to TaskStatus for backward compatibility
        TaskStatus status = completed ? TaskStatus.DONE : TaskStatus.TODO;
        List<Task> tasks = taskRepository.findByStatusAndCreator(status, currentUser, 
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return Response.<List<Task>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Tasks filtered by completion status for user")
                .data(tasks)
                .build();

    }

    @Override
    public Response<List<Task>> getMyTasksByPriority(String priority) {
        log.info("inside getMyTasksByPriority()");
        User currentUser = userService.getCurrentLoggedInUser();
        Priority priorityEnum = Priority.valueOf(priority.toUpperCase());
        List<Task> tasks = taskRepository.
                findByPriorityAndUser(priorityEnum, currentUser, Sort.by(Sort.Direction.DESC, "id"));
        return Response.<List<Task>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Tasks filtered by priority for user")
                .data(tasks)
                .build();

    }
    
    @Override
    public Response<List<Task>> getTasksWithFilters(String status, Long assigneeId) {
        log.info("inside getTasksWithFilters()");
        
        TaskStatus taskStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                taskStatus = TaskStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status: " + status);
            }
        }
        
        User assignee = null;
        if (assigneeId != null) {
            assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new NotFoundException("Assignee not found"));
        }
        
        User currentUser = userService.getCurrentLoggedInUser();
        List<Task> tasks = taskRepository.findTasksWithFilters(taskStatus, assignee, currentUser, 
                Sort.by(Sort.Direction.DESC, "createdAt"));
        
        return Response.<List<Task>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Tasks filtered successfully")
                .data(tasks)
                .build();
    }
    
    @Override
    public Response<List<Task>> getAllTasks() {
        log.info("inside getAllTasks()");
        List<Task> tasks = taskRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return Response.<List<Task>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("All tasks retrieved successfully")
                .data(tasks)
                .build();
    }
}
