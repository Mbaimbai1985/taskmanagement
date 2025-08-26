package com.davymbaimbai.service.impl;

import com.davymbaimbai.entity.Task;
import com.davymbaimbai.dto.TaskActivityDto;
import com.davymbaimbai.service.WebSocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class WebSocketServiceImpl implements WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public void broadcastTaskUpdate(Task task, String action, String username) {
        TaskActivityDto activity = TaskActivityDto.builder()
                .taskId(task.getId())
                .action(action)
                .username(username)
                .timestamp(LocalDateTime.now())
                .taskTitle(task.getTitle())
                .build();
        
        messagingTemplate.convertAndSend("/topic/tasks", activity);
    }

    @Override
    public void broadcastTaskComment(Long taskId, String comment, String username) {
        TaskActivityDto activity = TaskActivityDto.builder()
                .taskId(taskId)
                .action("COMMENT_ADDED")
                .username(username)
                .comment(comment)
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/tasks/" + taskId + "/comments", activity);
        messagingTemplate.convertAndSend("/topic/tasks", activity);
    }

    @Override
    public void broadcastTaskStatusChange(Task task, String oldStatus, String newStatus, String username) {
        TaskActivityDto activity = TaskActivityDto.builder()
                .taskId(task.getId())
                .action("STATUS_CHANGED")
                .username(username)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .taskTitle(task.getTitle())
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend("/topic/tasks", activity);
    }
}