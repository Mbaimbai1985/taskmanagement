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

  const handleTaskClick = (e) => {
    if (!isDragging && onClick) {
      e.stopPropagation();
      onClick(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'dragging' : ''} ${canMove ? 'draggable' : ''}`}
      {...attributes}
    >
      <div className="task-content" onClick={handleTaskClick}>
        <div className="task-header">
          <h4 className="task-title">{task.title}</h4>
          <span 
            className={`priority-badge ${task.priority.toLowerCase()}`}
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
        </div>

        <p className="task-description">{task.description}</p>

        <div className="task-meta">
          <div className="assignee">
            <span className="meta-label">Assigned to:</span>
            <span className="meta-value">
              {task.assignee ? task.assignee.username : 'Unassigned'}
            </span>
          </div>

          <div className="task-dates">
            <span className="meta-label">Created:</span>
            <span className="meta-value">{formatDate(task.createdAt)}</span>
          </div>

          <div className="task-dates">
            <span className="meta-label">Updated:</span>
            <span className="meta-value">{formatDate(task.updatedAt)}</span>
          </div>
        </div>

        <div className="task-creator">
          <span className="meta-label">Created by:</span>
          <span className="meta-value">{task.user?.username || 'Unknown'}</span>
        </div>
      </div>

      {/* Drag handle (separate from clickable content) */}
      {canMove && (
        <div className="drag-handle" {...listeners}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 2C6 1.44772 6.44772 1 7 1C7.55228 1 8 1.44772 8 2C8 2.55228 7.55228 3 7 3C6.44772 3 6 2.55228 6 2Z" fill="#9CA3AF"/>
            <path d="M6 8C6 7.44772 6.44772 7 7 7C7.55228 7 8 7.44772 8 8C8 8.55228 7.55228 9 7 9C6.44772 9 6 8.55228 6 8Z" fill="#9CA3AF"/>
            <path d="M7 13C6.44772 13 6 13.4477 6 14C6 14.5523 6.44772 15 7 15C7.55228 15 8 14.5523 8 14C8 13.4477 7.55228 13 7 13Z" fill="#9CA3AF"/>
            <path d="M10 2C10 1.44772 10.4477 1 11 1C11.5523 1 12 1.44772 12 2C12 2.55228 11.5523 3 11 3C10.4477 3 10 2.55228 10 2Z" fill="#9CA3AF"/>
            <path d="M11 7C10.4477 7 10 7.44772 10 8C10 8.55228 10.4477 9 11 9C11.5523 9 12 8.55228 12 8C12 7.44772 11.5523 7 11 7Z" fill="#9CA3AF"/>
            <path d="M10 14C10 13.4477 10.4477 13 11 13C11.5523 13 12 13.4477 12 14C12 14.5523 11.5523 15 11 15C10.4477 15 10 14.5523 10 14Z" fill="#9CA3AF"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default SortableTaskItem;