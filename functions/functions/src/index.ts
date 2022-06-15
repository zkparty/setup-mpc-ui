import firebaseConfig from './firebaseConfig';
import TimeoutWatchdog from './Timeout';
import CeremonyStarter from './CeremonyStarter';
import AutoValidate from './AutoValidate';

const fbAdmin = require('firebase-admin');

fbAdmin.initializeApp(firebaseConfig);

exports.TimeoutWatchdog = TimeoutWatchdog;
exports.CeremonyStarter = CeremonyStarter;
exports.AutoValidate = AutoValidate;
exports.Metrics = require('./Metrics');
exports.Auth = require('./AuthFunction');
