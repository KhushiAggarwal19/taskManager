import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User } from 'lucide-react';

const priorityColors = {
  Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const timeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const TaskCard = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        {task.dueDate && (
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        {task.assignee && (
          <div className="flex items-center space-x-1 ml-auto">
            <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs">
              {task.assignee.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
      {task.lastModifiedBy && (
        <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center text-[11px] text-gray-400 dark:text-gray-500">
          <User size={12} className="mr-1 flex-shrink-0" />
          <span className="truncate">
            {task.lastModifiedBy.name} · {timeAgo(task.updatedAt)}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
