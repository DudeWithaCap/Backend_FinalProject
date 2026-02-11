protectAdminPage();

// Use relative API paths so frontend works both locally and when deployed
const API_URL = '';

function applyAdminVisibility() {
  if (!isAdmin()) {
    document.querySelectorAll('.admin-only').forEach(el => { el.style.display = 'none'; });
  }
}
applyAdminVisibility();

function updateDateTime() {
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', options);
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionId = item.dataset.section;
    
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    if (sectionId === 'books') {
      loadBooks();
    } else if (sectionId === 'publishers') {
      loadPublishers();
    } else if (sectionId === 'dashboard') {
      loadDashboardStats();
    } else if (sectionId === 'orders') {
      loadOrders();
    } else if (sectionId === 'users') {
      loadUsers();
    }
  });
});

function toggleBookForm() {
  document.getElementById('bookFormContainer').classList.toggle('hidden');
}

function togglePublisherForm() {
  document.getElementById('publisherFormContainer').classList.toggle('hidden');
}

document.getElementById('bookForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const bookData = {
    title: document.getElementById('bookTitle').value,
    author: document.getElementById('bookAuthor').value,
    genre: document.getElementById('bookGenre').value,
    yearPublished: parseInt(document.getElementById('bookYear').value)
  };
  
  const editingId = document.getElementById('bookForm').dataset.editingId;
  const method = editingId ? 'PUT' : 'POST';
  const url = editingId ? `${API_URL}/books/${editingId}` : `${API_URL}/books`;
  
  try {
    const response = await authenticatedFetch(url, {
      method: method,
      body: JSON.stringify(bookData)
    });
    if (!response) return;

    if (response.ok) {
      const message = editingId ? 'Book updated successfully!' : 'Book added successfully!';
      alert(message);
      document.getElementById('bookForm').reset();
      document.getElementById('bookForm').removeAttribute('data-editing-id');
      toggleBookForm();
      loadBooks();
      loadDashboardStats();
    } else {
      const error = await response.json();
      alert('Error: ' + error.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

document.getElementById('publisherForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const publisherData = {
    companyName: document.getElementById('publisherCompanyName').value,
    country: document.getElementById('publisherCountry').value,
    city: document.getElementById('publisherCity').value,
    genre: document.getElementById('publisherGenre').value
  };
  
  const editingId = document.getElementById('publisherForm').dataset.editingId;
  const method = editingId ? 'PUT' : 'POST';
  const url = editingId ? `${API_URL}/publishers/${editingId}` : `${API_URL}/publishers`;
  
  try {
    const response = await authenticatedFetch(url, {
      method: method,
      body: JSON.stringify(publisherData)
    });
    if (!response) return;

    if (response.ok) {
      const message = editingId ? 'Publisher updated successfully!' : 'Publisher added successfully!';
      alert(message);
      document.getElementById('publisherForm').reset();
      document.getElementById('publisherForm').removeAttribute('data-editing-id');
      togglePublisherForm();
      loadPublishers();
      loadDashboardStats();
    } else {
      const error = await response.json();
      alert('Error: ' + error.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

async function loadBooks() {
  try {
    const response = await authenticatedFetch(`${API_URL}/books`);
    if (!response) return;
    const books = await response.json();
    const tbody = document.getElementById('booksTableBody');
    const emptyState = document.getElementById('booksEmpty');
    
    if (books.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.add('show');
      return;
    }
    
    emptyState.classList.remove('show');
    tbody.innerHTML = books.map((book, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.genre}</td>
        <td>${book.yearPublished}</td>
        <td>${new Date(book.createdAt).toLocaleDateString()}</td>
        ${isAdmin() ? `<td class="admin-only">
          <button class="btn-secondary" onclick="editBook('${book._id}')">Edit</button>
          <button class="btn-danger" onclick="deleteBook('${book._id}')">Delete</button>
        </td>` : ''}
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading books:', error);
  }
}

async function loadPublishers() {
  try {
    const response = await authenticatedFetch(`${API_URL}/publishers`);
    if (!response) return;
    const publishers = await response.json();
    const tbody = document.getElementById('publishersTableBody');
    const emptyState = document.getElementById('publishersEmpty');
    
    if (publishers.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.add('show');
      return;
    }
    
    emptyState.classList.remove('show');
    tbody.innerHTML = publishers.map((publisher, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${publisher.companyName}</td>
        <td>${publisher.country}</td>
        <td>${publisher.city || '-'}</td>
        <td>${publisher.genre}</td>
        <td>${new Date(publisher.createdAt).toLocaleDateString()}</td>
        ${isAdmin() ? `<td class="admin-only">
          <button class="btn-secondary" onclick="editPublisher('${publisher._id}')">Edit</button>
          <button class="btn-danger" onclick="deletePublisher('${publisher._id}')">Delete</button>
        </td>` : ''}
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading publishers:', error);
  }
}

async function loadDashboardStats() {
  try {
    const booksResponse = await authenticatedFetch(`${API_URL}/books`);
    if (!booksResponse) return;
    const books = await booksResponse.json();

    const publishersResponse = await authenticatedFetch(`${API_URL}/publishers`);
    if (!publishersResponse) return;
    const publishers = await publishersResponse.json();

    const ordersResponse = await authenticatedFetch(`${API_URL}/orders`);
    if (!ordersResponse) return;
    const orders = await ordersResponse.json();
    
    document.getElementById('totalBooks').textContent = books.length;
    document.getElementById('totalPublishers').textContent = publishers.length;
    document.getElementById('totalOrders').textContent = orders.length;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadOrders() {
  try {
    const response = await authenticatedFetch(`${API_URL}/orders`);
    if (!response) return;

    const orders = await response.json();
    const tbody = document.getElementById('ordersTableBody');
    const emptyState = document.getElementById('ordersEmpty');

    if (!orders || orders.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.add('show');
      return;
    }

    emptyState.classList.remove('show');
    tbody.innerHTML = orders.map(order => {
      const user = order.user || {};
      const books = Array.isArray(order.books) ? order.books : [];
      const bookTitles = books.map(b => b.title).join(', ');
      const created = order.createdAt ? new Date(order.createdAt).toLocaleString() : '-';

      return `
        <tr>
          <td>${user.username || '-'}</td>
          <td>${user.email || '-'}</td>
          <td>${bookTitles || '-'}</td>
          <td>${created}</td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

async function deleteBook(id) {
  if (!confirm('Delete this book?')) return;
  
  try {
    const response = await authenticatedFetch(`${API_URL}/books/${id}`, {
      method: 'DELETE'
    });
    if (!response) return;

    if (response.ok) {
      loadBooks();
      loadDashboardStats();
    } else {
      alert('Error deleting book');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function deletePublisher(id) {
  if (!confirm('Delete this publisher?')) return;
  
  try {
    const response = await authenticatedFetch(`${API_URL}/publishers/${id}`, {
      method: 'DELETE'
    });
    if (!response) return;

    if (response.ok) {
      loadPublishers();
      loadDashboardStats();
    } else {
      alert('Error deleting publisher');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function editBook(id) {
  try {
    const response = await authenticatedFetch(`${API_URL}/books/${id}`);
    if (!response) return;
    const book = await response.json();
    
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookGenre').value = book.genre;
    document.getElementById('bookYear').value = book.yearPublished;
    
    document.getElementById('bookForm').dataset.editingId = id;
    
    document.querySelector('.nav-item[data-section="books"]').click();
    toggleBookForm();
    
    document.getElementById('bookFormContainer').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    alert('Error loading book data: ' + error.message);
  }
}

async function editPublisher(id) {
  try {
    const response = await authenticatedFetch(`${API_URL}/publishers/${id}`);
    if (!response) return;
    const publisher = await response.json();
    
    document.getElementById('publisherCompanyName').value = publisher.companyName;
    document.getElementById('publisherCountry').value = publisher.country;
    document.getElementById('publisherCity').value = publisher.city || '';
    document.getElementById('publisherGenre').value = publisher.genre;
    
    document.getElementById('publisherForm').dataset.editingId = id;
    
    document.querySelector('.nav-item[data-section="publishers"]').click();
    togglePublisherForm();

    document.getElementById('publisherFormContainer').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    alert('Error loading publisher data: ' + error.message);
  }
}

async function loadUsers() {
  try {
    const response = await authenticatedFetch(`${API_URL}/users`);
    if (!response) return;
    
    const data = await response.json();
    const users = data.users || data;
    const tbody = document.getElementById('usersTableBody');
    const emptyState = document.getElementById('usersEmpty');
    
    if (!users || users.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.add('show');
      return;
    }
    
    emptyState.classList.remove('show');
    tbody.innerHTML = users.map((user, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>
          <select class="role-select" id="role-${user._id}" onchange="changeUserRole('${user._id}', this.value)">
            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </td>
        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn-secondary" onclick="loadUserDetails('${user._id}')">View Details</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading users:', error);
    alert('Error loading users: ' + error.message);
  }
}

async function changeUserRole(userId, newRole) {
  try {
    const response = await authenticatedFetch(`${API_URL}/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role: newRole })
    });
    
    if (!response) return;
    
    if (response.ok) {
      const data = await response.json();
      alert(`User role updated to ${newRole} successfully!`);
      loadUsers();
    } else {
      const error = await response.json();
      alert('Error: ' + error.message);
      loadUsers();
    }
  } catch (error) {
    alert('Error: ' + error.message);
    loadUsers();
  }
}

async function loadUserDetails(userId) {
  try {
    const response = await authenticatedFetch(`${API_URL}/users/${userId}`);
    if (!response) return;
    
    const data = await response.json();
    const user = data.user;
    
    const details = `
User Details:
- Username: ${user.username}
- Email: ${user.email}
- Role: ${user.role}
- Joined: ${new Date(user.createdAt).toLocaleString()}
- Last Updated: ${new Date(user.updatedAt).toLocaleString()}
- 2FA Enabled: ${user.totpEnabled ? 'Yes' : 'No'}
    `;
    
    alert(details);
  } catch (error) {
    alert('Error loading user details: ' + error.message);
  }
}

