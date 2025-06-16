import { StorageService } from './storage.js';

export class ReportsService
{
    constructor()
    {
        this.stats = StorageService.getStats() || {
            dailyPomodoros: {},
            totalPomodoros: 0,
            totalFocusTime: 0
        };
    }

    recordPomodoro()
    {
        const today = new Date().toISOString().split('T')[0];
        this.stats.dailyPomodoros[today] = (this.stats.dailyPomodoros[today] || 0) + 1;
        this.stats.totalPomodoros++;
        this.stats.totalFocusTime += 25; // minutes
        this.saveStats();
    }

    getWeeklyStats()
    {
        const last7Days = Array.from({ length: 7 }, (_, i) =>
        {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => ({
            date,
            count: this.stats.dailyPomodoros[date] || 0
        }));
    }

    getDailyStats()
    {
        const today = new Date().toISOString().split('T')[0];
        return {
            today: this.stats.dailyPomodoros[today] || 0,
            total: this.stats.totalPomodoros,
            totalHours: Math.round(this.stats.totalFocusTime / 60)
        };
    }

    saveStats()
    {
        StorageService.saveStats(this.stats);
    }

    getDetailedStats()
    {
        const today = new Date().toISOString().split('T')[0];
        const weeklyData = this.getWeeklyStats();

        return {
            today: {
                pomodoros: this.stats.dailyPomodoros[today] || 0,
                focusHours: ((this.stats.dailyPomodoros[today] || 0) * 25) / 60,
                completedTasks: this.getCompletedTasksCount(today)
            },
            weekly: {
                data: weeklyData,
                total: weeklyData.reduce((sum, day) => sum + day.count, 0),
                average: (weeklyData.reduce((sum, day) => sum + day.count, 0) / 7).toFixed(1),
                bestDay: this.getBestDay(weeklyData)
            },
            overall: {
                totalPomodoros: this.stats.totalPomodoros,
                totalHours: Math.round(this.stats.totalFocusTime / 60),
                averageDaily: this.calculateAverageDaily()
            }
        };
    }

    getBestDay(weeklyData)
    {
        return weeklyData.reduce((best, current) =>
            current.count > (best?.count || 0) ? current : best, null);
    }

    calculateAverageDaily()
    {
        const dates = Object.keys(this.stats.dailyPomodoros);
        if (dates.length === 0) return 0;
        const total = dates.reduce((sum, date) => sum + this.stats.dailyPomodoros[date], 0);
        return (total / dates.length).toFixed(1);
    }
}
