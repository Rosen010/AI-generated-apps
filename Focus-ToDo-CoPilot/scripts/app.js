import { Timer } from './timer.js';
import { TaskManager } from './tasks.js';
import { ReportsService } from './reports.js';
import { NotificationService } from './notifications.js';
import { UIManager } from './ui.js';

class FocusToDoApp
{
    constructor()
    {
        this.initializeServices();
        this.setupEventListeners();
    }

    initializeServices()
    {
        this.notifications = new NotificationService();
        this.reports = new ReportsService();
        this.tasks = new TaskManager(this.reports);
        this.timer = new Timer(this.tasks, this.reports, this.notifications);
    }

    setupEventListeners()
    {
        document.querySelectorAll('.nav-button').forEach(button =>
        {
            button.addEventListener('click', () =>
            {
                const viewId = button.dataset.view;
                UIManager.updateViewVisibility(viewId);
                UIManager.updateNavigation(viewId);
            });
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () =>
{
    new FocusToDoApp();
});

initializeTaskManager()
{
    this.taskManager = new TaskManager();
}

initializeReports()
{
    const reportView = document.getElementById('reports-view');
    this.updateReports();
    setInterval(() => this.updateReports(), 60000); // Update every minute
}

updateReports()
{
    const dailyStats = this.reportsService.getDailyStats();
    const weeklyStats = this.reportsService.getWeeklyStats();

    document.querySelector('.daily-summary .stats').innerHTML = `
            <div>Today's Pomodoros: ${dailyStats.today}</div>
            <div>Total Pomodoros: ${dailyStats.total}</div>
            <div>Total Focus Hours: ${dailyStats.totalHours}</div>
        `;

    this.renderWeeklyChart(weeklyStats);
}

renderWeeklyChart(weeklyStats)
{
    const maxCount = Math.max(...weeklyStats.map(d => d.count));
    const chart = document.querySelector('.weekly-report .chart');

    chart.innerHTML = weeklyStats.map(day => `
            <div class="chart-bar">
                <div class="bar" style="height: ${(day.count / maxCount) * 100}%"></div>
                <div class="date">${day.date.split('-')[2]}</div>
            </div>
        `).join('');
}

setupNavigation()
{
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button =>
    {
        button.addEventListener('click', () =>
        {
            this.switchView(button.dataset.view);
        });
    });
}

switchView(viewId)
{
    // Hide all views
    document.querySelectorAll('.view').forEach(view =>
    {
        view.classList.remove('active');
    });

    // Show selected view
    document.getElementById(`${viewId}-view`).classList.add('active');

    // Update navigation buttons
    document.querySelectorAll('.nav-button').forEach(button =>
    {
        button.classList.toggle('active', button.dataset.view === viewId);
    });

    this.currentView = viewId;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () =>
{
    new FocusToDoApp();
});
