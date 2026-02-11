const API_URL = '';

document.addEventListener('DOMContentLoaded', () => {
  setupHeader();
  loadBooks();
  document.getElementById('viewOrdersBtn').addEventListener('click', showOrders);
});

function setupHeader() {
  const guest = document.getElementById('guestLinks');
  const userLinks = document.getElementById('userLinks');
  const viewOrdersBtn = document.getElementById('viewOrdersBtn');

  if (isLoggedIn()) {
    const user = getUser();
    guest.style.display = 'none';
    userLinks.style.display = 'inline-block';
    
    let userLinksHTML = `Welcome, <strong>${user.username}</strong>`;
    if (user.role === 'admin') {
      userLinksHTML += ` | <a href="/frontend/index.html">Admin Dashboard</a>`;
    }
    userLinksHTML += ` | <a href="#" id="logoutLink">Logout</a>`;
    
    userLinks.innerHTML = userLinksHTML;
    document.getElementById('logoutLink').addEventListener('click', (e) => { e.preventDefault(); logout(); });
    viewOrdersBtn.style.display = 'inline-block';
  } else {
    guest.style.display = 'inline-block';
    userLinks.style.display = 'none';
    viewOrdersBtn.style.display = 'none';
  }
}

async function loadBooks() {
  const grid = document.getElementById('booksGrid');
  const empty = document.getElementById('emptyMessage');
  grid.innerHTML = '';

  try {
    let response = await fetch(`${API_URL}/books`);

    if (response.status === 401 || response.status === 403) {
      if (isLoggedIn()) {
        response = await authenticatedFetch(`${API_URL}/books`);
        if (!response) return;
      } else {
        empty.textContent = 'Please login to view books.';
        empty.style.display = 'block';
        return;
      }
    }

    if (!response.ok) {
      empty.textContent = 'Failed to load books.';
      empty.style.display = 'block';
      return;
    }

    const books = await response.json();
    if (!books || books.length === 0) {
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    books.forEach(book => {
      grid.appendChild(renderBookCard(book));
    });
  } catch (err) {
    empty.textContent = 'Error loading books.';
    empty.style.display = 'block';
    console.error(err);
  }
}
 
function renderBookCard(book) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style = 'background:var(--card-bg); border:1px solid var(--border-color); padding:1rem; border-radius:8px; display:flex; flex-direction:column; gap:0.5rem;';

  const title = document.createElement('h3');
  title.textContent = book.title;
  title.style.margin = '0';

  const author = document.createElement('div');
  author.textContent = 'By ' + (book.author || '-');
  author.style.color = 'var(--text-secondary)';

  const genre = document.createElement('div');
  genre.textContent = book.genre || '';
  genre.style.fontSize = '0.9rem';

  const year = document.createElement('div');
  year.textContent = book.yearPublished ? `Published: ${book.yearPublished}` : '';
  year.style.fontSize = '0.85rem';

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.justifyContent = 'space-between';
  actions.style.marginTop = 'auto';

  const detailsBtn = document.createElement('button');
  detailsBtn.textContent = 'Details';
  detailsBtn.className = 'btn-secondary';
  detailsBtn.onclick = () => { showBookDetails(book); };

  const buyBtn = document.createElement('button');
  buyBtn.textContent = 'Add to cart';
  buyBtn.className = 'btn-primary';
  buyBtn.onclick = () => {
    if (!isLoggedIn()) {
      window.location.href = '/frontend/auth.html';
      return;
    }
    addToCart(book);
  };

  actions.appendChild(detailsBtn);
  actions.appendChild(buyBtn);

  card.appendChild(title);
  card.appendChild(author);
  card.appendChild(genre);
  card.appendChild(year);
  card.appendChild(actions);

  return card;
}
let currentOrder = null;

async function addToCart(book) {
  const bookId = book._id || book.id;
  try {
    const response = await authenticatedFetch(`${API_URL}/orders/cart`, {
      method: 'POST',
      body: JSON.stringify({ bookId })
    });
    if (!response) return;

    if (!response.ok) {
      alert('Could not add to cart. Please try again.');
      return;
    }

    currentOrder = await response.json();
    alert('Added to your cart. Open My Orders to review.');
  } catch (err) {
    console.error('Error adding to cart:', err);
    alert('Error adding to cart.');
  }
}

async function showOrders() {
  const modal = document.getElementById('ordersModal');
  const listEl = document.getElementById('ordersList');
  listEl.innerHTML = '';

  try {
    const response = await authenticatedFetch(`${API_URL}/orders/my`);
    if (!response) return;

    if (!response.ok) {
      listEl.innerHTML = '<div style="color:var(--text-secondary); padding:1rem;">Failed to load your cart.</div>';
      modal.classList.remove('hidden');
      return;
    }

    const order = await response.json();
    currentOrder = order;

    if (!order || !order.books || order.books.length === 0) {
      listEl.innerHTML = '<div style="color:var(--text-secondary); padding:1rem;">You have no items in your cart.</div>';
    } else {
      const ul = document.createElement('ul');
      ul.style.listStyle = 'none';
      ul.style.padding = '0';
      order.books.forEach((book) => {
        const li = document.createElement('li');
        li.style.padding = '0.5rem 0';
        li.style.borderBottom = '1px solid var(--border-color)';
        const title = book.title || 'Untitled';
        li.innerHTML = `
          ${title}
          <span style="color:var(--text-secondary); font-size:0.85rem;">
            — ${book.author || ''}
          </span>
          <button style="float:right;" class="btn-danger" onclick="removeOrder('${book._id}')">Remove</button>
        `;
        ul.appendChild(li);
      });
      listEl.appendChild(ul);
    }

    modal.classList.remove('hidden');
  } catch (err) {
    console.error('Error loading cart:', err);
    listEl.innerHTML = '<div style="color:var(--text-secondary); padding:1rem;">Error loading your cart.</div>';
    modal.classList.remove('hidden');
  }
}

function closeOrders() {
  document.getElementById('ordersModal').classList.add('hidden');
}

async function removeOrder(bookId) {
  try {
    const response = await authenticatedFetch(`${API_URL}/orders/cart/${bookId}`, {
      method: 'DELETE'
    });
    if (!response) return;

    if (!response.ok) {
      alert('Could not remove item from cart.');
      return;
    }

    showOrders();
  } catch (err) {
    console.error('Error removing from cart:', err);
    alert('Error removing item from cart.');
  }
}

function checkout() {
  alert('Checkout is not implemented yet. For now, we only store your cart and show it to the admin as an active order.');
}

let selectedBookForCart = null;

function showBookDetails(book) {
  selectedBookForCart = book;
  document.getElementById('bookDetailsTitle').textContent = book.title;
  document.getElementById('bookDetailsAuthor').textContent = book.author || '-';
  document.getElementById('bookDetailsGenre').textContent = book.genre || '-';
  document.getElementById('bookDetailsYear').textContent = book.yearPublished || '-';
  document.getElementById('bookDetailsModal').classList.remove('hidden');
}

function closeBookDetails() {
  document.getElementById('bookDetailsModal').classList.add('hidden');
  selectedBookForCart = null;
}

function addToCartFromDetails() {
  if (!selectedBookForCart) return;
  
  if (!isLoggedIn()) {
    window.location.href = '/frontend/auth.html';
    return;
  }
  
  addToCart(selectedBookForCart);
  closeBookDetails();
}
