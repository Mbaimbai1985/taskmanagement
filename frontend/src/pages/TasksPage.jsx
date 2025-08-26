import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiService from "../api/ApiService";
import TaskDetails from "../components/TaskDetails";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import SortableTaskItem from '../components/SortableTaskItem';
import DroppableColumn from '../components/DroppableColumn';

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [assigneeFilter, setAssigneeFilter] = useState('ALL');
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [activeTask, setActiveTask] = useState(null);
    const navigate = useNavigate();
    const isAuthenticated = ApiService.isAthenticated();
    const userInfo = ApiService.getUserInfo();
    const isAdmin = ApiService.isAdmin();
    
    // Role-based permissions
    const canCreateTasks = ApiService.canCreateTasks();
    const canDeleteTasks = ApiService.canDeleteTasks();
    const canMoveStatus = ApiService.canMoveTaskStatus();

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch tasks and users in parallel
                const [tasksRes, usersRes] = await Promise.all([
                    ApiService.getAllMyTasks(),
                    ApiService.getAllUsers()
                ]);
                
                if (tasksRes.statusCode === 200) {
                    setTasks(tasksRes.data);
                }
                
                if (usersRes.statusCode === 200) {
                    setUsers(usersRes.data);
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Error fetching data');
            }
        };

        if (isAuthenticated) {
            fetchData();
        } else {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Filter tasks based on selected filters
    const filteredTasks = tasks.filter(task => {
        const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
        const matchesAssignee = assigneeFilter === 'ALL' || 
            (assigneeFilter === 'UNASSIGNED' && !task.assignee) ||
            (task.assignee && task.assignee.id.toString() === assigneeFilter);
        return matchesStatus && matchesAssignee;
    });

    // Group tasks by status for kanban view
    const groupedTasks = {
        TODO: filteredTasks.filter(task => task.status === 'TODO'),
        IN_PROGRESS: filteredTasks.filter(task => task.status === 'IN_PROGRESS'),
        DONE: filteredTasks.filter(task => task.status === 'DONE')
    };

    // Handle drag start
    const handleDragStart = (event) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        setActiveTask(task);
    };

    // Handle drag end
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id;
        const newStatus = over.id;

        // Find the task being moved
        const task = tasks.find(t => t.id === taskId);
        if (!task || task.status === newStatus) return;

        // Check permissions for status changes
        if (!canMoveStatus) {
            setError("You don't have permission to move tasks");
            return;
        }

        try {
            // Optimistically update the UI
            const updatedTasks = tasks.map(t => 
                t.id === taskId ? { ...t, status: newStatus } : t
            );
            setTasks(updatedTasks);

            // Update task on backend
            const taskRequest = {
                id: task.id,
                title: task.title,
                description: task.description,
                status: newStatus,
                priority: task.priority,
                assigneeId: task.assignee?.id || null
            };

            const response = await ApiService.updateTask(taskRequest);
            
            if (response.statusCode === 200) {
                // Update with server response
                const updatedTasks = tasks.map(t => 
                    t.id === taskId ? response.data : t
                );
                setTasks(updatedTasks);
            }
        } catch (error) {
            // Revert optimistic update on error
            setTasks(tasks);
            setError(error.response?.data?.message || 'Failed to update task status');
        }
    };

    // Handle task click to show details
    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowTaskDetails(true);
    };

    // Handle task update from details modal
    const handleTaskUpdate = (updatedTask) => {
        setTasks(tasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
        ));
        setSelectedTask(updatedTask);
    };

    // Render status column using DroppableColumn
    const renderStatusColumn = (status, title, tasks) => {
        const statusTasks = tasks || [];
        
        return (
            <DroppableColumn
                key={status}
                status={status}
                title={title}
                tasks={statusTasks}
                onTaskClick={handleTaskClick}
                canMove={canMoveStatus}
            />
        );
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="tasks-container">
            <div className="tasks-header">
                <div className="header-content">
                    <h1>My Tasks</h1>
                    {userInfo && (
                        <div className="user-welcome">
                            <span>Welcome back, <strong>
                                {userInfo.role === 'ADMIN' ? 'ADMIN' : userInfo.username}
                            </strong></span>
                            <span className="user-role">({userInfo.role})</span>
                            {isAdmin && <span className="admin-badge">Admin</span>}
                        </div>
                    )}
                </div>
                
                {canCreateTasks && (
                    <Link to="/tasks/add" className="create-task-btn">
                        + Create Task
                    </Link>
                )}
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => setError('')}>Dismiss</button>
                </div>
            )}

            {/* Filters */}
            <div className="filters">
                <div className="filter-group">
                    <label htmlFor="status-filter">Status:</label>
                    <select 
                        id="status-filter"
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="assignee-filter">Assignee:</label>
                    <select 
                        id="assignee-filter"
                        value={assigneeFilter} 
                        onChange={(e) => setAssigneeFilter(e.target.value)}
                    >
                        <option value="ALL">All Assignees</option>
                        <option value="UNASSIGNED">Unassigned</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id.toString()}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Kanban Board with Drag and Drop */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
                <div className="kanban-board">
                    {renderStatusColumn('TODO', 'To Do', groupedTasks.TODO)}
                    {renderStatusColumn('IN_PROGRESS', 'In Progress', groupedTasks.IN_PROGRESS)}
                    {renderStatusColumn('DONE', 'Done', groupedTasks.DONE)}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="task-card dragging">
                            <div className="task-header">
                                <h4>{activeTask.title}</h4>
                                <span className={`priority-badge ${activeTask.priority.toLowerCase()}`}>
                                    {activeTask.priority}
                                </span>
                            </div>
                            <p className="task-description">{activeTask.description}</p>
                            <div className="task-meta">
                                <span className="assignee">
                                    Assigned to: {activeTask.assignee ? activeTask.assignee.username : 'Unassigned'}
                                </span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Task Details Modal */}
            {showTaskDetails && selectedTask && (
                <TaskDetails
                    task={selectedTask}
                    onClose={() => {
                        setShowTaskDetails(false);
                        setSelectedTask(null);
                    }}
                    onTaskUpdate={handleTaskUpdate}
                />
            )}
        </div>
    );
};

export default TasksPage;