function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
  return !!getToken();
}

function isAdmin() {
  const user = getUser();
  return user && user.role === 'admin';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/frontend/auth.html';
}

async function authenticatedFetch(url, options = {}) {
  const token = getToken();
  if (!token) {
    window.location.href = '/frontend/auth.html';
    return null;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    logout();
    return null;
  }

  return response;
}

function protectPage() {
  if (!isLoggedIn()) {
    window.location.href = '/frontend/auth.html';
  }
}

function protectAdminPage() {
  if (!isLoggedIn()) {
    window.location.href = '/frontend/auth.html';
  }
  if (!isAdmin()) {
    alert('Admin access required');
    window.location.href = '/frontend/index.html';
  }
}

function displayUserInfo() {
  const user = getUser();
  if (user) {
    const userInfoDiv = document.getElementById('userInfo');
    if (userInfoDiv) {
      userInfoDiv.innerHTML = `
        <span>Welcome, <strong>${user.username}</strong> (${user.role})</span>
        <button onclick="logout()" style="margin-left: 10px; padding: 5px 15px; cursor: pointer;">Logout</button>
      `;
    }
  }
}

window.addEventListener('load', function() {
  const token = getToken();
  
  if (window.location.pathname.includes('auth.html') && token) {
    const user = getUser();
    const redirectUrl = user && user.role === 'admin'
      ? '/frontend/index.html'
      : '/frontend/main.html';
    window.location.href = redirectUrl;
    return;
  }
  
  if (token) {
    displayUserInfo();
  }
});
