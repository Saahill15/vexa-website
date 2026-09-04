// VEXA Digital - discovery note (not a paid booking flow)
// Primary path is Calendly. This only opens a partnerships email.

(function () {
    const form = document.getElementById('discoveryForm');
    if (!form) {
        return;
    }

    const PARTNERSHIPS_EMAIL = 'partnerships@vexadigital.in';

    function valueOf(id) {
        const field = document.getElementById(id);
        return field ? field.value.trim() : '';
    }

    function showError(field, message) {
        clearError(field);
        field.classList.add('error');
        const error = document.createElement('span');
        error.className = 'form-error';
        error.textContent = message;
        field.parentNode.appendChild(error);
    }

    function clearError(field) {
        field.classList.remove('error');
        const existing = field.parentNode.querySelector('.form-error');
        if (existing) {
            existing.remove();
        }
    }

    form.querySelectorAll('.form-input, .form-textarea').forEach(function (input) {
        input.addEventListener('input', function () {
            clearError(input);
        });
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const requiredIds = ['fullName', 'email', 'company', 'role', 'whyGaming', 'alreadyTried'];
        let valid = true;

        requiredIds.forEach(function (id) {
            const field = document.getElementById(id);
            if (!field) {
                return;
            }
            clearError(field);
            if (!field.value.trim()) {
                showError(field, 'This field is required');
                valid = false;
            }
        });

        const emailField = document.getElementById('email');
        if (emailField && emailField.value.trim()) {
            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim());
            if (!emailOk) {
                showError(emailField, 'Enter a valid work email');
                valid = false;
            }
        }

        if (!valid) {
            return;
        }

        const note = {
            fullName: valueOf('fullName'),
            email: valueOf('email'),
            phone: valueOf('phone'),
            company: valueOf('company'),
            role: valueOf('role'),
            whyGaming: valueOf('whyGaming'),
            alreadyTried: valueOf('alreadyTried'),
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('lastDiscoveryNote', JSON.stringify(note));

        const subject = encodeURIComponent('Discovery note from ' + note.company);
        const body = encodeURIComponent(
            'Name: ' + note.fullName + '\n' +
            'Email: ' + note.email + '\n' +
            'Phone: ' + (note.phone || 'Not given') + '\n' +
            'Company: ' + note.company + '\n' +
            'Role: ' + note.role + '\n\n' +
            'Why gaming is on the table:\n' + note.whyGaming + '\n\n' +
            'What they have already tried:\n' + note.alreadyTried + '\n'
        );

        window.location.href = 'mailto:' + PARTNERSHIPS_EMAIL + '?subject=' + subject + '&body=' + body;

        window.setTimeout(function () {
            window.location.href = 'confirmation.html';
        }, 400);
    });
})();
