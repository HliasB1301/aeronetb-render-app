require('dotenv').config();
const mongoose = require('mongoose');

const qcReportSchema = new mongoose.Schema({}, { strict:false });
const certificationSchema = new mongoose.Schema({}, { strict:false });
const sensorReadingSchema = new mongoose.Schema({}, { strict:false });
const QcReport = mongoose.model('qc_reports', qcReportSchema);
const Certification = mongoose.model('certifications', certificationSchema);
const SensorReading = mongoose.model('sensor_readings', sensorReadingSchema);

async function run(){
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aeronetb');
  await Promise.all([QcReport.deleteMany({}), Certification.deleteMany({}), SensorReading.deleteMany({})]);
  await QcReport.insertMany([
    { qcReportId:'QC1001', deliveredItemId:'DI5001', reportType:'DIMENSIONAL_NDT', status:'APPROVED', inspectorId:'EMP002', measurements:{length:10.2,width:5.1,tolerance:'OK'}, defects:[], remarks:'Passed dimensional and NDT checks', createdAt:new Date() },
    { qcReportId:'QC1002', deliveredItemId:'DI5002', reportType:'ENVIRONMENTAL_STRESS', status:'REJECTED', inspectorId:'EMP002', measurements:{temperatureCycle:'Fail'}, defects:[{type:'thermal fatigue', severity:'high'}], remarks:'Rejected after stress test', createdAt:new Date() }
  ]);
  await Certification.insertMany([
    { certificationId:'CERT9001', deliveredItemId:'DI5001', issuedAt:new Date(), approvedBy:'EMP002', approvalStatus:'APPROVED', documentReference:'Component_certification.pdf', digitalSignature:'hash_signature_001', immutable:true },
    { certificationId:'CERT9002', deliveredItemId:'DI5002', issuedAt:new Date(), approvedBy:'EMP002', approvalStatus:'DRAFT', documentReference:'draft_certification.pdf', digitalSignature:null, immutable:false }
  ]);
  await SensorReading.insertMany([
    { deviceId:'DEV1001', equipmentId:'EQ2001', timestamp:new Date(), metrics:{temperature:22.5, pressure:1.02, vibration:0.03}, location:{latitude:51.5074, longitude:-0.1278}, alertLevel:'OK' },
    { deviceId:'DEV1002', equipmentId:'EQ2002', timestamp:new Date(), metrics:{temperature:86.2, pressure:1.41, vibration:0.22}, location:{latitude:51.509, longitude:-0.13}, alertLevel:'CRITICAL' }
  ]);
  console.log('MongoDB dummy data inserted');
  await mongoose.disconnect();
}
run().catch(e=>{ console.error(e); process.exit(1); });
