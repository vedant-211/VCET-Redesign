const authView = document.getElementById('auth-view');
const dashView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const toastEl = document.getElementById('toast');
const token = localStorage.getItem('vcet_admin_token');

let allEnquiries = [];

function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.style.display = 'block';
    setTimeout(() => toastEl.style.display = 'none', 3000);
}

// Intercept requests with token
const fetchAPI = async (url, options = {}) => {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('vcet_admin_token')}`
    };
    options.headers = { ...defaultHeaders, ...options.headers };
    const res = await fetch(url, options);
    if(res.status === 401) {
        logout();
        throw new Error('Unauthorized');
    }
    return res;
};

// Login Logic
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();
        if(res.ok) {
            localStorage.setItem('vcet_admin_token', data.token);
            initDashboard();
        } else {
            alert(data.message);
        }
    } catch(err) {
        console.error(err);
    }
});

function logout() {
    localStorage.removeItem('vcet_admin_token');
    authView.style.display = 'flex';
    dashView.style.display = 'none';
}
document.getElementById('logout-btn').addEventListener('click', logout);

// Dashboard Initialization
if(token) {
    initDashboard();
}

async function initDashboard() {
    authView.style.display = 'none';
    dashView.style.display = 'block';
    await loadStats();
    await loadEnquiries();
}

async function loadStats() {
    const res = await fetchAPI('/api/admin/stats');
    const stats = await res.json();
    document.getElementById('s-total').textContent = stats.totalEnquiries || 0;
    document.getElementById('s-new').textContent = stats.newEnquiries || 0;
    document.getElementById('s-notices').textContent = stats.totalNotices || 0;
    document.getElementById('s-events').textContent = stats.totalEvents || 0;
}

async function loadEnquiries() {
    const res = await fetchAPI('/api/admin/enquiries');
    allEnquiries = await res.json();
    renderEnquiries(allEnquiries);
}

function renderEnquiries(enquiries) {
    const tbody = document.getElementById('enquiries-tbody');
    tbody.innerHTML = '';
    if(enquiries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No enquiries found.</td></tr>';
        return;
    }

    enquiries.forEach(eq => {
        const date = new Date(eq.createdAt).toLocaleDateString();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${date}</td>
            <td><strong>${eq.name}</strong></td>
            <td>${eq.course}</td>
            <td><div style="font-size:0.8rem">${eq.phone}<br>${eq.email}</div></td>
            <td><span class="badge ${eq.status}">${eq.status.toUpperCase()}</span></td>
            <td>
                ${eq.status === 'new' 
                   ? `<button class="action-btn" onclick="markContacted('${eq._id}')">Mark Contacted</button>` 
                   : `<button class="action-btn" onclick="deleteEnquiry('${eq._id}')" style="color:var(--muted)">Archive</button>`}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('search-enquiries').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allEnquiries.filter(eq => 
        eq.name.toLowerCase().includes(term) || eq.course.toLowerCase().includes(term)
    );
    renderEnquiries(filtered);
});

window.markContacted = async (id) => {
    await fetchAPI(`/api/admin/enquiries/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'contacted' })
    });
    showToast('Marked as contacted');
    initDashboard();
};

window.deleteEnquiry = (id) => {
    showToast('Functionality mocked: archived!');
}
