import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createProject, getProjects, getProjectById, addMember, updateProject, deleteProject } from '../controllers/project.controller.js';

const router = express.Router();

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.post('/:id/members', protect, addMember);

export default router;
