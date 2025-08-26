import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableTaskItem = ({ task, onClick, canMove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    disabled: !canMove
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return '#ff4757';
      case 'MEDIUM': return '#ffa502';
      case 'LOW': return '#2ed573';
      default: return '#747d8c';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'dragging' : ''} ${canMove ? 'draggable' : ''}`}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <span 
          className={`priority-badge ${task.priority.toLowerCase()}`}
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        >
          {task.priority}
        </span>
      </div>

      <p className="task-description">
        {task.description && task.description.length > 100
          ? `${task.description.substring(0, 100)}...`
          : task.description || 'No description'}
      </p>

      <div className="task-meta">
        <div className="assignee">
          <span className="meta-label">Assigned to:</span>
          <span className="meta-value">
            {task.assignee ? task.assignee.username : 'Unassigned'}
          </span>
        </div>
        
        <div className="task-dates">
          <div className="created-date">
            <span className="meta-label">Created:</span>
            <span className="meta-value">{formatDate(task.createdAt)}</span>
          </div>
          {task.updatedAt && task.updatedAt !== task.createdAt && (
            <div className="updated-date">
              <span className="meta-label">Updated:</span>
              <span className="meta-value">{formatDate(task.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {canMove && (
        <div className="drag-indicator">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 6a1 1 0 110-2 1 1 0 010 2zM3 8a1 1 0 110-2 1 1 0 010 2zM4 11a1 1 0 11-2 0 1 1 0 012 0zM8 6a1 1 0 110-2 1 1 0 010 2zM8 8a1 1 0 110-2 1 1 0 010 2zM9 11a1 1 0 11-2 0 1 1 0 012 0zM13 6a1 1 0 110-2 1 1 0 010 2zM13 8a1 1 0 110-2 1 1 0 010 2zM14 11a1 1 0 11-2 0 1 1 0 012 0z"/>
          </svg>
        </div>
      )}

      <div className="task-creator">
        <span className="meta-label">Created by:</span>
        <span className="meta-value">{task.creator?.username || 'Unknown'}</span>
      </div>
    </div>
  );
};

export default SortableTaskItem;