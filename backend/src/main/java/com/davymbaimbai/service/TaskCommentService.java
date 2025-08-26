package com.davymbaimbai.service;

import com.davymbaimbai.dto.CommentRequest;
import com.davymbaimbai.dto.CommentResponse;
import com.davymbaimbai.dto.Response;
import java.util.List;

public interface TaskCommentService {
    Response<CommentResponse> addComment(Long taskId, CommentRequest commentRequest);
    Response<List<CommentResponse>> getTaskComments(Long taskId);
    Response<CommentResponse> updateComment(Long commentId, CommentRequest commentRequest);
    Response<Void> deleteComment(Long commentId);
}