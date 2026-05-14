import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, Users, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../api';
import TaskColumn from '../components/TaskColumn';
import TaskCard from '../components/TaskCard';

const ProjectView = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // for view/edit/delete
  const [isEditingTask, setIsEditingTask] = useState(false);
  
  // Form states
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo' });
  const [editTask, setEditTask] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [editProjectTitle, setEditProjectTitle] = useState('');
  const [editProjectDesc, setEditProjectDesc] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.projects.getById(id),
        api.tasks.getAll(id)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Failed to fetch project data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const overId = over.id;

    // Check if dropping on a column
    const isOverColumn = ['Todo', 'In Progress', 'Done'].includes(overId);
    
    let newStatus = null;
    if (isOverColumn) {
      newStatus = overId;
    } else {
      // Find the task we are dropping over to get its status
      const overTask = tasks.find(t => t._id === overId);
      if (overTask) newStatus = overTask.status;
    }

    const activeTaskData = tasks.find(t => t._id === taskId);
    if (newStatus && activeTaskData.status !== newStatus) {
      // Optimistic update
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      
      try {
        await api.tasks.updateStatus(id, taskId, newStatus);
      } catch (error) {
        console.error('Failed to update task status', error);
        fetchData(); // Revert on failure
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.tasks.create(id, newTask);
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'Medium', status: 'Todo' });
      fetchData();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setEditTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
    });
    setIsEditingTask(false);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await api.tasks.update(id, selectedTask._id, editTask);
      setSelectedTask(null);
      setIsEditingTask(false);
      fetchData();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await api.tasks.delete(id, selectedTask._id);
      setSelectedTask(null);
      fetchData();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.projects.addMember(id, newMemberEmail);
      setIsMemberModalOpen(false);
      setNewMemberEmail('');
      fetchData();
    } catch (error) {
      console.error('Failed to add member', error);
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      await api.projects.update(id, { title: editProjectTitle, description: editProjectDesc });
      setIsEditProjectModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to update project', error);
    }
  };

  const openEditProjectModal = () => {
    setEditProjectTitle(project.title);
    setEditProjectDesc(project.description || '');
    setIsEditProjectModalOpen(true);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!project) return <div>Project not found</div>;

  const columns = ['Todo', 'In Progress', 'Done'];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
          </div>
          <button
            onClick={openEditProjectModal}
            className="p-2 rounded-md text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Edit project"
          >
            <Pencil size={18} />
          </button>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            <Users size={20} />
            <span className="hidden sm:inline">Members ({project.members.length})</span>
          </button>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-[800px]">
            {columns.map(status => (
              <TaskColumn
                key={status}
                id={status}
                title={status}
                tasks={tasks.filter(t => t.status === status)}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail / Edit / Delete Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditingTask ? 'Edit Task' : 'Task Details'}
              </h2>
              <button
                onClick={() => { setSelectedTask(null); setIsEditingTask(false); }}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {isEditingTask ? (
              <form onSubmit={handleUpdateTask}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                      type="text" required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={editTask.title} onChange={e => setEditTask({...editTask, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows="3"
                      value={editTask.description} onChange={e => setEditTask({...editTask, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={editTask.priority} onChange={e => setEditTask({...editTask, priority: e.target.value})}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={editTask.status} onChange={e => setEditTask({...editTask, status: e.target.value})}
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setIsEditingTask(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">Save Changes</button>
                </div>
              </form>
            ) : (
              <div>
                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Title</span>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedTask.title}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Description</span>
                    <p className="text-gray-700 dark:text-gray-300">{selectedTask.description || 'No description'}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Priority</span>
                      <p className="text-gray-900 dark:text-white">{selectedTask.priority}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                      <p className="text-gray-900 dark:text-white">{selectedTask.status}</p>
                    </div>
                  </div>
                  {selectedTask.assignee && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Assignee</span>
                      <p className="text-gray-900 dark:text-white">{selectedTask.assignee.name}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={handleDeleteTask}
                    className="flex items-center space-x-1 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => setIsEditingTask(true)}
                    className="flex items-center space-x-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Member Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add Member</h2>
            <form onSubmit={handleAddMember}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Email</label>
                <input
                  type="email" required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-6"
                  value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsMemberModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditProjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Project</h2>
            <form onSubmit={handleEditProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={editProjectTitle} onChange={e => setEditProjectTitle(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  value={editProjectDesc} onChange={e => setEditProjectDesc(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsEditProjectModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;
