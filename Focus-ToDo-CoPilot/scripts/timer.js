import { StorageService } from './storage.js';
import { ValidationService } from './validation.js';

export class Timer
{
    constructor(taskManager, reportsService, notificationService)
    {
        // Session configurations
        this.sessionTypes = {
            focus: { minutes: 25, label: 'Focus Time' },
            shortBreak: { minutes: 5, label: 'Short Break' },
            longBreak: { minutes: 15, label: 'Long Break' }
        };

        this.currentSessionType = 'focus';
        this.pomodoroCount = 0;
        this.sessionsUntilLongBreak = 4;

        this.timeLeft = this.sessionTypes[this.currentSessionType].minutes * 60;
        this.isRunning = false;
        this.timerId = null;
        this.onTick = null;
        this.onComplete = null;

        // DOM elements
        this.minutesEl = document.querySelector('.minutes');
        this.secondsEl = document.querySelector('.seconds');
        this.startBtn = document.getElementById('start');
        this.pauseBtn = document.getElementById('pause');
        this.resetBtn = document.getElementById('reset');
        this.sessionLabel = document.querySelector('.session-type');
        this.sessionCount = document.querySelector('.session-count');

        this.taskManager = taskManager;
        this.reportsService = reportsService;
        this.notificationService = notificationService;

        this.bindEvents();
        this.updateDisplay();
        this.updateSessionInfo();
        this.loadState();
    }

    bindEvents()
    {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    loadState()
    {
        const savedState = StorageService.getTimerState();
        if (savedState)
        {
            this.timeLeft = savedState.timeLeft;
            this.currentSessionType = savedState.sessionType;
            this.pomodoroCount = savedState.pomodoroCount;
            this.updateDisplay();
            this.updateSessionInfo();
        }
    }

    saveState()
    {
        const state = {
            timeLeft: this.timeLeft,
            sessionType: this.currentSessionType,
            pomodoroCount: this.pomodoroCount
        };
        StorageService.saveTimerState(state);
    }

    start()
    {
        if (this.isRunning) return;

        const errors = ValidationService.validateTimerState(this.timeLeft, this.currentSessionType);
        if (errors.length > 0)
        {
            console.error('Timer validation failed:', errors);
            this.reset();
            return;
        }

        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;

        this.timerId = setInterval(() =>
        {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft === 0)
            {
                this.complete();
            }
        }, 1000);

        this.notificationService.playSound('start');
        this.saveState();
    }

    pause()
    {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        clearInterval(this.timerId);

        this.saveState();
    }

    switchSession(sessionType)
    {
        this.currentSessionType = sessionType;
        this.timeLeft = this.sessionTypes[sessionType].minutes * 60;
        this.updateDisplay();
        this.updateSessionInfo();
    }

    complete()
    {
        this.pause();

        const nextSession = this.currentSessionType === 'focus' ? 'break' : 'focus';
        const message = `Time for a ${nextSession}!`;

        this.notificationService.notify('Session Complete', {
            body: message,
            requireInteraction: true
        });

        if (this.currentSessionType === 'focus' && this.taskManager.activeTaskId)
        {
            this.taskManager.incrementPomodoro(this.taskManager.activeTaskId);
        }

        if (this.currentSessionType === 'focus')
        {
            this.pomodoroCount++;

            if (this.pomodoroCount % this.sessionsUntilLongBreak === 0)
            {
                this.switchSession('longBreak');
            } else
            {
                this.switchSession('shortBreak');
            }
        } else
        {
            this.switchSession('focus');
        }

        if (this.onComplete)
        {
            this.onComplete(this.currentSessionType);
        }

        if (this.currentSessionType === 'focus')
        {
            this.reportsService.recordPomodoro();
        }

        this.saveState();
    }

    updateSessionInfo()
    {
        this.sessionLabel.textContent = this.sessionTypes[this.currentSessionType].label;
        this.sessionCount.textContent = `#${this.pomodoroCount + 1}`;
    }

    reset()
    {
        this.pause();
        this.switchSession('focus');
        this.pomodoroCount = 0;
        this.updateSessionInfo();
    }

    updateDisplay()
    {
        try
        {
            const minutes = Math.max(0, Math.floor(this.timeLeft / 60));
            const seconds = Math.max(0, this.timeLeft % 60);

            this.minutesEl.textContent = minutes.toString().padStart(2, '0');
            this.secondsEl.textContent = seconds.toString().padStart(2, '0');
        } catch (error)
        {
            console.error('Display update failed:', error);
            this.reset();
        }

        if (this.onTick)
        {
            this.onTick(minutes, seconds);
        }
    }
}
