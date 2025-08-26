package com.davymbaimbai.service;

import com.davymbaimbai.entity.TaskActivity;
import com.davymbaimbai.enums.ActivityType;
import com.davymbaimbai.dto.Response;

import java.util.List;

public interface TaskActivityService {
    Response<TaskActivity> logActivity(Long taskId, Long userId, ActivityType activityType, String description, String oldValue, String newValue);
    Response<List<TaskActivity>> getTaskActivities(Long taskId);
    Response<TaskActivity> logTaskCreated(Long taskId, Long userId);
    Response<TaskActivity> logTaskUpdated(Long taskId, Long userId, String description);
    Response<TaskActivity> logStatusChanged(Long taskId, Long userId, String oldStatus, String newStatus);
    Response<TaskActivity> logTaskAssigned(Long taskId, Long userId, String assigneeName);
    Response<TaskActivity> logTaskUnassigned(Long taskId, Long userId, String previousAssigneeName);
    Response<TaskActivity> logCommentAdded(Long taskId, Long userId, String comment);
    Response<TaskActivity> logTaskDeleted(Long taskId, Long userId);
    Response<TaskActivity> logPriorityChanged(Long taskId, Long userId, String oldPriority, String newPriority);
}