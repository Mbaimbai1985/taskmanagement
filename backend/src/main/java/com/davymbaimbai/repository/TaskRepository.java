package com.davymbaimbai.repository;

import com.davymbaimbai.entity.Task;
import com.davymbaimbai.entity.User;
import com.davymbaimbai.enums.Priority;
import com.davymbaimbai.enums.TaskStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUser(User user, Sort sort);
    List<Task> findByCreator(User creator, Sort sort);
    List<Task> findByAssignee(User assignee, Sort sort);
    List<Task> findByPriorityAndUser(Priority priority, User user, Sort sort);
    List<Task> findByStatus(TaskStatus status, Sort sort);
    List<Task> findByStatusAndAssignee(TaskStatus status, User assignee, Sort sort);
    List<Task> findByStatusAndCreator(TaskStatus status, User creator, Sort sort);
    List<Task> findByAssigneeAndCreator(User assignee, User creator, Sort sort);
    
    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:assignee IS NULL OR t.assignee = :assignee) AND " +
           "(:creator IS NULL OR t.creator = :creator)")
    List<Task> findTasksWithFilters(@Param("status") TaskStatus status, 
                                   @Param("assignee") User assignee, 
                                   @Param("creator") User creator, 
                                   Sort sort);

}
