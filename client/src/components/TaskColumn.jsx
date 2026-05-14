import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const TaskColumn = ({ id, title, tasks, onTaskClick }) => {
  const { setNodeRef } = useDroppable({
    id: id,
    data: {
      type: 'Column',
      title: title,
    }
  });

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 w-full min-h-[500px]">
      <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex justify-between items-center">
        <span>{title}</span>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </h3>
      
      <div ref={setNodeRef} className="flex-1">
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default TaskColumn;
