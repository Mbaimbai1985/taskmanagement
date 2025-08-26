package com.davymbaimbai.service.impl;

import com.davymbaimbai.dto.CommentRequest;
import com.davymbaimbai.dto.CommentResponse;
import com.davymbaimbai.dto.Response;
import com.davymbaimbai.entity.Task;
import com.davymbaimbai.entity.TaskComment;
import com.davymbaimbai.entity.User;
import com.davymbaimbai.exceptions.BadRequestException;
import com.davymbaimbai.exceptions.NotFoundException;
import com.davymbaimbai.repository.TaskCommentRepository;
import com.davymbaimbai.repository.TaskRepository;
import com.davymbaimbai.service.TaskCommentService;
import com.davymbaimbai.service.TaskActivityService;
import com.davymbaimbai.service.UserService;
import com.davymbaimbai.service.WebSocketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TaskCommentServiceImpl implements TaskCommentService {

    @Autowired
    private TaskCommentRepository commentRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private WebSocketService webSocketService;
    
    @Autowired
    private TaskActivityService taskActivityService;

    @Override
    public Response<CommentResponse> addComment(Long taskId, CommentRequest commentRequest) {
        log.info("Adding comment to task: {}", taskId);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found"));
        User currentUser = userService.getCurrentLoggedInUser();
        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setUser(currentUser);
        comment.setComment(commentRequest.getComment());
        TaskComment savedComment = commentRepository.save(comment);
        taskActivityService.logCommentAdded(taskId, currentUser.getId(), commentRequest.getComment());
        
        webSocketService.broadcastTaskComment(taskId, commentRequest.getComment(), currentUser.getUsername());
        CommentResponse response = CommentResponse.builder()
                .id(savedComment.getId())
                .comment(savedComment.getComment())
                .username(savedComment.getUser().getUsername())
                .createdAt(savedComment.getCreatedAt())
                .updatedAt(savedComment.getUpdatedAt())
                .build();
        return Response.<CommentResponse>builder()
                .statusCode(HttpStatus.CREATED.value())
                .message("Comment added successfully")
                .data(response)
                .build();
    }

    @Override
    public Response<List<CommentResponse>> getTaskComments(Long taskId) {
        log.info("Getting comments for task: {}", taskId);
        taskRepository.findById(taskId)
                .orElseThrow(() -> new NotFoundException("Task not found"));
        List<TaskComment> comments = commentRepository.findByTaskId(taskId, 
                Sort.by(Sort.Direction.ASC, "createdAt"));
        List<CommentResponse> commentResponses = comments.stream()
                .map(comment -> CommentResponse.builder()
                        .id(comment.getId())
                        .comment(comment.getComment())
                        .username(comment.getUser().getUsername())
                        .createdAt(comment.getCreatedAt())
                        .updatedAt(comment.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
        return Response.<List<CommentResponse>>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Comments retrieved successfully")
                .data(commentResponses)
                .build();
    }

    @Override
    public Response<CommentResponse> updateComment(Long commentId, CommentRequest commentRequest) {
        log.info("Updating comment: {}", commentId);
        TaskComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found"));
        
        User currentUser = userService.getCurrentLoggedInUser();
        if (!comment.getUser().getId().equals(currentUser.getId()) && 
            !currentUser.getRole().toString().equals("ADMIN")) {
            throw new BadRequestException("You don't have permission to update this comment");
        }
        
        comment.setComment(commentRequest.getComment());
        comment.setUpdatedAt(LocalDateTime.now());
        TaskComment updatedComment = commentRepository.save(comment);
        webSocketService.broadcastTaskComment(comment.getTask().getId(), 
                commentRequest.getComment(), currentUser.getUsername());
        
        CommentResponse response = CommentResponse.builder()
                .id(updatedComment.getId())
                .comment(updatedComment.getComment())
                .username(updatedComment.getUser().getUsername())
                .createdAt(updatedComment.getCreatedAt())
                .updatedAt(updatedComment.getUpdatedAt())
                .build();
        
        return Response.<CommentResponse>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Comment updated successfully")
                .data(response)
                .build();
    }

    @Override
    public Response<Void> deleteComment(Long commentId) {
        log.info("Deleting comment: {}", commentId);
        TaskComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found"));
        
        User currentUser = userService.getCurrentLoggedInUser();
        if (!comment.getUser().getId().equals(currentUser.getId()) && 
            !currentUser.getRole().toString().equals("ADMIN")) {
            throw new BadRequestException("You don't have permission to delete this comment");
        }
        
        Long taskId = comment.getTask().getId();
        webSocketService.broadcastTaskComment(taskId, 
                "Comment deleted", currentUser.getUsername());
        
        commentRepository.deleteById(commentId);
        
        return Response.<Void>builder()
                .statusCode(HttpStatus.OK.value())
                .message("Comment deleted successfully")
                .build();
    }
}