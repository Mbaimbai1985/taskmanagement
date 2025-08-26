import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../api/ApiService';
import WebSocketService from '../services/WebSocketService';
import TaskDetails from '../components/TaskDetails';
import { ToastContainer } from '../components/Toast';
import useToast from '../hooks/useToast';

import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import SortableTaskItem from '../components/SortableTaskItem';
import DroppableColumn from '../components/DroppableColumn';

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [assigneeFilter, setAssigneeFilter] = useState('ALL');
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [permissions, setPermissions] = useState({
        canCreateTasks: false,
        canUpdateTasks: false,
        canDeleteTasks: false,
        canAssignTasks: false,
        canViewAllTasks: false,
        canComment: false,
        canMoveStatus: false
    });
    const [activeTask, setActiveTask] = useState(null);
    const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();

    const navigate = useNavigate();
    const getDisplayName = (username) => {
        if (!username || username.trim() === '') return 'User';
        const trimmedUsername = username.trim();
        const firstName = trimmedUsername.split(' ')[0];
        return firstName || 'User';
    };
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    useEffect(() => {
        if (!ApiService.isAuthenticated()) {
            navigate('/login');
            return;
        }

        fetchTasks();
        fetchUsers();
        fetchUserInfo();
        WebSocketService.connect()
            .then(() => {
                console.log('WebSocket connected successfully');
                WebSocketService.subscribeToTasks((taskUpdate) => {
                    setTasks(prev => prev.map(task => 
                        task.id === taskUpdate.id ? { ...task, ...taskUpdate } : task
                    ));
                });
            })
            .catch((error) => {
                console.warn('WebSocket connection failed:', error.message);
            });
        return () => {
            WebSocketService.disconnect();
        };
    }, [navigate]);

    const fetchTasks = async () => {
        try {
            const response = await ApiService.getAllMyTasks();
            setTasks(response.data || []);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error loading tasks';
            setError(errorMessage);
            showError(errorMessage);
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await ApiService.getAllUsers();
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchUserInfo = async () => {
        try {
            const currentUser = await ApiService.getUserRole();

            setUserInfo(currentUser);
            const isAdmin = currentUser.role === 'ADMIN';
            setPermissions({
                canCreateTasks: isAdmin,
                canUpdateTasks: isAdmin,
                canDeleteTasks: isAdmin,
                canAssignTasks: isAdmin,
                canViewAllTasks: isAdmin,
                canComment: true,
                canMoveStatus: trisAdmin
            });
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };
    const filteredTasks = tasks.filter(task => {
        const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
        const matchesAssignee = assigneeFilter === 'ALL' || 
            (assigneeFilter === 'UNASSIGNED' && !task.assignee) ||
            (task.assignee && task.assignee.id.toString() === assigneeFilter);
        return matchesStatus && matchesAssignee;
    });
    const groupedTasks = {
        TODO: filteredTasks.filter(task => task.status === 'TODO'),
        IN_PROGRESS: filteredTasks.filter(task => task.status === 'IN_PROGRESS'),
        DONE: filteredTasks.filter(task => task.status === 'DONE')
    };
    const handleDragStart = (event) => {
        setActiveTask(tasks.find(task => task.id === event.active.id));
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over || !permissions.canMoveStatus) return;

        const taskId = active.id;
        const newStatus = over.id;
        const task = tasks.find(t => t.id === taskId);

        if (!task || task.status === newStatus) return;
        setTasks(prev => prev.map(t => 
            t.id === taskId ? { ...t, status: newStatus } : t
        ));

        try {
            const updateData = {
                id: task.id,
                title: task.title,
                description: task.description,
                status: newStatus,
                priority: task.priority,
                assigneeId: task.assignee?.id || null
            };

            await ApiService.updateTask(updateData);
            const statusDisplayNames = {
                'TODO': 'To Do',
                'IN_PROGRESS': 'In Progress',
                'DONE': 'Done'
            };
            showSuccess(`Task "${task.title}" moved to ${statusDisplayNames[newStatus]}`);
        } catch (error) {
            console.error('Error updating task status:', error);
            setTasks(prev => prev.map(t => 
                t.id === taskId ? { ...t, status: task.status } : t
            ));
            const errorMessage = error.response?.data?.message || 'Failed to update task status';
            setError(errorMessage);
            showError(errorMessage);
        }
    };

    const handleTaskClick = (task) => {
        if (userInfo?.role === 'ADMIN') {
            navigate(`/tasks/edit/${task.id}`);
        } else {
            setSelectedTask(task);
            setShowTaskDetails(true);
        }
    };

    const handleTaskUpdate = (updatedTask) => {
        setTasks(prev => prev.map(task => 
            task.id === updatedTask.id ? updatedTask : task
        ));
    };

    const renderStatusColumn = (status, title, tasks) => {
        return (
            <DroppableColumn
                key={status}
                status={status}
                title={title}
                tasks={tasks}
                onTaskClick={handleTaskClick}
                canMove={permissions.canMoveStatus}
            />
        );
    };

    // UI permissions
    const canCreateTasks = permissions.canCreateTasks;

    if (loading) {
        return <div className="loading">Loading tasks...</div>;
    }

    return (
        <div className="tasks-container">
            <div className="tasks-header">
                <div className="header-content">
                    <h1>My Tasks</h1>
                    {userInfo && (
                        <div className="user-welcome">
                            <span>Welcome back, <strong>
                                {getDisplayName(userInfo.username)}
                            </strong></span>
                        </div>
                    )}
                </div>
                
                {canCreateTasks && (
                    <button 
                        onClick={() => navigate('/tasks/add')} 
                        className="create-task-btn"
                    >
                        + Create Task
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

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
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="DONE">DONE</option>
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
                        <div className="task-card drag-overlay">
                            <div className="task-header">
                                <h3 className="task-title">{activeTask.title}</h3>
                                <span className={`priority-badge priority-${activeTask.priority?.toLowerCase()}`}>
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
                    showSuccess={showSuccess}
                    showError={showError}
                />
            )}
            
            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default TasksPage;