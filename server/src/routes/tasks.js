import { Router } from 'express';
import Task from '../models/Task.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const EDITABLE = ['title', 'description', 'status', 'priority', 'dueDate'];

function pick(body) {
  return Object.fromEntries(EDITABLE.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));
}

// Users see their own tasks; admins see everyone's.
function scope(req) {
  return req.user.role === 'admin' ? {} : { owner: req.user._id };
}

router.get('/', async (req, res, next) => {
  try {
    const filter = { ...scope(req) };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.q) filter.title = { $regex: String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).populate('owner', 'name');
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const task = await Task.create({ ...pick(req.body), owner: req.user._id });
    res.status(201).json(await task.populate('owner', 'name'));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, ...scope(req) }, pick(req.body), {
      new: true,
      runValidators: true,
    }).populate('owner', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, ...scope(req) });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
