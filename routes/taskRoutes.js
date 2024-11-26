const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Create a new task (protected)
router.post('/', authMiddleware, async (req, res) => {
    try {
        // Use req.user.id from the authMiddleware to associate the task with the logged-in user
        const task = await Task.create({ ...req.body, user: req.user.id }); 
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all tasks for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// router.get("/", authMiddleware, async (req, res) => {
//     const { priority, dueDate, search } = req.query;
//     const filter = { userId: req.user.id };

//     // Filter by priority if provided
//     if (priority) {
//         filter.priority = priority;
//     }

//     // Filter by due date if provided
//     if (dueDate) {
//         filter.deadline = { $lte: new Date(dueDate) };
//     }

//     // Search by title or description if provided
//     if (search) {
//         filter.$or = [
//             { title: { $regex: search, $options: "i" } }, // Case-insensitive
//             { description: { $regex: search, $options: "i" } }
//         ];
//     }

//     try {
//         const tasks = await Task.find(filter).sort({ deadline: 1 }); // Sort by closest due date
//         res.json(tasks);
//     } catch (error) {
//         console.error("Error fetching tasks:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });


// Update a task (protected)
router.put('/:id', authMiddleware, async (req, res) => {
    const { title, description, priority, deadline } = req.body;

    try {
        // Find the task by ID
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the user is the task owner
        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update the task
        task.title = title || task.title;
        task.description = description || task.description;
        task.priority = priority || task.priority;
        task.deadline = deadline || task.deadline;

        await task.save();
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).send({ message: "Task not found" });
        res.status(200).send({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting task" });
    }
});


module.exports = router;
