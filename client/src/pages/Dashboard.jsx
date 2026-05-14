import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Folder, Pencil, Trash2 } from 'lucide-react';
import { api } from '../api';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const response = await api.projects.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setNewProjectTitle('');
    setNewProjectDesc('');
    setIsModalOpen(true);
  };

  const openEditModal = (e, project) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setNewProjectTitle(project.title);
    setNewProjectDesc(project.description || '');
    setIsModalOpen(true);
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await api.projects.update(editingProject._id, { title: newProjectTitle, description: newProjectDesc });
      } else {
        await api.projects.create({ title: newProjectTitle, description: newProjectDesc });
      }
      setIsModalOpen(false);
      setEditingProject(null);
      setNewProjectTitle('');
      setNewProjectDesc('');
      fetchProjects();
    } catch (error) {
      console.error('Failed to save project', error);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.projects.delete(projectId);
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Projects</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Folder className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project._id}
              to={`/project/${project._id}`}
              className="group relative block bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              {/* Edit/Delete buttons */}
              <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => openEditModal(e, project)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Edit project"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={(e) => handleDeleteProject(e, project._id)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Delete project"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pr-16">{project.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{project.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{project.members.length} member(s)</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <form onSubmit={handleSubmitProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingProject(null); }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  {editingProject ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
