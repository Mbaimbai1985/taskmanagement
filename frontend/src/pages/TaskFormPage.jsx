import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ApiService from '../api/ApiService';
import { ToastContainer } from '../components/Toast';
import useToast from '../hooks/useToast';

const TaskFormPage = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        assigneeId: '',
        completed: false
    });

    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const usersResponse = await ApiService.getAllUsers();
                if (usersResponse.statusCode === 200) {
                    setUsers(usersResponse.data);
                }
                if (isEdit) {
                    const taskResponse = await ApiService.getTaskById(id);
                    if (taskResponse.statusCode === 200) {
                        const task = taskResponse.data;
                        setFormData({
                            id: task.id,
                            title: task.title || '',
                            description: task.description || '',
                            priority: task.priority || 'MEDIUM',
                            status: task.status || (task.completed ? 'DONE' : 'TODO'),
                            assigneeId: task.assignee?.id || task.assigneeId || '',
                            completed: task.completed || false
                        });
                    } else {
                        setError(taskResponse.message || 'Failed to fetch task');
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let processedValue = value;
        if (name === 'assigneeId') {
            processedValue = value === '' ? null : parseInt(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim()) {
            const errorMsg = 'Title is required';
            setError(errorMsg);
            showError(errorMsg);
            return;
        }

        setLoading(true);
        try {
            const submitData = {
                ...formData,
                completed: formData.status === 'DONE'
            };

            let response;
            if (isEdit) {
                response = await ApiService.updateTask(submitData);
                showSuccess(`Task "${formData.title}" updated successfully!`);
            } else {
                response = await ApiService.createTask(submitData);
                showSuccess(`Task "${formData.title}" created successfully!`);
            }

            if (response.statusCode === 200) {
                setTimeout(() => {
                    navigate('/tasks');
                }, 1000);
            } else {
                const errorMsg = response.message || 'Error saving task';
                setError(errorMsg);
                showError(errorMsg);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Error saving task';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }

        setLoading(true);
        try {
            await ApiService.deleteTask(id);
            showSuccess(`Task "${formData.title}" deleted successfully!`);
            setTimeout(() => {
                navigate('/tasks');
            }, 1000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Error deleting task';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="task-form-container">
            <div className="task-form-card">
                <div className="form-header">
                    <h2>{isEdit ? 'Edit Task' : 'Create New Task'}</h2>
                    <button 
                        type="button" 
                        onClick={() => navigate('/tasks')}
                        className="close-button"
                    >
                        ×
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter task title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter task description"
                            rows="4"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="priority">Priority</label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="TODO">TODO</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="DONE">DONE</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="assigneeId">Assign to User</label>
                            <select
                                id="assigneeId"
                                name="assigneeId"
                                value={formData.assigneeId || ''}
                                onChange={handleChange}
                            >
                                <option value="">Unassigned</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={() => navigate('/tasks')}
                            className="cancel-button"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        
                        {isEdit && (
                            <button 
                                type="button" 
                                onClick={handleDelete}
                                className="delete-button"
                                disabled={loading}
                            >
                                Delete Task
                            </button>
                        )}
                        
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (isEdit ? 'Update Task' : 'Create Task')}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default TaskFormPage;