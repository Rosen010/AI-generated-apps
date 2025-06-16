export class UIManager
{
    static showValidationErrors(errors, parentElement)
    {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'validation-errors';
        errorContainer.innerHTML = errors.map(error => `<p>${error}</p>`).join('');

        const existing = parentElement.querySelector('.validation-errors');
        if (existing) existing.remove();

        parentElement.insertBefore(errorContainer, parentElement.firstChild);
        setTimeout(() => errorContainer.remove(), 3000);
    }

    static updateViewVisibility(viewId)
    {
        document.querySelectorAll('.view').forEach(view =>
        {
            view.classList.toggle('active', view.id === `${viewId}-view`);
        });
    }

    static updateNavigation(activeId)
    {
        document.querySelectorAll('.nav-button').forEach(button =>
        {
            button.classList.toggle('active', button.dataset.view === activeId);
        });
    }
}
