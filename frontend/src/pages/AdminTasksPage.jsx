import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import ApiService from '../api/ApiService';

const AdminTasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedAssignee, setSelectedAssignee] = useState('');

    // Check if user is admin
    const isAdmin = ApiService.isAdmin();

    useEffect(() => {
        if (isAdmin) {
            fetchAllTasks();
            fetchUsers();
        }
    }, [isAdmin]);

    // Redirect if not admin
    if (!isAdmin) {
        return <Navigate to="/tasks" replace />;
    }

    const fetchAllTasks = async () => {
        try {
            setLoading(true);
            const response = await ApiService.getAllTasks();
            if (response.statusCode === 200) {
                setTasks(response.data);
            } else {
                setError('Failed to fetch tasks');
            }
        } catch (error) {
            setError('Error loading tasks');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await ApiService.getAllUsers();
            if (response.statusCode === 200) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await ApiService.deleteTask(taskId);
                setTasks(tasks.filter(task => task.id !== taskId));
            } catch (error) {
                setError('Failed to delete task');
                console.error('Error:', error);
            }
        }
    };

    const filteredTasks = tasks.filter(task => {
        const statusMatch = !selectedStatus || task.status === selectedStatus;
        const assigneeMatch = !selectedAssignee || task.assigneeId?.toString() === selectedAssignee;
        return statusMatch && assigneeMatch;
    });

    const getAssigneeName = (assigneeId) => {
        const assignee = users.find(user => user.id === assigneeId);
        return assignee ? assignee.username : 'Unassigned';
    };

    const getCreatorName = (creatorId) => {
        const creator = users.find(user => user.id === creatorId);
        return creator ? creator.username : 'Unknown';
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return '#ff4757';
            case 'medium': return '#ffa502';
            case 'low': return '#2ed573';
            default: return '#747d8c';
        }
    };

    if (loading) {
        return <div className="loading">Loading all tasks...</div>;
    }

    return (
        <div className="tasks-page">
            <div className="page-header">
                <h1>Admin Dashboard - All Tasks</h1>
                <div className="total-stats">
                    <div className="total-count">
                        <span className="count-label">Total Tasks:</span>
                        <span className="count-number">{tasks.length}</span>
                    </div>
                    <div className="filtered-count">
                        <span className="count-label">Showing:</span>
                        <span className="count-number">{filteredTasks.length}</span>
                    </div>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Filter Controls */}
            <div className="filter-controls">
                <div className="filter-group">
                    <label htmlFor="statusFilter">Filter by Status:</label>
                    <select 
                        id="statusFilter"
                        value={selectedStatus} 
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="assigneeFilter">Filter by Assignee:</label>
                    <select 
                        id="assigneeFilter"
                        value={selectedAssignee} 
                        onChange={(e) => setSelectedAssignee(e.target.value)}
                    >
                        <option value="">All Users</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tasks Summary */}
            <div className="tasks-summary">
                <div className="summary-card todo-card">
                    <h3>TODO</h3>
                    <div className="card-stats">
                        <span className="main-count">{tasks.filter(t => t.status === 'TODO').length}</span>
                        <span className="percentage">
                            {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'TODO').length / tasks.length) * 100) : 0}%
                        </span>
                    </div>
                </div>
                <div className="summary-card progress-card">
                    <h3>IN PROGRESS</h3>
                    <div className="card-stats">
                        <span className="main-count">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</span>
                        <span className="percentage">
                            {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'IN_PROGRESS').length / tasks.length) * 100) : 0}%
                        </span>
                    </div>
                </div>
                <div className="summary-card done-card">
                    <h3>DONE</h3>
                    <div className="card-stats">
                        <span className="main-count">{tasks.filter(t => t.status === 'DONE').length}</span>
                        <span className="percentage">
                            {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100) : 0}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="tasks-grid">
                {filteredTasks.length === 0 ? (
                    <p className="no-tasks">No tasks found matching the selected filters.</p>
                ) : (
                    filteredTasks.map(task => (
                        <div key={task.id} className="task-card admin-task-card">
                            <div className="task-header">
                                <h3>{task.title}</h3>
                                <div className="task-actions">
                                    <button 
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="delete-btn"
                                        title="Delete Task"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            
                            <p className="task-description">{task.description}</p>
                            
                            <div className="task-meta">
                                <div className="task-info">
                                    <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}
                                          style={{ backgroundColor: getPriorityColor(task.priority) }}>
                                        {task.priority}
                                    </span>
                                    <span className={`status-badge status-${task.status?.toLowerCase()}`}>
                                        {task.status?.replace('_', ' ')}
                                    </span>
                                </div>
                                
                                <div className="user-info">
                                    <p><strong>Created by:</strong> {getCreatorName(task.userId)}</p>
                                    <p><strong>Assigned to:</strong> {getAssigneeName(task.assigneeId)}</p>
                                </div>
                                
                                {task.dueDate && (
                                    <p className="due-date">
                                        <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminTasksPage;