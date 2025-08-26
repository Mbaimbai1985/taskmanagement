package com.davymbaimbai.dto;
import com.davymbaimbai.enums.Priority;
import com.davymbaimbai.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TaskRequest {

    private Long id;
    @NotBlank(message = "Title cannot be empty")
    @Size(max = 200, message = "Title must be less than 200 characters")
    private String title;
    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;
    @NotNull(message = "Status is required")
    private TaskStatus status;
    @NotNull(message = "Priority is required")
    private Priority priority;
    private Long assigneeId;
    private Boolean completed;

}
