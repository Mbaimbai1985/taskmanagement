package com.davymbaimbai.service;

import com.davymbaimbai.entity.Task;
import com.davymbaimbai.entity.TaskActivity;

public interface WebSocketService {
    void broadcastTaskUpdate(Task task, String action, String username);
    void broadcastTaskComment(Long taskId, String comment, String username);
    void broadcastTaskStatusChange(Task task, String oldStatus, String newStatus, String username);
    void broadcastTaskActivity(TaskActivity activity);
}