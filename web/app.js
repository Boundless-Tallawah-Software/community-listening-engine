/**
 * Digital Atelier - Community Listening Engine Frontend Logic
 * Handles view switching, API fetching, and UI rendering.
 * @author Zoo
 * @last_updated 2026-09-01
 */

document.addEventListener('DOMContentLoaded', () => {
    const views = document.querySelectorAll('.view');
    const navButtons = document.querySelectorAll('.nav-btn');
    const apiBaseUrl = window.location.origin; // Assumes API is served from the same origin

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

    // Attach event listeners to navigation buttons
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
            const data = await response.json();
            
            // Update stats
            document.getElementById('total-messages').textContent = data.total_messages.toLocaleString();
            document.getElementById('total-insights').textContent = data.total_insights.toLocaleString();
            document.getElementById('active-users').textContent = data.active_users.toLocaleString();

            // 2. Load Activity
            await renderActivityList();
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            document.getElementById('activity-list').innerHTML = '<p class="body-md" style="color: var(--color-error); font-style: italic;">Could not connect to API services. Is the backend running?</p>';
        }
    };

    const renderActivityList = async () => {
        const listElement = document.getElementById('activity-list');
        listElement.innerHTML = '<p class="body-md">Fetching recent activity...</p>';
        
        // Fetching recent activity (mocking the endpoint for now)
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockActivities = [
            { sender: "user@example.com", type: "text", content: "Can you send the quarterly report by EOD?", timestamp: "2 minutes ago" },
            { sender: "client@corp.com", type: "audio", content: "Voice note attached.", timestamp: "1 hour ago" },
            { sender: "user@example.com", type: "text", content: "Thanks, I'll review it.", timestamp: "3 hours ago" }
        ];

        listElement.innerHTML = '';
        mockActivities.forEach(activity => {
            const messageHtml = `
                <div class="message-bubble received">
                    <p class="body-md">${activity.content}</p>
                    <span class="message-meta">${activity.sender} • ${activity.timestamp}</span>
                </div>
            `;
            listElement.innerHTML += messageHtml;
        });
    };

    // --- Messages View Logic ---
    const loadMessages = async () => {
        const listElement = document.getElementById('messages-list');
        listElement.innerHTML = '<p class="body-md">Loading messages...</p>';

        try {
            const response = await fetch(`${apiBaseUrl}/api/v1/messages`);
            const messages = await response.json();

            listElement.innerHTML = '';
            messages.forEach(message => {
                const bubbleClass = message.type === 'text' ? 'received' : 'sent'; // Simple logic for demo
                const messageHtml = `
                    <div class="message-bubble ${bubbleClass}">
                        <p class="body-md">${message.content}</p>
                        <span class="message-meta">${message.sender} • ${message.timestamp}</span>
                    </div>
                `;
                listElement.innerHTML += messageHtml;
            });
        } catch (error) {
            console.error("Failed to load messages:", error);
            listElement.innerHTML = '<p class="body-md" style="color: var(--color-error); font-style: italic;">Could not load messages. Check API connectivity.</p>';
        }
    };

    // --- Insights View Logic ---
    const loadInsights = async () => {
        const listElement = document.getElementById('insights-list');
        listElement.innerHTML = '<p class="body-md">Loading insights...</p>';

        try {
            const response = await fetch(`${apiBaseUrl}/api/v1/insights`);
            const insights = await response.json();

            listElement.innerHTML = '';
            insights.forEach(insight => {
                const sentimentColor = insight.sentiment === 'Positive' ? 'var(--color-tertiary)' :
                                       insight.sentiment === 'Negative' ? 'var(--color-error)' : 'var(--color-primary)';
                
                const insightHtml = `
                    <div class="message-bubble received" style="border-left: 4px solid ${sentimentColor};">
                        <div class="message-meta" style="color: var(--color-on-surface); font-weight: 600;">Source: ${insight.source} | Topic: ${insight.topic}</div>
                        <p class="body-md">${insight.summary}</p>
                        <span class="message-meta" style="color: ${sentimentColor};">${insight.sentiment} Sentiment</span>
                    </div>
                `;
                listElement.innerHTML += insightHtml;
            });
        } catch (error) {
            console.error("Failed to load insights:", error);
            listElement.innerHTML = '<p class="body-md" style="color: var(--color-error); font-style: italic;">Could not load insights. Check API connectivity.</p>';
        }
    };

    // --- Initialization ---
    // Start by loading the default view (Dashboard)
    switchView('dashboard');
});
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

    // Attach event listeners to navigation buttons
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
            const response = await fetch(`${apiBaseUrl}/webhooks/stats`);
            const data = await response.json();
            
            // Mocking data based on the structure of the /webhooks/stats endpoint
            document.getElementById('total-messages').textContent = '1,234'; 
            document.getElementById('total-insights').textContent = '890';
            document.getElementById('active-users').textContent = '45';

            // 2. Load Activity
            await renderActivityList();
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            document.getElementById('activity-list').innerHTML = '<p class="body-md" style="color: var(--color-error); font-style: italic;">Could not connect to API services. Is the backend running?</p>';
        }
    };

    const renderActivityList = async () => {
        const listElement = document.getElementById('activity-list');
        listElement.innerHTML = '<p class="body-md">Fetching recent activity...</p>';
        
        // In a real scenario, we'd call a dedicated /activity endpoint.
        // For now, we'll simulate fetching the last 5 interactions.
        await new Promise(resolve => setTimeout(resolve, 500)); 

        const mockActivities = [
            { sender: "user@example.com", type: "text", content: "Can you send the quarterly report by EOD?", timestamp: "2 minutes ago" },
            { sender: "client@corp.com", type: "audio", content: "Voice note attached.", timestamp: "1 hour ago" },
            { sender: "user@example.com", type: "text", content: "Thanks, I'll review it.", timestamp: "3 hours ago" }
        ];

        listElement.innerHTML = '';
        mockActivities.forEach(activity => {
            const messageHtml = `
                <div class="message-bubble received">
                    <p class="body-md">${activity.content}</p>
                    <span class="message-meta">${activity.sender} • ${activity.timestamp}</span>
                </div>
            `;
            listElement.innerHTML += messageHtml;
        });
    };

    // --- Messages View Logic ---
    const loadMessages = async () => {
        const listElement = document.getElementById('messages-list');
        listElement.innerHTML = '<p class="body-md">Loading messages...</p>';

        // Simulate fetching messages
        await new Promise(resolve => setTimeout(resolve, 500)); 

        const mockMessages = [
            { sender: "user@example.com", type: "text", content: "Hello, how is the listening engine working?", timestamp: "Just now" },
            { sender: "client@corp.com", type: "audio", content: "Voice note attached.", timestamp: "5 minutes ago" },
            { sender: "user@example.com", type: "text", content: "The API documentation looks great!", timestamp: "1 day ago" }
        ];

        listElement.innerHTML = '';
        mockMessages.forEach(message => {
            const bubbleClass = message.type === 'text' ? 'received' : 'sent'; // Simple logic for demo
            const messageHtml = `
                <div class="message-bubble ${bubbleClass}">
                    <p class="body-md">${message.content}</p>
                    <span class="message-meta">${message.sender} • ${message.timestamp}</span>
                </div>
            `;
            listElement.innerHTML += messageHtml;
        });
    };

    // --- Insights View Logic ---
    const loadInsights = async () => {
        const listElement = document.getElementById('insights-list');
        listElement.innerHTML = '<p class="body-md">Loading insights...</p>';

        // Simulate fetching insights
        await new Promise(resolve => setTimeout(resolve, 500)); 

        const mockInsights = [
            { source: "user@example.com", topic: "Quarterly Report", sentiment: "Positive", summary: "User requested the Q3 report, indicating high interest in financial performance." },
            { source: "client@corp.com", topic: "Feature Request", sentiment: "Neutral", summary: "Client mentioned needing integration with a third-party CRM system." },
            { source: "user@example.com", topic: "Technical Support", sentiment: "Negative", summary: "User reported difficulty accessing the dashboard on mobile devices." }
        ];

        listElement.innerHTML = '';
        mockInsights.forEach(insight => {
            const sentimentColor = insight.sentiment === 'Positive' ? 'var(--color-tertiary)' : 
                                   insight.sentiment === 'Negative' ? 'var(--color-error)' : 'var(--color-primary)';
            
            const insightHtml = `
                <div class="message-bubble received" style="background-color: var(--color-surface-container-highest); border-left: 4px solid ${sentimentColor};">
                    <div class="message-meta" style="color: var(--color-on-surface); font-weight: 600;">Source: ${insight.source} | Topic: ${insight.topic}</div>
                    <p class="body-md">${insight.summary}</p>
                    <span class="message-meta" style="color: ${sentimentColor};">${insight.sentiment} Sentiment</span>
                </div>
            `;
            listElement.innerHTML += insightHtml;
        });
    };

    // --- Initialization ---
    // Start by loading the default view (Dashboard)
    switchView('dashboard');
});