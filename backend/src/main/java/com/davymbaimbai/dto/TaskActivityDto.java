package com.davymbaimbai.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TaskActivityDto {
    private Long taskId;
    private String action;
    private String username;
    private String taskTitle;
    private String comment;
    private String oldStatus;
    private String newStatus;
    private LocalDateTime timestamp;
}