const express = require('express');
const router = express.Router();
const { Task } = require('../models');
const verifyToken = require('../middleware/auth');

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the authenticated user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - dueDate
 *             properties:
 *               text:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { text, dueDate } = req.body;
    if (!text || !dueDate) {
      return res.status(400).json({ message: 'Text and dueDate are required' });
    }

    const task = await Task.create({
      text,
      dueDate,
      userId: req.userId
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, dueDate, completed } = req.body;

    const task = await Task.findOne({
      where: { id, userId: req.userId }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.update({
      text: text || task.text,
      dueDate: dueDate || task.dueDate,
      completed: completed !== undefined ? completed : task.completed
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      where: { id, userId: req.userId }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

module.exports = router; 