export class StorageService
{
    static KEYS = {
        TASKS: 'focustodo_tasks',
        TIMER_STATE: 'focustodo_timer',
        ACTIVE_TASK: 'focustodo_active_task',
        STATS: 'focustodo_stats'
    };

    static saveTasks(tasks)
    {
        localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
    }

    static getTasks()
    {
        const tasks = localStorage.getItem(this.KEYS.TASKS);
        return tasks ? JSON.parse(tasks) : [];
    }

    static saveTimerState(timerState)
    {
        localStorage.setItem(this.KEYS.TIMER_STATE, JSON.stringify(timerState));
    }

    static getTimerState()
    {
        const state = localStorage.getItem(this.KEYS.TIMER_STATE);
        return state ? JSON.parse(state) : null;
    }

    static saveActiveTask(taskId)
    {
        localStorage.setItem(this.KEYS.ACTIVE_TASK, taskId);
    }

    static getActiveTask()
    {
        return localStorage.getItem(this.KEYS.ACTIVE_TASK);
    }

    static saveStats(stats)
    {
        localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
    }

    static getStats()
    {
        const stats = localStorage.getItem(this.KEYS.STATS);
        return stats ? JSON.parse(stats) : null;
    }
}
