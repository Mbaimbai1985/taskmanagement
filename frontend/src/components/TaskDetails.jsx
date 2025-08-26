import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../api/ApiService';
import WebSocketService from '../services/WebSocketService';
import './TaskDetails.css';

const TaskDetails = ({ task, onClose, onTaskUpdate }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState({
    canComment: false,
    canUpdateTask: false,
    canDeleteTask: false,
    canMoveStatus: false
  });

  useEffect(() => {
    loadComments();
    loadPermissions();
    
    // Subscribe to WebSocket updates for this task
    const unsubscribe = WebSocketService.subscribeToTaskComments(task.id, handleCommentUpdate);
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [task.id]);

  const handleCommentUpdate = (update) => {
    // Refresh comments when we receive WebSocket updates
    loadComments();
  };

  const loadComments = async () => {
    try {
      const response = await ApiService.getTaskComments(task.id);
      if (response.statusCode === 200) {
        setComments(response.data || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      const [canComment, canUpdateTask, canDeleteTask, canMoveStatus] = await Promise.all([
        ApiService.canCommentOnTasks(),
        ApiService.canUpdateTasks(),
        ApiService.canDeleteTasks(),
        ApiService.canMoveTaskStatus()
      ]);

      setPermissions({
        canComment,
        canUpdateTask,
        canDeleteTask,
        canMoveStatus
      });
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await ApiService.addComment(task.id, newComment.trim());
      if (response.statusCode === 201) {
        setNewComment('');
        loadComments(); // Refresh comments
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    setLoading(true);
    try {
      const response = await ApiService.updateComment(commentId, editCommentText.trim());
      if (response.statusCode === 200) {
        setEditingComment(null);
        setEditCommentText('');
        loadComments(); // Refresh comments
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error updating comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    setLoading(true);
    try {
      const response = await ApiService.deleteComment(commentId);
      if (response.statusCode === 200) {
        loadComments(); // Refresh comments
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (comment) => {
    setEditingComment(comment.id);
    setEditCommentText(comment.comment);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditCommentText('');
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const taskUpdate = { ...task, status: newStatus };
      const response = await ApiService.updateTask(taskUpdate);
      if (response.statusCode === 200) {
        onTaskUpdate(response.data);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating task status. Please try again.');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'TODO': return 'status-todo';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'DONE': return 'status-done';
      default: return 'status-default';
    }
  };

  const handleEditTask = () => {
    navigate(`/tasks/edit/${task.id}`);
  };

  return (
    <div className="task-details-overlay">
      <div className="task-details-modal">
        <div className="task-details-header">
          <h2>{task.title}</h2>
          <div className="header-actions">
            {permissions.canUpdateTask && (
              <button className="edit-task-button" onClick={handleEditTask}>
                Edit Task
              </button>
            )}
            <button className="close-button" onClick={onClose}>&times;</button>
          </div>
        </div>

        <div className="task-details-content">
          <div className="task-info">
            <div className="task-meta">
              <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                {task.status}
              </span>
              <span className="priority-badge priority-{task.priority?.toLowerCase()}">
                {task.priority}
              </span>
            </div>
            
            <div className="task-description">
              <h4>Description</h4>
              <p>{task.description || 'No description provided'}</p>
            </div>

            <div className="task-assignee">
              <h4>Assignee</h4>
              <p>{task.assignee?.username || 'Unassigned'}</p>
            </div>

            <div className="task-dates">
              <small>
                Created: {formatTimestamp(task.createdAt)} | 
                Updated: {formatTimestamp(task.updatedAt)}
              </small>
            </div>

            {permissions.canMoveStatus && (
              <div className="status-controls">
                <h4>Change Status</h4>
                <div className="status-buttons">
                  <button 
                    className={`status-btn ${task.status === 'TODO' ? 'active' : ''}`}
                    onClick={() => handleStatusChange('TODO')}
                    disabled={task.status === 'TODO'}
                  >
                    To Do
                  </button>
                  <button 
                    className={`status-btn ${task.status === 'IN_PROGRESS' ? 'active' : ''}`}
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    disabled={task.status === 'IN_PROGRESS'}
                  >
                    In Progress
                  </button>
                  <button 
                    className={`status-btn ${task.status === 'DONE' ? 'active' : ''}`}
                    onClick={() => handleStatusChange('DONE')}
                    disabled={task.status === 'DONE'}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="comments-section">
            <h3>Comments ({comments.length})</h3>
            
            {permissions.canComment && (
              <form className="add-comment-form" onSubmit={handleAddComment}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  disabled={loading}
                />
                <button type="submit" disabled={!newComment.trim() || loading}>
                  {loading ? 'Adding...' : 'Add Comment'}
                </button>
              </form>
            )}

            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    editingComment={editingComment}
                    editCommentText={editCommentText}
                    onStartEdit={startEditing}
                    onCancelEdit={cancelEditing}
                    onSaveEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                    onEditTextChange={setEditCommentText}
                    loading={loading}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommentItem = ({ 
  comment, 
  editingComment, 
  editCommentText, 
  onStartEdit, 
  onCancelEdit, 
  onSaveEdit, 
  onDelete, 
  onEditTextChange, 
  loading 
}) => {
  const [permissions, setPermissions] = useState({
    canEdit: false,
    canDelete: false
  });

  useEffect(() => {
    loadCommentPermissions();
  }, [comment.username]);

  const loadCommentPermissions = async () => {
    try {
      const [canEdit, canDelete] = await Promise.all([
        ApiService.canEditComment(comment.username),
        ApiService.canDeleteComment(comment.username)
      ]);

      setPermissions({ canEdit, canDelete });
    } catch (error) {
      console.error('Error loading comment permissions:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  const isEditing = editingComment === comment.id;

  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="comment-author">{comment.username}</span>
        <span className="comment-date">{formatTimestamp(comment.createdAt)}</span>
        {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
          <span className="comment-edited">(edited {formatTimestamp(comment.updatedAt)})</span>
        )}
      </div>
      
      <div className="comment-content">
        {isEditing ? (
          <div className="edit-comment-form">
            <textarea
              value={editCommentText}
              onChange={(e) => onEditTextChange(e.target.value)}
              rows={3}
              disabled={loading}
            />
            <div className="edit-buttons">
              <button 
                onClick={() => onSaveEdit(comment.id)} 
                disabled={!editCommentText.trim() || loading}
                className="save-btn"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={onCancelEdit} 
                disabled={loading}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="comment-text">{comment.comment}</p>
            {(permissions.canEdit || permissions.canDelete) && (
              <div className="comment-actions">
                {permissions.canEdit && (
                  <button 
                    onClick={() => onStartEdit(comment)} 
                    className="edit-btn"
                    disabled={loading}
                  >
                    Edit
                  </button>
                )}
                {permissions.canDelete && (
                  <button 
                    onClick={() => onDelete(comment.id)} 
                    className="delete-btn"
                    disabled={loading}
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;