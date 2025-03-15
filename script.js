// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const stages = document.querySelectorAll('.stage');
    const dealCards = document.querySelectorAll('.deal-card');
    const expandButtons = document.querySelectorAll('.expand-btn');
    const stageCheckboxes = document.querySelectorAll('.stage-checkbox');
    
    // Variables to track drag state
    let draggedCard = null;
    
    // Initialize drag and drop functionality
    initDragAndDrop();
    
    // Initialize expandable stages
    initExpandableStages();
    
    // Initialize stage toggle checkboxes
    initStageToggles();
    
    /**
     * Initialize drag and drop functionality for deal cards
     */
    function initDragAndDrop() {
        // Add event listeners to deal cards
        dealCards.forEach(card => {
            // Drag start event
            card.addEventListener('dragstart', (e) => {
                draggedCard = card;
                setTimeout(() => {
                    card.classList.add('dragging');
                }, 0);
                
                // Set data transfer for drag operation
                e.dataTransfer.setData('text/plain', card.dataset.dealId);
                e.dataTransfer.effectAllowed = 'move';
            });
            
            // Drag end event
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                draggedCard = null;
                
                // Remove drag-over class from all stages
                stages.forEach(stage => {
                    stage.classList.remove('drag-over');
                });
            });
        });
        
        // Add event listeners to stages
        stages.forEach(stage => {
            // Drag over event
            stage.addEventListener('dragover', (e) => {
                e.preventDefault();
                stage.classList.add('drag-over');
                e.dataTransfer.dropEffect = 'move';
            });
            
            // Drag leave event
            stage.addEventListener('dragleave', () => {
                stage.classList.remove('drag-over');
            });
            
            // Drop event
            stage.addEventListener('drop', (e) => {
                e.preventDefault();
                stage.classList.remove('drag-over');
                
                if (draggedCard) {
                    // Get the stage deals container
                    const stageDeals = stage.querySelector('.stage-deals');
                    
                    // Check if the stage is empty
                    const emptyStage = stageDeals.querySelector('.empty-stage');
                    if (emptyStage) {
                        // Remove the empty stage message
                        emptyStage.remove();
                    }
                    
                    // Move the card to the new stage
                    stageDeals.appendChild(draggedCard);
                    
                    // Update stage statistics
                    updateStageStats();
                }
            });
        });
    }


    /**
     * Update stage statistics after card movement
     */
    function updateStageStats() {
        stages.forEach(stage => {
            const dealCards = stage.querySelectorAll('.deal-card');
            const stageAmount = stage.querySelector('.stage-amount');
            const stageCount = stage.querySelector('.stage-count');
            
            // Calculate total amount
            let totalAmount = 0;
            dealCards.forEach(card => {
                const amountText = card.querySelector('.deal-amount').textContent;
                const amount = parseFloat(amountText.replace('₹', '').replace(',', ''));
                totalAmount += amount;
            });
            
            // Update stage statistics
            stageAmount.textContent = `₹${totalAmount.toFixed(2)}`;
            stageCount.textContent = `${dealCards.length} Deal${dealCards.length !== 1 ? 's' : ''}`;
            
            // Add or remove empty stage message
            const stageDeals = stage.querySelector('.stage-deals');
            const existingEmptyMessage = stageDeals.querySelector('.empty-stage');
            
            if (dealCards.length === 0 && !existingEmptyMessage) {
                const emptyMessage = document.createElement('div');
                emptyMessage.classList.add('empty-stage');
                emptyMessage.textContent = 'This stage is empty';
                stageDeals.appendChild(emptyMessage);
            } else if (dealCards.length > 0 && existingEmptyMessage) {
                existingEmptyMessage.remove();
            }
        });
    }
});

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