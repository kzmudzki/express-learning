// Tab switching functionality
function switchTab(tab) {
	const loginForm = document.getElementById('login-form');
	const registerForm = document.getElementById('register-form');
	const loginTab = document.getElementById('login-tab');
	const registerTab = document.getElementById('register-tab');

	if (tab === 'login') {
		loginForm.style.display = 'block';
		registerForm.style.display = 'none';
		loginTab.disabled = true;
		registerTab.disabled = false;
	} else {
		loginForm.style.display = 'none';
		registerForm.style.display = 'block';
		loginTab.disabled = false;
		registerTab.disabled = true;
	}

	clearAlerts();
}

// Alert system
function showAlert(message, type = 'error') {
	const container = document.getElementById('alert-container');
	const color = type === 'error' ? 'red' : 'green';
	container.innerHTML = `<div style="border: 1px solid ${color}; background: ${
		type === 'error' ? '#ffebee' : '#e8f5e8'
	}; padding: 10px; margin: 10px 0; color: ${color};">${message}</div>`;
}

function clearAlerts() {
	document.getElementById('alert-container').innerHTML = '';
}

// Loading state management
function setLoading(formType, isLoading) {
	const btn = document.getElementById(`${formType}-btn`);
	const loading = document.getElementById(`${formType}-loading`);

	if (isLoading) {
		btn.disabled = true;
		loading.style.display = 'inline';
	} else {
		btn.disabled = false;
		loading.style.display = 'none';
	}
}

// Login form handler
document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('login-form').addEventListener('submit', async (e) => {
		e.preventDefault();
		clearAlerts();
		setLoading('login', true);

		const email = document.getElementById('login-email').value;
		const password = document.getElementById('login-password').value;

		try {
			const response = await fetch('/api/v1/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (data.success) {
				// Store token in sessionStorage for this demo
				sessionStorage.setItem('authToken', data.data.token);
				sessionStorage.setItem('user', JSON.stringify(data.data.user));

				showAlert(`Welcome back, ${data.data.user.name}! Redirecting...`, 'success');

				// Redirect after 1.5 seconds
				setTimeout(() => {
					window.location.href = '/web/dashboard';
				}, 1500);
			} else {
				showAlert(data.message || 'Login failed. Please try again.');
			}
		} catch (error) {
			showAlert('Network error. Please check your connection and try again.');
		} finally {
			setLoading('login', false);
		}
	});

	// Register form handler
	document.getElementById('register-form').addEventListener('submit', async (e) => {
		e.preventDefault();
		clearAlerts();
		setLoading('register', true);

		const name = document.getElementById('register-name').value;
		const email = document.getElementById('register-email').value;
		const password = document.getElementById('register-password').value;

		// Client-side password validation
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
		if (!passwordRegex.test(password)) {
			showAlert('Password must contain at least one lowercase letter, one uppercase letter, and one number.');
			setLoading('register', false);
			return;
		}

		try {
			const response = await fetch('/api/v1/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name, email, password }),
			});

			const data = await response.json();

			if (data.success) {
				// Store token in sessionStorage for this demo
				sessionStorage.setItem('authToken', data.data.token);
				sessionStorage.setItem('user', JSON.stringify(data.data.user));

				showAlert(`Account created successfully! Welcome, ${data.data.user.name}! Redirecting...`, 'success');

				// Redirect after 1.5 seconds
				setTimeout(() => {
					window.location.href = '/web/dashboard';
				}, 1500);
			} else {
				showAlert(data.message || 'Registration failed. Please try again.');
			}
		} catch (error) {
			showAlert('Network error. Please check your connection and try again.');
		} finally {
			setLoading('register', false);
		}
	});

	// Check if user is already logged in
	const token = sessionStorage.getItem('authToken');
	const user = sessionStorage.getItem('user');

	if (token && user) {
		const userData = JSON.parse(user);
		showAlert(`You're already logged in as ${userData.name}. Redirecting to dashboard...`, 'success');
		setTimeout(() => {
			window.location.href = '/web/dashboard';
		}, 2000);
	}

	// Initialize login tab as active
	switchTab('login');
});
