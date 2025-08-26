import React, { useState, useEffect } from 'react';
import ApiService from '../api/ApiService';
import WebSocketService from '../services/WebSocketService';
import './TaskActivity.css';

const TaskActivity = ({ taskId, isVisible }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isVisible && taskId) {
            fetchActivities();
            const unsubscribe = WebSocketService.subscribeToTaskActivities(taskId, handleActivityUpdate);
            
            return () => {
                if (unsubscribe) {
                    WebSocketService.unsubscribeFromTaskActivities(taskId);
                }
            };
        }
    }, [taskId, isVisible]);

    const handleActivityUpdate = (activityUpdate) => {
        console.log('Received activity update:', activityUpdate);
        fetchActivities();
    };

    const fetchActivities = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await ApiService.getTaskActivities(taskId);
            
            if (response.statusCode === 200) {
                setActivities(response.data || []);
            } else {
                setError('Failed to load activities');
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            setError('Error loading activities');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActivityIcon = (activityType) => {
        switch (activityType) {
            case 'CREATED': return '✨';
            case 'UPDATED': return '📝';
            case 'STATUS_CHANGED': return '🔄';
            case 'ASSIGNED': return '👤';
            case 'UNASSIGNED': return '👥';
            case 'COMMENT_ADDED': return '💬';
            case 'DELETED': return '🗑️';
            case 'PRIORITY_CHANGED': return '⚡';
            case 'DUE_DATE_CHANGED': return '📅';
            default: return '📌';
        }
    };

    const getActivityColor = (activityType) => {
        switch (activityType) {
            case 'CREATED': return '#28a745';
            case 'UPDATED': return '#007bff';
            case 'STATUS_CHANGED': return '#17a2b8';
            case 'ASSIGNED': return '#6f42c1';
            case 'UNASSIGNED': return '#6c757d';
            case 'COMMENT_ADDED': return '#fd7e14';
            case 'DELETED': return '#dc3545';
            case 'PRIORITY_CHANGED': return '#ffc107';
            case 'DUE_DATE_CHANGED': return '#20c997';
            default: return '#6c757d';
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="task-activity">
            <div className="activity-header">
                <h4>Activity Feed</h4>
                <button onClick={fetchActivities} className="refresh-btn" disabled={loading}>
                    🔄 Refresh
                </button>
            </div>

            {loading && (
                <div className="activity-loading">
                    <span>Loading activities...</span>
                </div>
            )}

            {error && (
                <div className="activity-error">
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && (
                <div className="activity-list">
                    {activities.length === 0 ? (
                        <div className="no-activities">
                            <p>No activities yet</p>
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div 
                                    className="activity-icon"
                                    style={{ backgroundColor: getActivityColor(activity.activityType) }}
                                >
                                    {getActivityIcon(activity.activityType)}
                                </div>
                                <div className="activity-content">
                                    <div className="activity-description">
                                        <strong>{activity.user?.username || 'Unknown'}</strong>
                                        <span> {activity.description}</span>
                                    </div>
                                    <div className="activity-meta">
                                        <span className="activity-time">
                                            {formatDate(activity.createdAt)}
                                        </span>
                                        <span className="activity-type">
                                            {activity.activityType?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {activity.oldValue && activity.newValue && (
                                        <div className="activity-changes">
                                            <span className="old-value">{activity.oldValue}</span>
                                            <span className="arrow">→</span>
                                            <span className="new-value">{activity.newValue}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskActivity;