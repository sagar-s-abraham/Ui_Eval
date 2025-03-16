const API_URL = 'https://jsproject-6bca2-default-rtdb.firebaseio.com/';
const DEALS_ENDPOINT = API_URL + 'deals.json'; 

// DOM Elements
const dealModal = document.getElementById('dealModal');
const dealForm = document.getElementById('dealForm');
const addDealButtons = document.querySelectorAll('.add-deal-btn');
const closeButtons = document.querySelectorAll('.close-btn');
const cancelButtons = document.querySelectorAll('.cancel-btn');

// Stage data mapping
const stageMap = {
  qualification: { name: 'Qualification', element: document.querySelector('[data-stage="qualification"]') },
  needs_analysis: { name: 'Needs Analysis', element: document.querySelector('[data-stage="needs-analysis"]') },
  proposal: { name: 'Proposal/Price Quote', element: document.querySelector('[data-stage="proposal"]') },
  negotiation: { name: 'Negotiation/Review', element: document.querySelector('[data-stage="negotiation"]') },
  closed_won: { name: 'Closed Won', element: document.querySelector('[data-stage="closed"]') },
  closed_lost: { name: 'Closed Lost', element: document.querySelector('[data-stage="closed"]') }
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('₹', '₹');
};

// Format date to MMM DD format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
};

// Show modal
const showModal = (modal) => {
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
};

// Hide modal
const hideModal = (modal) => {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
};

// Create deal card HTML
const createDealCardHTML = (deal) => {
  return `
    <a href="details.html">
    <div class="deal-card" draggable="true" data-deal-id="${deal.id}">
      <div class="deal-title">${deal.dealName}</div>
      <div class="deal-owner">${deal.contactName}</div>
      <div class="deal-details">
        <span class="deal-amount">${formatCurrency(deal.amount)}</span>
        <span class="deal-date">${formatDate(deal.closingDate)}</span>
      </div>
    </div>
    </a>
  `;
};

// Add deal to stage
const addDealToStage = (deal) => {
  const stage = stageMap[deal.stage]?.element;
  if (!stage) return; // Skip if stage doesn't exist
  
  const dealsContainer = stage.querySelector('.stage-deals');
  
  // Remove "This stage is empty" message if it exists
  const emptyMessage = dealsContainer.querySelector('.empty-stage');
  if (emptyMessage) {
    dealsContainer.innerHTML = '';
  }
  
  // Add deal card to stage
  dealsContainer.insertAdjacentHTML('beforeend', createDealCardHTML(deal));
  
  // Update stage stats
  updateStageStats(deal.stage);
  
  // Add event listeners to the new deal card
  addDealCardEventListeners();
};

// Update stage statistics
const updateStageStats = (stageId) => {
  const stage = stageMap[stageId].element;
  if (!stage) return; // Skip if stage element doesn't exist
  
  const deals = stage.querySelectorAll('.deal-card');
  const amountElement = stage.querySelector('.stage-amount');
  const countElement = stage.querySelector('.stage-count');
  
  // Calculate total amount
  let totalAmount = 0;
  deals.forEach(deal => {
    const amountText = deal.querySelector('.deal-amount').textContent;
    const amount = parseFloat(amountText.replace(/[₹,]/g, ''));
    totalAmount += isNaN(amount) ? 0 : amount;
  });
  
  // Update stats
  amountElement.textContent = formatCurrency(totalAmount);
  countElement.textContent = `${deals.length} Deal${deals.length !== 1 ? 's' : ''}`;
  
};

// Add event listeners to deal cards
const addDealCardEventListeners = () => {
  
  
  // Make cards draggable
  document.querySelectorAll('.deal-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', card.getAttribute('data-deal-id'));
      setTimeout(() => {
        card.classList.add('dragging');
      }, 0);
    });
    
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
  });
};

// Make stages droppable
const setupDragAndDrop = () => {
  document.querySelectorAll('.stage').forEach(stage => {
    stage.addEventListener('dragover', (e) => {
      e.preventDefault();
      stage.classList.add('drag-over');
    });
    
    stage.addEventListener('dragleave', () => {
      stage.classList.remove('drag-over');
    });
    
    stage.addEventListener('drop', (e) => {
      e.preventDefault();
      stage.classList.remove('drag-over');
      
      const dealId = e.dataTransfer.getData('text/plain');
      const dealCard = document.querySelector(`[data-deal-id="${dealId}"]`);
      const sourceStage = dealCard.closest('.stage');
      const targetStage = stage;
      
      if (sourceStage !== targetStage) {
        const dealsContainer = targetStage.querySelector('.stage-deals');
        dealsContainer.appendChild(dealCard);
        
        // Update deal in database
        const newStage = targetStage.getAttribute('data-stage');
        updateDealStage(dealId, newStage);
        
        // Update stats for both stages
        updateStageStats(sourceStage.getAttribute('data-stage'));
        updateStageStats(newStage);
      }
    });
  });
};

