import { StorageService } from './storage.js';
import { ValidationService } from './validation.js';

export class TaskManager
{
    constructor()
    {
        this.tasks = StorageService.getTasks();
        this.form = document.getElementById('task-form');
        this.taskList = document.querySelector('.task-list');
        this.editingTaskId = null;
        this.activeTaskId = StorageService.getActiveTask();
        this.onActiveTaskChange = null;

        this.refreshTaskList();
        this.bindEvents();
    }

    bindEvents()
    {
        this.form.addEventListener('submit', (e) =>
        {
            e.preventDefault();
            if (this.editingTaskId)
            {
                this.updateTask();
            }
            else
            {
                this.addTask();
            }
        });
    }

    addTask()
    {
        const task = {
            id: Date.now(),
            title: document.getElementById('task-title').value.trim(),
            estimatedPomodoros: parseInt(document.getElementById('estimated-pomodoros').value),
            priority: document.getElementById('task-priority').value,
            completedPomodoros: 0,
            completed: false,
            createdAt: new Date()
        };

        const errors = ValidationService.validateTask(task);
        if (errors.length > 0)
        {
            this.showValidationErrors(errors);
            return false;
        }

        this.tasks.push(task);
        this.refreshTaskList();
        StorageService.saveTasks(this.tasks);
        return true;
    }

    renderTask(task)
    {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item priority-${task.priority} ${task.id === this.activeTaskId ? 'active' : ''}`;
        taskElement.dataset.taskId = task.id;
        taskElement.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-details">
                    <h3 class="task-title ${task.completed ? 'completed' : ''}">${task.title}</h3>
                    <div class="task-meta">
                        <div class="pomodoro-progress">
                            ${this.renderPomodoroCircles(task)}
                        </div>
                        <span class="priority-badge">${task.priority.toUpperCase()}</span>
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="start-task ${task.id === this.activeTaskId ? 'active' : ''}">
                    ${task.id === this.activeTaskId ? 'Active' : 'Start'}
                </button>
                <button class="edit-task">Edit</button>
                <button class="delete-task">Delete</button>
            </div>
        `;

        this.setupTaskEvents(taskElement, task);
        this.taskList.appendChild(taskElement);
    }

    renderPomodoroCircles(task)
    {
        const circles = [];
        for (let i = 0; i < task.estimatedPomodoros; i++)
        {
            const className = i < task.completedPomodoros ? 'completed' : '';
            circles.push(`<span class="pomodoro-circle ${className}"></span>`);
        }
        return circles.join('');
    }

    setupTaskEvents(taskElement, task)
    {
        const checkbox = taskElement.querySelector('.task-checkbox');
        const editBtn = taskElement.querySelector('.edit-task');
        const deleteBtn = taskElement.querySelector('.delete-task');
        const startBtn = taskElement.querySelector('.start-task');

        checkbox.addEventListener('change', () => this.toggleTaskComplete(task.id));
        editBtn.addEventListener('click', () => this.editTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        startBtn.addEventListener('click', () => this.setActiveTask(task.id));
    }

    toggleTaskComplete(taskId)
    {
        const task = this.tasks.find(t => t.id === taskId);
        if (task)
        {
            task.completed = !task.completed;
            this.refreshTaskList();
        }
    }

    editTask(taskId)
    {
        const task = this.tasks.find(t => t.id === taskId);
        if (task)
        {
            this.editingTaskId = taskId;
            document.getElementById('task-title').value = task.title;
            document.getElementById('estimated-pomodoros').value = task.estimatedPomodoros;
            document.getElementById('task-priority').value = task.priority;

            // Change button text to indicate editing
            const submitBtn = this.form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Task';
        }
    }

    updateTask()
    {
        const title = document.getElementById('task-title').value;
        const estimatedPomodoros = parseInt(document.getElementById('estimated-pomodoros').value);
        const priority = document.getElementById('task-priority').value;

        const taskIndex = this.tasks.findIndex(t => t.id === this.editingTaskId);
        if (taskIndex !== -1)
        {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                title,
                estimatedPomodoros,
                priority
            };
        }

        this.editingTaskId = null;
        const submitBtn = this.form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Add Task';

        this.form.reset();
        this.refreshTaskList();
        StorageService.saveTasks(this.tasks);
    }

    deleteTask(taskId)
    {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.refreshTaskList();
        StorageService.saveTasks(this.tasks);
    }

    refreshTaskList()
    {
        this.taskList.innerHTML = '';
        this.tasks.forEach(task => this.renderTask(task));
    }

    setActiveTask(taskId)
    {
        this.activeTaskId = taskId;
        if (this.onActiveTaskChange)
        {
            const activeTask = this.tasks.find(t => t.id === taskId);
            this.onActiveTaskChange(activeTask);
        }
        this.refreshTaskList();
        StorageService.saveActiveTask(taskId);
    }

    incrementPomodoro(taskId)
    {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.completedPomodoros < task.estimatedPomodoros)
        {
            task.completedPomodoros++;
            this.refreshTaskList();
            StorageService.saveTasks(this.tasks);
            return true;
        }
        return false;
    }

    showValidationErrors(errors)
    {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'validation-errors';
        errorContainer.innerHTML = errors.map(error => `<p>${error}</p>`).join('');

        const form = document.getElementById('task-form');
        const existingErrors = form.querySelector('.validation-errors');
        if (existingErrors)
        {
            existingErrors.remove();
        }
        form.insertBefore(errorContainer, form.firstChild);

        setTimeout(() => errorContainer.remove(), 3000);
    }
}
