import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTaskItem from './SortableTaskItem';

const DroppableColumn = ({ status, title, tasks, onTaskClick, canMove }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  const style = {
    backgroundColor: isOver ? 'rgba(102, 126, 234, 0.1)' : undefined,
    transition: 'background-color 0.3s ease',
  };

  return (
    <div className="status-column" data-status={status}>
      <div className="status-header">
        <h3>{title}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>
      
      <SortableContext 
        items={tasks.map(task => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div 
          ref={setNodeRef}
          className="tasks-list"
          data-status={status}
          style={{
            ...style,
            minHeight: '200px',
            padding: '10px',
            borderRadius: '10px',
          }}
        >
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              canMove={canMove}
            />
          ))}
          {tasks.length === 0 && (
            <div className="empty-column">
              <p>No tasks in {title.toLowerCase()}</p>
              {isOver && <p style={{ color: '#667eea', fontWeight: 'bold' }}>Drop task here</p>}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default DroppableColumn;