// Update deal stage in database
const updateDealStage = (dealId, newStage) => {
  // Now using the deals table structure
  axios.patch(`${API_URL}deals/${dealId}.json`, { stage: newStage })
    .then(response => {
      console.log('Deal stage updated:', response.data);
    })
    .catch(error => {
      console.error('Error updating deal stage:', error);
    });
};

// Fetch deals from API
const fetchDeals = () => {
  axios.get(DEALS_ENDPOINT)
    .then(response => {
      const dealsData = response.data;
      
      // Clear existing deals
      document.querySelectorAll('.stage-deals').forEach(container => {
        // Reset to empty state
        container.innerHTML = '<div class="empty-stage">This stage is empty</div>';
      });
      
      if (dealsData) {
        const deals = Object.entries(dealsData).map(([id, deal]) => {
          return { ...deal, id };
        });
        
        // Only remove empty state when deals are added
        deals.forEach(deal => {
          const stage = stageMap[deal.stage]?.element;
          if (stage) {
            const dealsContainer = stage.querySelector('.stage-deals');
            // Remove empty state message if this is the first deal
            if (dealsContainer.querySelector('.empty-stage')) {
              dealsContainer.innerHTML = '';
            }
            addDealToStage(deal);
          }
        });
      }
      
      // Update all stage stats
      Object.keys(stageMap).forEach(stageId => {
        if (stageMap[stageId].element) {
          updateStageStats(stageId);
        }
      });
      
      setupDragAndDrop();
    })
    .catch(error => {
      console.error('Error fetching deals:', error);
    });
};
// Initialize date picker for closing date
const initDatePicker = () => {
  const closingDateInput = document.getElementById('closingDate');
  
  closingDateInput.addEventListener('focus', () => {
    // Simple date format validation on blur
    closingDateInput.addEventListener('blur', () => {
      const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
      if (!datePattern.test(closingDateInput.value) && closingDateInput.value !== '') {
        closingDateInput.classList.add('error');
      } else {
        closingDateInput.classList.remove('error');
      }
    });
  });
};

// Event Listeners
// Open deal modal
addDealButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Reset form
    dealForm.reset();
    
    // Set stage value if the button is in a specific stage
    const stage = btn.closest('.stage');
    if (stage) {
      const stageId = stage.getAttribute('data-stage');
      document.getElementById('stage').value = stageId;
    }
    
    showModal(dealModal);
  });
});

// Close modals
closeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal');
    hideModal(modal);
  });
});

// Cancel buttons
cancelButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal');
    hideModal(modal);
  });
});

// Submit deal form
// Submit deal form
dealForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Get form data
  const formData = new FormData(dealForm);
  const dealData = {
    dealName: formData.get('dealName'),
    companyName: formData.get('companyName'),
    companyPhoneNumber: formData.get('companyPhnNumber'),  // Add company phone
    contactName: formData.get('contactName'),
    contactPhoneNumber: formData.get('contactPhnNumber'),  // Add contact phone
    contactEmail: formData.get('contactEmail'),            // Add contact email
    stage: formData.get('stage'),
    amount: parseFloat(formData.get('amount')),
    closingDate: formData.get('closingDate'),
    description: formData.get('description'),
    owner: 'Abhiram M Prasad', // Default owner
    createdAt: new Date().toISOString(),
    timestamp: Date.now(),
    timeCreated: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
  };
  
  axios.post(DEALS_ENDPOINT, dealData)
    .then(response => {
      console.log('Deal created:', response.data);
      
      // Get the deal ID from the response
      const dealId = response.data.name;
      
      addDealToStage({...dealData, id: dealId});
      
      // Close modal
      hideModal(dealModal);
    })
    .catch(error => {
      console.error('Error creating deal:', error);
      alert('Error creating deal. Please try again.');
    });
});



// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === dealModal) {
    hideModal(dealModal);
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Fetch deals from API
  fetchDeals();
  
  // Initialize date picker
  initDatePicker();
  
  // Add event listeners to existing deal cards
  addDealCardEventListeners();
});

const today = new Date().toISOString().split('T')[0];
document.getElementById('closingDate').setAttribute('min', today);
document.getElementById('closingDate').addEventListener('focus', function() {
  this.showPicker();
});

//Changed the API_URL to point to the base URL
//Added a DEALS_ENDPOINT constant that points to a 'deals.json' node