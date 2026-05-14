import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createTask, getTasks, updateTaskStatus, updateTask, deleteTask } from '../controllers/task.controller.js';

const router = express.Router({ mergeParams: true });

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.route('/:taskId')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.patch('/:taskId/status', protect, updateTaskStatus);

export default router;
