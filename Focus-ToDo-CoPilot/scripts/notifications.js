export class NotificationService
{
    constructor()
    {
        this.sounds = {
            finish: new Audio('assets/sounds/finish.mp3'),
            start: new Audio('assets/sounds/start.mp3')
        };
        this.notificationsEnabled = false;
        this.soundEnabled = true;
        this.init();
    }

    async init()
    {
        if ('Notification' in window)
        {
            const permission = await Notification.requestPermission();
            this.notificationsEnabled = permission === 'granted';
        }
    }

    playSound(type)
    {
        if (this.soundEnabled && this.sounds[type])
        {
            this.sounds[type].play().catch(err => console.log('Sound playback failed:', err));
        }
    }

    notify(title, options = {})
    {
        if (this.notificationsEnabled)
        {
            new Notification(title, {
                icon: 'assets/images/icon.png',
                ...options
            });
        }
        this.playSound('finish');
    }

    toggleSound()
    {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }
}
