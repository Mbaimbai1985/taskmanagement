import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import ApiService from '../api/ApiService';

const AdminTasksPage = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                if (!ApiService.isAuthenticated()) {
                    console.log('User not authenticated, redirecting to login');
                    navigate('/login');
                    return;
                }
                
                console.log('Checking admin status...');
                const adminStatus = await ApiService.isAdmin();
                console.log('Admin status:', adminStatus);
                setIsAdmin(adminStatus);
                
                if (adminStatus) {
                    console.log('User is admin, fetching data...');
                    await Promise.all([fetchAllTasks(), fetchUsers()]);
                } else {
                    console.log('User is not admin');
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                setError('Error checking permissions: ' + (error.message || 'Unknown error'));
                setIsAdmin(false);
            }
        };
        
        checkAdminStatus();
    }, [navigate]);

    if (isAdmin === null) {
        return (
            <div className="admin-dashboard">
                <div className="loading-message">Checking permissions...</div>
            </div>
        );
    }
    if (!isAdmin) {
        return <Navigate to="/tasks" replace />;
    }

    const fetchAllTasks = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching all tasks...');
            const response = await ApiService.getAllTasks();
            console.log('Tasks response:', response);
            
            if (response.statusCode === 200) {
                console.log('Tasks data:', response.data);
                setTasks(response.data || []);
            } else {
                console.error('Failed to fetch tasks, status:', response.statusCode);
                setError('Failed to fetch tasks');
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            setError('Error loading tasks: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            console.log('Fetching users...');
            const response = await ApiService.getAllUsers();
            console.log('Users response:', response);
            
            if (response.statusCode === 200) {
                console.log('Users data:', response.data);
                setUsers(response.data || []);
            } else {
                console.error('Failed to fetch users, status:', response.statusCode);
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
        
        let assigneeMatch = true;
        if (selectedAssignee) {
            if (selectedAssignee === 'unassigned') {
                // Show only unassigned tasks (no assignee)
                assigneeMatch = !task.assigneeId;
            } else {
                // Show tasks assigned to specific user
                assigneeMatch = task.assigneeId?.toString() === selectedAssignee;
            }
        }
        // If no assignee filter selected, show all tasks
        
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

    // Group tasks by assignee and status for kanban view
    const getTasksByUserAndStatus = () => {
        const userGroups = {};
        
        // Initialize with all users
        users.forEach(user => {
            userGroups[user.id] = {
                user: user,
                TODO: [],
                IN_PROGRESS: [],
                DONE: []
            };
        });
        
        // Add unassigned group
        userGroups['unassigned'] = {
            user: { id: 'unassigned', username: 'Unassigned' },
            TODO: [],
            IN_PROGRESS: [],
            DONE: []
        };
        
        // Group filtered tasks
        filteredTasks.forEach(task => {
            const assigneeKey = task.assigneeId || 'unassigned';
            if (userGroups[assigneeKey]) {
                userGroups[assigneeKey][task.status].push(task);
            }
        });
        if (selectedAssignee) {
            if (selectedAssignee === 'unassigned') {
                return { unassigned: userGroups.unassigned };
            } else {
                return { [selectedAssignee]: userGroups[selectedAssignee] };
            }
        }
        Object.keys(userGroups).forEach(key => {
            const userGroup = userGroups[key];
            const totalTasks = userGroup.TODO.length + userGroup.IN_PROGRESS.length + userGroup.DONE.length;
            if (totalTasks === 0) {
                delete userGroups[key];
            }
        });
        
        return userGroups;
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
        return (
            <div className="tasks-page">
                <div className="page-header">
                    <h1>Admin Dashboard - All Tasks</h1>
                </div>
                <div className="loading-message">Loading all tasks...</div>
            </div>
        );
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
                    {selectedAssignee && (
                        <div className="filter-info">
                            <span className="count-label">Filter:</span>
                            <span className="count-number">
                                {selectedAssignee === 'unassigned' 
                                    ? 'Unassigned Tasks' 
                                    : `${users.find(u => u.id.toString() === selectedAssignee)?.username || 'User'}'s Tasks`
                                }
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Filter Controls */}
            <div className="filter-controls">
                <div className="filter-group">
                    <label htmlFor="viewMode">View Mode:</label>
                    <select 
                        id="viewMode"
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                    >
                        <option value="grid">Grid View</option>
                        <option value="kanban">User Assignment View</option>
                    </select>
                </div>

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
                        <option value="unassigned">Unassigned</option>
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
            {viewMode === 'grid' ? (
                <div className="tasks-grid">
                    {filteredTasks.length === 0 ? (
                        <p className="no-tasks">No tasks found matching the selected filters.</p>
                    ) : (
                        filteredTasks.map(task => (
                        <div 
                            key={task.id} 
                            className="task-card admin-task-card"
                            onClick={() => navigate(`/tasks/edit/${task.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
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
            ) : (
                // Kanban view by user and status
                <div className="user-kanban-view">
                    {Object.keys(getTasksByUserAndStatus()).length === 0 ? (
                        <p className="no-tasks">No tasks found matching the selected filters.</p>
                    ) : (
                        Object.entries(getTasksByUserAndStatus()).map(([userId, userGroup]) => (
                            <div key={userId} className="user-section">
                                <div className="user-header">
                                    <h3>{userGroup.user.username}</h3>
                                    <span className="user-task-count">
                                        {userGroup.TODO.length + userGroup.IN_PROGRESS.length + userGroup.DONE.length} tasks
                                    </span>
                                </div>
                                
                                <div className="user-status-columns">
                                    {/* TODO Column */}
                                    <div className="status-column">
                                        <div className="status-header">
                                            <h4>To Do</h4>
                                            <span className="status-count">{userGroup.TODO.length}</span>
                                        </div>
                                        <div className="status-tasks">
                                            {userGroup.TODO.map(task => (
                                                <div 
                                                    key={task.id} 
                                                    className="mini-task-card"
                                                    onClick={() => navigate(`/tasks/edit/${task.id}`)}
                                                >
                                                    <h5>{task.title}</h5>
                                                    <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* IN_PROGRESS Column */}
                                    <div className="status-column">
                                        <div className="status-header">
                                            <h4>In Progress</h4>
                                            <span className="status-count">{userGroup.IN_PROGRESS.length}</span>
                                        </div>
                                        <div className="status-tasks">
                                            {userGroup.IN_PROGRESS.map(task => (
                                                <div 
                                                    key={task.id} 
                                                    className="mini-task-card"
                                                    onClick={() => navigate(`/tasks/edit/${task.id}`)}
                                                >
                                                    <h5>{task.title}</h5>
                                                    <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* DONE Column */}
                                    <div className="status-column">
                                        <div className="status-header">
                                            <h4>Done</h4>
                                            <span className="status-count">{userGroup.DONE.length}</span>
                                        </div>
                                        <div className="status-tasks">
                                            {userGroup.DONE.map(task => (
                                                <div 
                                                    key={task.id} 
                                                    className="mini-task-card"
                                                    onClick={() => navigate(`/tasks/edit/${task.id}`)}
                                                >
                                                    <h5>{task.title}</h5>
                                                    <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminTasksPage;