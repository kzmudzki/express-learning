let currentToken = null;
let currentUser = null;

// Load user data on page load
document.addEventListener('DOMContentLoaded', function () {
	loadUserData();
});

function loadUserData() {
	const token = sessionStorage.getItem('authToken');
	const userStr = sessionStorage.getItem('user');

	if (!token || !userStr) {
		// Redirect to auth page if not logged in
		alert('Please log in first');
		window.location.href = '/web/auth';
		return;
	}

	currentToken = token;
	currentUser = JSON.parse(userStr);

	// Update UI with user data
	document.getElementById('user-name').textContent = currentUser.name;
	document.getElementById('token-display').textContent = token;

	// Populate user details
	const userDetailsHTML = `
        <table border="1" cellpadding="5">
            <tr><td><strong>Name:</strong></td><td>${currentUser.name}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${currentUser.email}</td></tr>
            <tr><td><strong>Role:</strong></td><td>${currentUser.role}</td></tr>
            <tr><td><strong>Status:</strong></td><td>${currentUser.isActive ? 'Active' : 'Inactive'}</td></tr>
            <tr><td><strong>Member Since:</strong></td><td>${new Date(
							currentUser.createdAt
						).toLocaleDateString()}</td></tr>
            <tr><td><strong>User ID:</strong></td><td>#${currentUser.id}</td></tr>
        </table>
    `;
	document.getElementById('user-details').innerHTML = userDetailsHTML;
}

function logout() {
	// Clear stored data
	sessionStorage.removeItem('authToken');
	sessionStorage.removeItem('user');

	// Redirect to auth page
	window.location.href = '/web/auth';
}

function copyToken() {
	const copyBtn = document.getElementById('copy-btn');

	navigator.clipboard
		.writeText(currentToken)
		.then(() => {
			copyBtn.textContent = 'Copied!';
			setTimeout(() => {
				copyBtn.textContent = 'Copy Token';
			}, 2000);
		})
		.catch(() => {
			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = currentToken;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);

			copyBtn.textContent = 'Copied!';
			setTimeout(() => {
				copyBtn.textContent = 'Copy Token';
			}, 2000);
		});
}

async function testAPI() {
	if (!currentToken) {
		alert('No token available');
		return;
	}

	try {
		// Test the protected users endpoint
		const response = await fetch('/api/v1/users', {
			headers: {
				Authorization: `Bearer ${currentToken}`,
			},
		});

		const data = await response.json();

		if (data.success) {
			alert(`✅ API Test Successful!\n\nFound ${data.data.length} users in the system.\n\nStatus: ${response.status}`);
		} else {
			alert(`❌ API Test Failed!\n\nError: ${data.message}`);
		}
	} catch (error) {
		alert(`❌ API Test Failed!\n\nNetwork Error: ${error.message}`);
	}
}

// Auto-refresh token validity check every 5 minutes
setInterval(async () => {
	if (currentToken) {
		try {
			const response = await fetch('/api/v1/auth/profile', {
				headers: {
					Authorization: `Bearer ${currentToken}`,
				},
			});

			if (!response.ok) {
				// Token is invalid, redirect to login
				alert('Your session has expired. Please log in again.');
				logout();
			}
		} catch (error) {
			console.error('Token validation error:', error);
		}
	}
}, 300000); // Check every 5 minutes
