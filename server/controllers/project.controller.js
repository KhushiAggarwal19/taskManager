import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

export const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id })
      .populate('owner', 'name email')
      .populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
      
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Check if user is a member
    if (!project.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can add members' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can update the project' });
    }

    const { title, description } = req.body;
    project.title = title || project.title;
    project.description = description !== undefined ? description : project.description;
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can delete the project' });
    }

    // Delete all tasks belonging to this project
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.json({ message: 'Project and its tasks deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

