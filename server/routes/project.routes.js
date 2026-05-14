import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createProject, getProjects, getProjectById, addMember } from '../controllers/project.controller.js';

const router = express.Router();

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById);

router.post('/:id/members', protect, addMember);

export default router;
