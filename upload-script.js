// This script is for one-time use to bulk upload companies to Firestore.
const admin = require('firebase-admin');
const fs = require('fs');

// IMPORTANT: You must point this to your service account key file.
// Download it from Firebase Console > Project Settings > Service accounts.
const serviceAccount = require('./serviceAccountKey.json'); 

const newCompanies = require('./new-companies.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const companiesCollection = db.collection('companies');

const uploadCompanies = async () => {
  console.log('Starting company upload...');
  
  if (!newCompanies || newCompanies.length === 0) {
    console.log('No companies found in new-companies.json file.');
    return;
  }

  const batch = db.batch();

  newCompanies.forEach(company => {
    // We use the 'id' from our JSON file as the document ID in Firestore.
    const docRef = companiesCollection.doc(company.id);
    
    // Set the company data. We remove the 'id' field as it's not needed inside the document itself.
    const { id, ...companyData } = company; 
    
    // Set default values for calculated fields.
    const finalData = {
      ...companyData,
      averageDiscount: 0,
      totalSubmissions: 0,
      vendorScore: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
        // This line MERGES the data, only updating the fields you provide
        batch.set(docRef, finalData, { merge: true });
  });

  try {
    await batch.commit();
    console.log(`✅ Successfully uploaded ${newCompanies.length} companies to Firestore!`);
  } catch (error) {
    console.error('🔥 Error uploading companies:', error);
  }
};

uploadCompanies();