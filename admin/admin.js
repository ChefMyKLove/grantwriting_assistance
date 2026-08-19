// admin/admin.js
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const leadsBody = document.getElementById('leadsBody');
const logoutBtn = document.getElementById('logoutBtn');

async function fetchLeads() {
  const res = await fetch('/api/admin/leads');
  if (res.status === 401) {
    showLogin();
    return;
  }
  const leads = await res.json();
  renderLeads(leads);
  showDashboard();
}

function showLogin() {
  loginView.hidden = false;
  dashboardView.hidden = true;
}

function showDashboard() {
  loginView.hidden = true;
  dashboardView.hidden = false;
}

function renderLeads(leads) {
  leadsBody.innerHTML = '';
  for (const lead of leads) {
    const primaryCase = lead.cases[0] || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(lead.name)}</td>
      <td>${escapeHtml(lead.email)}</td>
      <td>${escapeHtml(lead.grant_type || '')}</td>
      <td>${new Date(lead.submitted_at).toLocaleDateString()}</td>
      <td><input type="text" data-field="case_number" value="${escapeHtml(primaryCase.case_number || '')}"></td>
      <td><input type="number" step="0.5" data-field="hours_used" value="${primaryCase.hours_used ?? 0}"></td>
      <td><input type="date" data-field="deadline" value="${primaryCase.deadline ? primaryCase.deadline.slice(0, 10) : ''}"></td>
      <td>
        <select data-field="submission_status">
          <option value="pending">pending</option>
          <option value="in_progress">in_progress</option>
          <option value="submitted">submitted</option>
          <option value="approved">approved</option>
        </select>
      </td>
      <td><button type="button" data-save="${primaryCase.id ?? ''}">Save</button></td>
    `;
    const select = tr.querySelector('select');
    select.value = primaryCase.submission_status || 'pending';
    leadsBody.appendChild(tr);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

leadsBody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-save]');
  if (!btn) return;
  const caseId = btn.dataset.save;
  if (!caseId) return;

  const row = btn.closest('tr');
  const payload = {};
  row.querySelectorAll('[data-field]').forEach((el) => {
    payload[el.dataset.field] = el.value === '' ? null : el.value;
  });

  const res = await fetch(`/api/admin/cases/${caseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.status === 401) {
    showLogin();
    return;
  }

  btn.textContent = res.ok ? 'Saved' : 'Error';
  setTimeout(() => { btn.textContent = 'Save'; }, 1500);
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('loginPassword').value;
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (res.ok) {
    loginError.hidden = true;
    fetchLeads();
  } else {
    loginError.hidden = false;
    loginError.textContent = 'Invalid password';
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  showLogin();
});

fetchLeads();
