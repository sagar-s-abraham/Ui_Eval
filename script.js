const firebaseConfig = {
    apiKey: "AIzaSyDdtbB2hQSBULJQtgNVl9X7QN1IH6yMDSQ",
    authDomain: "jsproject-6bca2.firebaseapp.com",
    databaseURL: "https://jsproject-6bca2-default-rtdb.firebaseio.com",
    projectId: "jsproject-6bca2",
    storageBucket: "jsproject-6bca2.firebasestorage.app",
    messagingSenderId: "225838463510",
    appId: "1:225838463510:web:ba50c3aa1327c1f1c39337",
    measurementId: "G-YZ0Z1MDLVT"
};

firebase.initializeApp(firebaseConfig);

const dealCreationDb = firebase.database().ref('dealCreationForm');

const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const dealName = document.getElementById('deal-name');
const companyName = document.getElementById('companyName');
const contactName = document.getElementById('contactName');
const stage = document.getElementById('deal-stage');
const amount = document.getElementById('amount');
const closingDate = document.getElementById('closingDate');
const description = document.getElementById('description');

saveBtn.addEventListener('click', () => {
    if (!dealName.value || !stage.value || !amount.value || !closingDate.value) {
        alert('Please fill in all required fields');
        return;
    }

    const ownerElement = document.querySelector('.owner-button span');
    const ownerName = ownerElement ? ownerElement.textContent.trim() : "Unknown";

    const deal = {
        owner: ownerName,
        dealName: dealName.value,
        companyName: companyName.value,
        contactName: contactName.value,
        stage: stage.value,
        amount: parseFloat(amount.value),
        closingDate: closingDate.value,
        description: description.value,
        createdAt: new Date().toISOString()
    };

    try {
        dealCreationDb.push(deal)
            .then(() => {
                alert('Successfully saved to Firebase');
            })
            .catch((error) => {
                alert('Firebase Error: ' + error.message);
            });
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

cancelBtn.addEventListener('click', () => {
    dealName.value = '';
    companyName.value = '';
    contactName.value = '';
    stage.value = '';
    amount.value = '';
    closingDate.value = '';
    description.value = '';
});

window.addEventListener('load', () => {
    if (typeof firebase !== 'undefined') {
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
        } catch (error) {
            alert('Firebase init error: ' + error.message);
        }
    } else {
        alert('Firebase is not available.');
    }
});