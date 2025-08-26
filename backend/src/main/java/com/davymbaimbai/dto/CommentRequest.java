package com.davymbaimbai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank(message = "Comment cannot be empty")
    private String comment;
}