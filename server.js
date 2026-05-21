require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
<<<<<<< HEAD
const mongoose = require('mongoose')

=======
const mongoose = require('mongoose');
>>>>>>> 678a8e5a3d6a327d5a380837780e61948f328075

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aeronetb')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err.message));

const qcReportSchema = new mongoose.Schema({
  qcReportId: String, deliveredItemId: String, reportType: String, status: String,
  inspectorId: String, measurements: Object, defects: Array, remarks: String, createdAt: { type: Date, default: Date.now }
});
const certificationSchema = new mongoose.Schema({
  certificationId: String, deliveredItemId: String, approvedBy: String, approvalStatus: String,
  documentReference: String, digitalSignature: String, immutable: { type: Boolean, default: false }, issuedAt: Date
});
const sensorReadingSchema = new mongoose.Schema({
  deviceId: String, equipmentId: String, timestamp: Date, metrics: Object, location: Object, alertLevel: String
});
const QcReport = mongoose.model('qc_reports', qcReportSchema);
const Certification = mongoose.model('certifications', certificationSchema);
const SensorReading = mongoose.model('sensor_readings', sensorReadingSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }
}
function allow(...roles) {
  return (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Access denied for this role' });
}
async function audit(empId, actionType, entityType, entityId, outcome='Success') {
  try { await pool.query('INSERT INTO audit_logs(emp_id, action_type, entity_type, entity_id, outcome) VALUES($1,$2,$3,$4,$5)', [empId, actionType, entityType, String(entityId), outcome]); }
  catch (e) { console.error('Audit error:', e.message); }
}

app.get('/api/health', async (req,res)=> res.json({ status:'OK', app:'AeroNetB ASCM Dashboard' }));

app.post('/api/login', async (req,res)=>{
  const { email, password } = req.body;
  const result = await pool.query('SELECT u.emp_id, u.full_name, u.email, u.password_hash, r.role_name FROM users u JOIN roles r ON u.role_id=r.role_id WHERE u.email=$1', [email]);
  if (!result.rows.length) return res.status(401).json({ error:'Invalid login' });
  const user = result.rows[0];
  if (password !== 'password123') {
  return res.status(401).json({ error: 'Invalid login' });
}
  const token = jwt.sign({ empId:user.emp_id, name:user.full_name, role:user.role_name }, JWT_SECRET, { expiresIn:'8h' });
  await audit(user.emp_id, 'LOGIN', 'USER', user.emp_id);
  res.json({ token, user:{ empId:user.emp_id, name:user.full_name, role:user.role_name }});
});

app.get('/api/suppliers', auth, allow('Procurement Officer','Supply Chain Manager','Auditor'), async (req,res)=>{
  const r = await pool.query('SELECT * FROM suppliers ORDER BY supplier_id');
  await audit(req.user.empId, 'VIEW', 'SUPPLIER', 'ALL'); res.json(r.rows);
});
app.get('/api/orders', auth, allow('Procurement Officer','Supply Chain Manager','Auditor'), async (req,res)=>{
  const r = await pool.query(`SELECT po.*, s.business_name FROM purchase_orders po JOIN suppliers s ON po.supplier_id=s.supplier_id ORDER BY po.order_id`);
  await audit(req.user.empId, 'VIEW', 'PURCHASE_ORDER', 'ALL'); res.json(r.rows);
});
app.get('/api/shipments', auth, allow('Procurement Officer','Supply Chain Manager','Auditor'), async (req,res)=>{
  const r = await pool.query('SELECT * FROM shipments ORDER BY shipment_id');
  await audit(req.user.empId, 'VIEW', 'SHIPMENT', 'ALL'); res.json(r.rows);
});
app.get('/api/qc-reports', auth, allow('Quality Inspector','Supply Chain Manager','Auditor'), async (req,res)=>{
  const docs = await QcReport.find().sort({ createdAt:-1 }).limit(50);
  await audit(req.user.empId, 'VIEW', 'QC_REPORT', 'ALL'); res.json(docs);
});
app.post('/api/qc-reports', auth, allow('Quality Inspector'), async (req,res)=>{
  const doc = await QcReport.create(req.body);
  await audit(req.user.empId, 'CREATE', 'QC_REPORT', doc.qcReportId);
  res.status(201).json(doc);
});
app.get('/api/certifications', auth, allow('Quality Inspector','Auditor'), async (req,res)=>{
  const docs = await Certification.find().sort({ issuedAt:-1 }).limit(50);
  await audit(req.user.empId, 'VIEW', 'CERTIFICATION', 'ALL'); res.json(docs);
});
app.put('/api/certifications/:id', auth, allow('Quality Inspector'), async (req,res)=>{
  const cert = await Certification.findOne({ certificationId:req.params.id });
  if (!cert) return res.status(404).json({ error:'Certification not found' });
  if (cert.immutable) { await audit(req.user.empId, 'UPDATE_BLOCKED', 'CERTIFICATION', req.params.id, 'Fail'); return res.status(409).json({ error:'Certification is immutable after approval' }); }
  Object.assign(cert, req.body); await cert.save();
  await audit(req.user.empId, 'UPDATE', 'CERTIFICATION', req.params.id); res.json(cert);
});
app.get('/api/sensor-readings', auth, allow('Equipment Engineer','Supply Chain Manager'), async (req,res)=>{
  const docs = await SensorReading.find().sort({ timestamp:-1 }).limit(30);
  await audit(req.user.empId, 'VIEW', 'SENSOR_READING', 'LATEST'); res.json(docs);
});
app.get('/api/audit-logs', auth, allow('Auditor'), async (req,res)=>{
  const r = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100'); res.json(r.rows);
});

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log(`AeroNetB app running on ${port}`));
