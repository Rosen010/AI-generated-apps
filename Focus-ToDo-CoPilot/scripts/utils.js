export const formatTime = (minutes, seconds) =>
{
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const getDateString = (date) =>
{
    return date.toISOString().split('T')[0];
};

export const debounce = (fn, delay) =>
{
    let timeoutId;
    return (...args) =>
    {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
