document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('prospectForm');
    const successMessage = document.getElementById('successMessage');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Gather form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Add timestamp
        data.created_at = new Date().toISOString();

        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            // Send data to API
            const response = await fetch('/api/prospects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Hide form and show success message
                form.style.display = 'none';
                successMessage.style.display = 'block';
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to submit form');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting form. Please try again.');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Conversation';
        }
    });

    // Add form validation visual feedback
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() !== '' && this.checkValidity()) {
                this.style.borderColor = 'var(--tertiary-container)';
            } else if (this.value.trim() !== '' && !this.checkValidity()) {
                this.style.borderColor = 'var(--error)';
            } else {
                this.style.borderColor = 'var(--outline-variant)';
            }
        });

        input.addEventListener('input', function() {
            if (this.style.borderColor === 'var(--error)' && this.checkValidity()) {
                this.style.borderColor = 'var(--tertiary-container)';
            }
        });
    });
});