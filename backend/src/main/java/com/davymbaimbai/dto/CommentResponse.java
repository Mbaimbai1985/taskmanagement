package com.davymbaimbai.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {
    private Long id;
    private String comment;
    private String username;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}