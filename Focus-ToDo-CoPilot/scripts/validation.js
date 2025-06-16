export class ValidationService
{
    static validateTask(task)
    {
        const errors = [];

        if (!task.title?.trim())
        {
            errors.push('Task title is required');
        }

        if (task.estimatedPomodoros < 1 || task.estimatedPomodoros > 12)
        {
            errors.push('Estimated pomodoros must be between 1 and 12');
        }

        if (!['p1', 'p2', 'p3', 'p4'].includes(task.priority))
        {
            errors.push('Invalid priority level');
        }

        return errors;
    }

    static validateTimerState(timeLeft, sessionType)
    {
        const errors = [];

        if (timeLeft < 0 || timeLeft > 3600)
        {
            errors.push('Invalid timer duration');
        }

        if (!['focus', 'shortBreak', 'longBreak'].includes(sessionType))
        {
            errors.push('Invalid session type');
        }

        return errors;
    }
}
