package com.davymbaimbai.controller;
import com.davymbaimbai.dto.Response;
import com.davymbaimbai.dto.TaskRequest;
import com.davymbaimbai.dto.CommentRequest;
import com.davymbaimbai.dto.CommentResponse;
import com.davymbaimbai.entity.Task;
import com.davymbaimbai.service.TaskService;
import com.davymbaimbai.service.TaskCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;
    private final TaskCommentService taskCommentService;
    
    @PostMapping
    public ResponseEntity<Response<Task>> createTask(@Valid @RequestBody TaskRequest taskRequest) {
        return ResponseEntity.ok(taskService.createTask(taskRequest));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Response<Task>> updateTask(@PathVariable Long id, @RequestBody TaskRequest taskRequest) {
        taskRequest.setId(id);
        return ResponseEntity.ok(taskService.updateTask(taskRequest));
    }
    
    @GetMapping
    public ResponseEntity<Response<List<Task>>> getTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long assignee) {
        if (status != null || assignee != null) {
            return ResponseEntity.ok(taskService.getTasksWithFilters(status, assignee));
        }
        return ResponseEntity.ok(taskService.getAllMyTasks());
    }
    
    @GetMapping("/all")
    public ResponseEntity<Response<List<Task>>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Response<Task>> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Response<Void>> deleteTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.deleteTask(id));
    }

    // Comment endpoints
    @PostMapping("/{id}/comments")
    public ResponseEntity<Response<CommentResponse>> addComment(@PathVariable Long id, @Valid @RequestBody CommentRequest commentRequest) {
        return ResponseEntity.ok(taskCommentService.addComment(id, commentRequest));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<Response<List<CommentResponse>>> getTaskComments(@PathVariable Long id) {
        return ResponseEntity.ok(taskCommentService.getTaskComments(id));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Response<CommentResponse>> updateComment(@PathVariable Long commentId, @Valid @RequestBody CommentRequest commentRequest) {
        return ResponseEntity.ok(taskCommentService.updateComment(commentId, commentRequest));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Response<Void>> deleteComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(taskCommentService.deleteComment(commentId));
    }

    // Backward compatibility endpoints
    @GetMapping("/status")
    public ResponseEntity<Response<List<Task>>> getMyTasksByCompletionStatus(
            @RequestParam boolean completed
    ) {
        return ResponseEntity.ok(taskService.getMyTasksByCompletionStatus(completed));
    }
    
    @GetMapping("/priority")
    public ResponseEntity<Response<List<Task>>> getMyTasksByPriority(
            @RequestParam String priority
    ) {
        return ResponseEntity.ok(taskService.getMyTasksByPriority(priority));
    }

}
