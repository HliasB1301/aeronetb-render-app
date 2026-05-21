let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || 'null');
let chart;
const api = async (url, options={}) => {
  const r = await fetch(url, { ...options, headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}`, ...(options.headers||{}) } });
  if (!r.ok) throw new Error((await r.json()).error || 'Request failed');
  return r.json();
};
function table(rows){
  if (!rows || !rows.length) return '<p class="text-muted">No data or access denied.</p>';
  const keys = Object.keys(rows[0]).filter(k => !['_id','__v','password_hash'].includes(k));
  return `<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr>${keys.map(k=>`<th>${k}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${keys.map(k=>`<td>${typeof row[k] === 'object' ? JSON.stringify(row[k]) : row[k] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
async function login(){
  try {
    const body = JSON.stringify({ email:document.getElementById('email').value, password:document.getElementById('password').value });
    const r = await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body });
    const data = await r.json(); if (!r.ok) throw new Error(data.error);
    token = data.token; user = data.user;
    localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user));
    start();
  } catch(e){ document.getElementById('loginError').textContent = e.message; }
}
function logout(){ localStorage.clear(); location.reload(); }
function showTab(id, btn){ document.querySelectorAll('.tab').forEach(x=>x.classList.add('d-none')); document.getElementById(id).classList.remove('d-none'); document.querySelectorAll('.nav-link').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); }
async function safeLoad(url, target){ try { const data = await api(url); document.getElementById(target).innerHTML = table(data); return data; } catch(e){ document.getElementById(target).innerHTML = `<p class="text-danger">${e.message}</p>`; return []; } }
async function createQc(){
  try {
    await api('/api/qc-reports', { method:'POST', body:JSON.stringify({ qcReportId:newQcId.value, deliveredItemId:newDeliveredId.value, reportType:'VISUAL_INSPECTION', status:newStatus.value, inspectorId:user.empId, measurements:{visual:'OK'}, defects:[], remarks:'Created from dashboard' }) });
    await loadQuality(); alert('QC report created');
  } catch(e){ alert(e.message); }
}
async function loadQuality(){ const q = await safeLoad('/api/qc-reports','qcTable'); await safeLoad('/api/certifications','certTable'); document.getElementById('qcCount').textContent = q.length || '-'; }
async function loadIot(){
  const data = await safeLoad('/api/sensor-readings','iotTable');
  document.getElementById('alertCount').textContent = data.filter(x=>x.alertLevel==='CRITICAL').length || 0;
  const ctx = document.getElementById('iotChart'); if(chart) chart.destroy();
  chart = new Chart(ctx, { type:'line', data:{ labels:data.map(x=>x.deviceId), datasets:[{ label:'Temperature', data:data.map(x=>x.metrics?.temperature || 0) }] }, options:{ responsive:true } });
}
async function start(){
  if (!token) return;
  document.getElementById('loginBox').classList.add('d-none'); document.getElementById('appBox').classList.remove('d-none'); document.getElementById('roleText').textContent = `${user.name} (${user.role})`;
  const suppliers = await safeLoad('/api/suppliers','suppliersTable'); document.getElementById('supplierCount').textContent = suppliers.length || '-';
  const orders = await safeLoad('/api/orders','ordersTable'); document.getElementById('orderCount').textContent = orders.length || '-';
  await loadQuality(); await loadIot(); await safeLoad('/api/audit-logs','auditTable');
}
start();
