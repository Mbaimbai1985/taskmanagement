package com.davymbaimbai.service.impl;

import com.davymbaimbai.dto.Response;
import com.davymbaimbai.entity.Task;
import com.davymbaimbai.entity.TaskActivity;
import com.davymbaimbai.entity.User;
import com.davymbaimbai.enums.ActivityType;
import com.davymbaimbai.repository.TaskActivityRepository;
import com.davymbaimbai.repository.TaskRepository;
import com.davymbaimbai.repository.UserRepository;
import com.davymbaimbai.service.TaskActivityService;
import com.davymbaimbai.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskActivityServiceImpl implements TaskActivityService {
    
    private final TaskActivityRepository taskActivityRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WebSocketService webSocketService;
    
    @Override
    public Response<TaskActivity> logActivity(Long taskId, Long userId, ActivityType activityType, String description, String oldValue, String newValue) {
        try {
            Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
            
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            TaskActivity activity = new TaskActivity();
            activity.setTask(task);
            activity.setUser(user);
            activity.setActivityType(activityType);
            activity.setDescription(description);
            activity.setOldValue(oldValue);
            activity.setNewValue(newValue);
            
            TaskActivity savedActivity = taskActivityRepository.save(activity);
            
            // Broadcast activity via WebSocket
            webSocketService.broadcastTaskActivity(savedActivity);
            
            return Response.<TaskActivity>builder()
                .statusCode(200)
                .message("Activity logged successfully")
                .data(savedActivity)
                .build();
                
        } catch (Exception e) {
            return Response.<TaskActivity>builder()
                .statusCode(500)
                .message("Error logging activity: " + e.getMessage())
                .build();
        }
    }
    
    @Override
    public Response<List<TaskActivity>> getTaskActivities(Long taskId) {
        try {
            List<TaskActivity> activities = taskActivityRepository.findByTaskId(taskId, 
                Sort.by(Sort.Direction.DESC, "createdAt"));
            
            return Response.<List<TaskActivity>>builder()
                .statusCode(200)
                .message("Task activities retrieved successfully")
                .data(activities)
                .build();
                
        } catch (Exception e) {
            return Response.<List<TaskActivity>>builder()
                .statusCode(500)
                .message("Error retrieving activities: " + e.getMessage())
                .build();
        }
    }
    
    @Override
    public Response<TaskActivity> logTaskCreated(Long taskId, Long userId) {
        return logActivity(taskId, userId, ActivityType.CREATED, 
            "Task was created", null, null);
    }
    
    @Override
    public Response<TaskActivity> logTaskUpdated(Long taskId, Long userId, String description) {
        return logActivity(taskId, userId, ActivityType.UPDATED, 
            description != null ? description : "Task was updated", null, null);
    }
    
    @Override
    public Response<TaskActivity> logStatusChanged(Long taskId, Long userId, String oldStatus, String newStatus) {
        return logActivity(taskId, userId, ActivityType.STATUS_CHANGED, 
            String.format("Status changed from %s to %s", oldStatus, newStatus), 
            oldStatus, newStatus);
    }
    
    @Override
    public Response<TaskActivity> logTaskAssigned(Long taskId, Long userId, String assigneeName) {
        return logActivity(taskId, userId, ActivityType.ASSIGNED, 
            String.format("Task assigned to %s", assigneeName), null, assigneeName);
    }
    
    @Override
    public Response<TaskActivity> logTaskUnassigned(Long taskId, Long userId, String previousAssigneeName) {
        return logActivity(taskId, userId, ActivityType.UNASSIGNED, 
            String.format("Task unassigned from %s", previousAssigneeName), 
            previousAssigneeName, null);
    }
    
    @Override
    public Response<TaskActivity> logCommentAdded(Long taskId, Long userId, String comment) {
        return logActivity(taskId, userId, ActivityType.COMMENT_ADDED, 
            "Comment added to task", null, comment);
    }
    
    @Override
    public Response<TaskActivity> logTaskDeleted(Long taskId, Long userId) {
        return logActivity(taskId, userId, ActivityType.DELETED, 
            "Task was deleted", null, null);
    }
    
    @Override
    public Response<TaskActivity> logPriorityChanged(Long taskId, Long userId, String oldPriority, String newPriority) {
        return logActivity(taskId, userId, ActivityType.PRIORITY_CHANGED, 
            String.format("Priority changed from %s to %s", oldPriority, newPriority), 
            oldPriority, newPriority);
    }
}