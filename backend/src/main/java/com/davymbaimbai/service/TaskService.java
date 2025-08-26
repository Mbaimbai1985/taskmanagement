package com.davymbaimbai.service;
import com.davymbaimbai.dto.Response;
import com.davymbaimbai.dto.TaskRequest;
import com.davymbaimbai.entity.Task;
import com.davymbaimbai.enums.TaskStatus;
import java.util.List;

public interface TaskService {
    Response<Task> createTask(TaskRequest taskRequest);
    Response<List<Task>> getAllMyTasks();
    Response<Task> getTaskById(Long id);
    Response<Task> updateTask(TaskRequest taskRequest);
    Response<Void> deleteTask(Long id);
    Response<List<Task>> getMyTasksByCompletionStatus(boolean completed);
    Response<List<Task>> getMyTasksByPriority(String priority);
    Response<List<Task>> getTasksWithFilters(String status, Long assigneeId);
    Response<List<Task>> getAllTasks();
}
