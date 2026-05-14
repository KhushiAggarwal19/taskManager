import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, status, assignee } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Verify user is member of project
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      status,
      assignee,
      lastModifiedBy: req.user._id,
      project: projectId,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('lastModifiedBy', 'name');
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email')
      .populate('lastModifiedBy', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.status = status;
    task.lastModifiedBy = req.user._id;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('lastModifiedBy', 'name');
    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { ...req.body, lastModifiedBy: req.user._id },
      { new: true }
    )
      .populate('assignee', 'name email')
      .populate('lastModifiedBy', 'name');
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!project.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Task.findByIdAndDelete(taskId);
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
