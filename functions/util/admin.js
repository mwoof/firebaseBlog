const admin = require('firebase-admin');
const serviceAccount = require("ADD INFORMATION");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "ADD INFORMATION",
  storageBucket: "ADD INFORMATION"
});

const db = admin.firestore();

module.exports = { admin, db };
