/**
 * Community Listening Engine Frontend Logic
 * Handles view switching, API fetching, and UI rendering.
 * @author Zoo
 * @last_updated 2026-09-01
 */

document.addEventListener('DOMContentLoaded', () => {
    const views = document.querySelectorAll('.view');
    const navButtons = document.querySelectorAll('.nav-btn');
    const apiBaseUrl = window.location.origin; // Assumes API is served from the same origin
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);

    const setStatus = (id, state, label) => {
        const indicator = document.getElementById(id);
        if (!indicator) return;
        indicator.className = `status-indicator ${state}`;
        indicator.setAttribute('aria-label', label);
    };

    const switchView = (viewId) => {
        // Deactivate all views and buttons
        views.forEach(view => view.classList.remove('active'));
        navButtons.forEach(btn => btn.classList.remove('active'));

        // Activate the target view and button
        const targetView = document.getElementById(`${viewId}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }
        const targetButton = document.querySelector(`.nav-btn[data-view="${viewId}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
        
        // Load data specific to the view
        loadViewData(viewId);
    };
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const viewId = button.getAttribute('data-view');
            switchView(viewId);
        });
    });

    // --- 2. Data Loading Functions ---

    const loadViewData = async (viewId) => {
        try {
            switch (viewId) {
                case 'dashboard':
                    await loadDashboardData();
                    break;
                case 'messages':
                    await loadMessages();
                    break;
                case 'insights':
                    await loadInsights();
                    break;
            }
        } catch (error) {
            console.error("Error loading view data:", error);
            alert("Failed to load data. Check the console for details.");
        }
    };

    // --- Dashboard View Logic ---
    const loadDashboardData = async () => {
        // 1. Load Stats
        try {
            const response = await fetch(`${apiBaseUrl}/api/v1/dashboard/stats`);
            if (!response.ok) throw new Error('Could not load dashboard stats.');
            const data = await response.json();

            setStatus('status-api', 'good', 'Operational');
            setStatus('status-database', 'good', 'Operational');
            
            document.getElementById('total-messages').textContent = data.total_messages.toLocaleString();
            document.getElementById('total-insights').textContent = data.total_insights.toLocaleString();
            document.getElementById('active-users').textContent = data.active_users.toLocaleString();

            // 2. Load Activity
            await renderActivityList();
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            setStatus('status-api', 'bad', 'Unavailable');
            setStatus('status-database', 'uncertain', 'Status uncertain');
            document.getElementById('activity-list').innerHTML = '<p class="body-md" style="color: var(--color-error); font-style: italic;">Could not connect to API services. Is the backend running?</p>';
        }
    };

    const renderActivityList = async () => {
        const listElement = document.getElementById('activity-list');
        listElement.innerHTML = '<p class="body-md">Fetching recent activity...</p>';
        const response = await fetch(`${apiBaseUrl}/api/v1/messages`);
        if (!response.ok) throw new Error('Could not load recent activity.');
        const activities = await response.json();
        listElement.innerHTML = '';
        activities.slice(0, 3).forEach(activity => {
            const messageHtml = `
                <div class="message-bubble received">
                    <p class="body-md">${escapeHtml(activity.content)}</p>
                    <span class="message-meta">${escapeHtml(activity.sender)} • ${escapeHtml(activity.timestamp)}</span>
                </div>
            `;
            listElement.innerHTML += messageHtml;
        });
    };

    // --- Messages View Logic ---
    const loadMessages = async () => {
        const listElement = document.getElementById('messages-list');
        listElement.innerHTML = '<p class="body-md">Loading messages...</p>';

        const response = await fetch(`${apiBaseUrl}/api/v1/messages`);
        if (!response.ok) throw new Error('Could not load messages.');
        const messages = await response.json();
        listElement.innerHTML = '';
        messages.forEach(message => {
            const bubbleClass = message.type === 'text' ? 'received' : 'sent'; // Simple logic for demo
            const messageHtml = `
                <div class="message-bubble ${bubbleClass}">
                    <p class="body-md">${escapeHtml(message.content)}</p>
                    <span class="message-meta">${escapeHtml(message.sender)} • ${escapeHtml(message.timestamp)}</span>
                </div>
            `;
            listElement.innerHTML += messageHtml;
        });
    };

    // --- Insights View Logic ---
    const loadInsights = async () => {
        const listElement = document.getElementById('insights-list');
        listElement.innerHTML = '<p class="body-md">Loading insights...</p>';

        const response = await fetch(`${apiBaseUrl}/api/v1/insights`);
        if (!response.ok) throw new Error('Could not load insights.');
        const insights = await response.json();
        listElement.innerHTML = '';
        insights.forEach(insight => {
            const sentimentColor = insight.sentiment === 'Positive' ? 'var(--color-tertiary)' : 
                                   insight.sentiment === 'Negative' ? 'var(--color-error)' : 'var(--color-primary)';
            
            const insightHtml = `
                <div class="message-bubble received" style="border-left: 4px solid ${sentimentColor};">
                    <div class="message-meta" style="color: var(--color-on-surface); font-weight: 600;">Source: ${escapeHtml(insight.source)} | Topic: ${escapeHtml(insight.topic)}</div>
                    <p class="body-md">${escapeHtml(insight.summary)}</p>
                    <span class="message-meta" style="color: ${sentimentColor};">${escapeHtml(insight.sentiment)} Sentiment</span>
                </div>
            `;
            listElement.innerHTML += insightHtml;
        });
    };

    // --- Initialization ---
    // Start by loading the default view (Dashboard)
    switchView('dashboard');
});