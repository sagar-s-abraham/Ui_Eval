document.addEventListener("DOMContentLoaded", () => {
    const projectName = document.querySelector('.project-name');
    const amountDetails = document.querySelector('.money');
    const closingDate = document.querySelector('.close-date');
    const companyName = document.querySelector('.name');

    const API_URL = 'https://jsproject-6bca2-default-rtdb.firebaseio.com/';
    const DEALS_ENDPOINT = API_URL + 'deals.json';

    const formatDate = dateString => {
        const date = new Date(dateString);
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    };

    // Mapping stages to step numbers
    const stageToStepMap = {
        'qualification': '1',
        'needs_analysis': '2',
        'proposal': '3',
        'negotiation': '4',
        'closed_won': '5',
        'closed_lost': '6'
    };

    // Mapping step numbers to stages
    const stepToStageMap = {
        '1': 'qualification',
        '2': 'needs_analysis',
        '3': 'proposal',
        '4': 'negotiation',
        '5': 'closed_won',
        '6': 'closed_lost'
    };

    // Fetch data from the Firebase deals endpoint
    const fetchDealData = () => {
        // Get the URL parameter for specific deal ID
        const urlParams = new URLSearchParams(window.location.search);
        const requestedDealId = urlParams.get('id');
        
        console.log('Fetching deals data from:', DEALS_ENDPOINT);
        console.log('Looking for deal ID:', requestedDealId);
        
        axios.get(DEALS_ENDPOINT)
            .then(response => {
                const dealsData = response.data;
                console.log('All deals data:', dealsData);
                
                let deal = null;
                let dealId = requestedDealId;
                
                // If we have a specific deal ID, use that
                if (requestedDealId && dealsData[requestedDealId]) {
                    deal = dealsData[requestedDealId];
                } else {
                    // Otherwise, find the first deal (or handle the case where no deals exist)
                    for (const id in dealsData) {
                        deal = dealsData[id];
                        dealId = id;
                        console.log(`Using first available deal with ID: ${dealId}`);
                        break;
                    }
                }
                
                if (deal) {
                    let currentStage = deal.stage;
                    console.log('Current stage:', currentStage);
                    // Update UI with deal data - adjust property names to match the actual data
                    if (projectName) {
                        // If dealName doesn't exist, use a fallback or the ID
                        projectName.textContent = deal.dealName || deal.name || dealId;
                        console.log('Project name set to:', projectName.textContent);
                    }
                    
                    if (closingDate) {
                        // Check if closingDate exists before formatting
                        closingDate.textContent = deal.closingDate ? formatDate(deal.closingDate) : 'No date set';
                        console.log('Closing date set to:', closingDate.textContent);
                    }
                    
                    if (companyName) {
                        // If companyName doesn't exist, use a fallback
                        companyName.textContent = deal.companyName || deal.company || 'No company';
                        console.log('Company name set to:', companyName.textContent);
                    }
                
                    if (amountDetails) {
                        // If amount doesn't exist, use 0
                        const amount = deal.amount || 0;
                        const formattedAmount = new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }).format(amount).replace('₹', '₹');
                
                        amountDetails.textContent = formattedAmount;
                        console.log('Amount set to:', formattedAmount);
                    }
                    
                    // Activate the step based on current stage
                    const stepNumber = stageToStepMap[currentStage] || '1';
                    console.log('Step number to activate:', stepNumber);
                    
                    if (typeof activateStep === 'function') {
                        activateStep(stepNumber);
                    }
                } else {
                    console.error("No deals found in the database");
                    if (projectName) projectName.textContent = 'Deal Not Found';
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };

    // Initialize the deal stage if available
    if (typeof initializeStepStatus === 'function') {
        initializeStepStatus();
    }
    
    // Call fetchDealData to load data
    fetchDealData();
});

// Function to activate a specific step on the details page
const activateStep = stepNumber => {
    const steps = document.querySelectorAll('.step');

    // Remove all status classes from all steps
    steps.forEach(step => {
        step.classList.remove('active', 'closed-lost', 'closed-won', 'inactive-lost', 'inactive-won');
    });

    // Find the step with the matching number and activate it
    steps.forEach(step => {
        const circleText = step.querySelector('.circle').innerText;

        if (circleText === stepNumber) {
            step.classList.add('active');

            // Apply special styling for won/lost steps
            if (stepNumber === '6') {
                step.classList.add('closed-lost');
                updateProgressLine('#f87171'); // Red
            } else if (stepNumber === '5') {
                step.classList.add('closed-won');
                updateProgressLine('#34d399'); // Green
            } else {
                updateProgressLine('#3b82f6'); // Blue for progress
            }
        }
    });

    // Get the current deal ID and save its updated stage
    const urlParams = new URLSearchParams(window.location.search);
    const dealId = urlParams.get('id');

    if (dealId) {
        // Use const definitions from the scope above
        const stepToStageMap = {
            '1': 'qualification',
            '2': 'needs_analysis',
            '3': 'proposal',
            '4': 'negotiation',
            '5': 'closed_won',
            '6': 'closed_lost'
        };
        
        localStorage.setItem(`deal_${dealId}_stage`, stepNumber);
        localStorage.setItem(`deal_${dealId}_stageName`, stepToStageMap[stepNumber]);
        
        // Update deal stage in the database
        updateDealStageInDatabase(dealId, stepToStageMap[stepNumber]);
    }
};

// Helper function to update progress line
const updateProgressLine = color => {
    const progressLine = document.querySelector('.progress-line');
    if (progressLine) {
        progressLine.style.backgroundColor = color;
    }
};

// Function to update deal stage in database
const updateDealStageInDatabase = (dealId, newStage) => {
    const API_URL = 'https://jsproject-6bca2-default-rtdb.firebaseio.com/';
    
    axios.patch(`${API_URL}deals/${dealId}.json`, { stage: newStage })
        .then(response => {
            console.log('Deal stage updated in database:', response.data);
        })
        .catch(error => {
            console.error('Error updating deal stage in database:', error);
        });
};
 
// Initialize steps status when details page loads
const initializeStepStatus = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dealId = urlParams.get('id');

    // Set up click handlers for steps
    const circles = document.querySelectorAll('.circle');
    circles.forEach(circle => {
        const step = circle.closest('.step');

        // Initialize inactive states
        if (circle.innerText === '6') {
            step.classList.add('inactive-lost');
        } else if (circle.innerText === '5') {
            step.classList.add('inactive-won');
        }

        // Add click handler
        circle.addEventListener('click', function() {
            const stepNumber = this.innerText;
            activateStep(stepNumber);
        });
    });
};


//Hari and Meera
// Global variable to store company data
document.addEventListener("DOMContentLoaded", () => {
    // Reuse API_URL from first script
    const API_URL = 'https://jsproject-6bca2-default-rtdb.firebaseio.com/';
    const DEALS_ENDPOINT = API_URL + 'deals.json';
    
    // Get deal ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const dealId = urlParams.get('id') || urlParams.get('dealId'); // Support both URL parameter styles
    
    // Format date function reused from first script
    const formatDate = dateString => {
        const date = new Date(dateString);
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    };
    
    // Fetch deal details
    const fetchDealDetails = () => {
        if (!dealId) {
            console.error('No deal ID found in the URL');
            return;
        }
        
        console.log('Fetching deal with ID:', dealId);
        
        axios.get(DEALS_ENDPOINT)
            .then(response => {
                const dealsData = response.data;
                
                if (dealsData && dealsData[dealId]) {
                    const dealData = dealsData[dealId];
                    
                    // Populate contact information
                    if (document.getElementById('contactname')) {
                        document.getElementById('contactname').textContent = dealData.contactName || 'No Name';
                    }
                    if (document.getElementById('contactemail')) {
                        document.getElementById('contactemail').textContent = dealData.contactEmail || 'No Email';
                    }
                    if (document.getElementById('contactnumber')) {
                        document.getElementById('contactnumber').textContent = dealData.contactPhoneNumber || 'No Phone Number';
                    }
                    
                    // Create company data structure
                    const companyData = {
                        companyName: dealData.companyName || 'Unknown Company',
                        companyInitials: (dealData.companyName || 'UC').substring(0, 2).toUpperCase(),
                        companyWebsite: {
                            url: dealData.companyWebsite || "www.defaultcompany.com",
                            icon: "fa-solid fa-earth-americas"
                        },
                        companyPhone: {
                            number: dealData.companyPhoneNumber || 'N/A',
                            icon: "fa-solid fa-phone"
                        },
                        description: dealData.description || "No description available",
                        tags: dealData.tags || [],
                        lastModified: {
                            date: dealData.createdAt ? formatDate(dealData.createdAt) : "Today",
                            time: dealData.timeCreated || "00:00 AM",
                            user: dealData.owner || "System"
                        },
                        stage: dealData.stage
                    };
                    
                    // Populate company details
                    populateCompanyDetails(companyData);
                    
                    // Setup interaction functionality
                    setupDescriptionEditFunctionality(companyData);
                    setupTagFunctionality(companyData);
                } else {
                    console.error('Deal not found in database');
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };
    
    // Populate company details function
    const populateCompanyDetails = (companyData) => {
        // Company initials and name
        const companyInitialsEl = document.querySelector('.company-initials');
        if (companyInitialsEl) {
            companyInitialsEl.textContent = companyData.companyInitials;
        }
        
        const companyNameEl = document.querySelector('.company-full-name');
        if (companyNameEl) {
            companyNameEl.textContent = companyData.companyName;
        }
        
        // Website details
        const websiteIcon = document.querySelector('.company-website-icon');
        const websiteLink = document.querySelector('.company-website-link');
        if (websiteIcon && websiteLink) {
            websiteIcon.className = companyData.companyWebsite.icon;
            websiteLink.href = companyData.companyWebsite.url;
            websiteLink.textContent = companyData.companyWebsite.url;
        }
        
        // Phone details
        const phoneIcon = document.querySelector('.company-phone-icon');
        const phoneNumber = document.querySelector('.company-phone-number');
        if (phoneIcon && phoneNumber) {
            phoneIcon.className = companyData.companyPhone.icon;
            phoneNumber.textContent = companyData.companyPhone.number;
        }
        
        // Description
        const descriptionTextarea = document.getElementById('description-text');
        if (descriptionTextarea) {
            descriptionTextarea.value = companyData.description;
        }
        
        // Last modified
        const modifiedDateEl = document.getElementById('modified-date');
        const modifiedUserEl = document.getElementById('modified-user');
        if (modifiedDateEl && modifiedUserEl) {
            modifiedDateEl.textContent = `${companyData.lastModified.date}, ${companyData.lastModified.time}`;
            modifiedUserEl.textContent = companyData.lastModified.user;
        }
        
        // Initialize tags
        const tagList = document.querySelector('.tag-list');
        if (tagList) {
            // Clear existing tags except add button
            const existingTags = tagList.querySelectorAll('.tag');
            existingTags.forEach(tag => tag.remove());
            
            // Add existing tags
            if (companyData.tags && companyData.tags.length) {
                const addTagButton = tagList.querySelector('.add-tag');
                companyData.tags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.classList.add('tag');
                    tagElement.textContent = tag;
                    tagList.insertBefore(tagElement, addTagButton);
                });
            }
        }
    };
    
    // Description edit functionality 
    const setupDescriptionEditFunctionality = (companyData) => {
        const descriptionTextarea = document.getElementById('description-text');
        const editButton = document.querySelector('.edit-button');
        const saveButton = document.querySelector('.save-button');
        const cancelButton = document.querySelector('.cancel-button');
        
        if (!descriptionTextarea || !editButton || !saveButton || !cancelButton) {
            return;
        }
        
        // Edit button click
        editButton.addEventListener('click', () => {
            descriptionTextarea.removeAttribute('readonly');
            descriptionTextarea.focus();
            editButton.style.display = 'none';
            saveButton.style.display = 'inline-flex';
            cancelButton.style.display = 'inline-flex';
        });
        
        // Save button click
        saveButton.addEventListener('click', () => {
            const newDescription = descriptionTextarea.value;
            companyData.description = newDescription;
            
            // Update deal description in database
            updateDealInDatabase(dealId, { description: newDescription });
            
            descriptionTextarea.setAttribute('readonly', true);
            editButton.style.display = 'inline-flex';
            saveButton.style.display = 'none';
            cancelButton.style.display = 'none';
        });
        
        // Cancel button click
        cancelButton.addEventListener('click', () => {
            descriptionTextarea.value = companyData.description;
            descriptionTextarea.setAttribute('readonly', true);
            editButton.style.display = 'inline-flex';
            saveButton.style.display = 'none';
            cancelButton.style.display = 'none';
        });
    };
    
    // Tag functionality
    const setupTagFunctionality = (companyData) => {
        const tagList = document.querySelector('.tag-list');
        const addTagButton = tagList?.querySelector('.add-tag');
        
        if (!tagList || !addTagButton) {
            return;
        }
        
        addTagButton.addEventListener('click', () => {
            // Remove add tag button temporarily
            addTagButton.remove();
            
            // Create input container
            const inputContainer = document.createElement('div');
            inputContainer.classList.add('tag-input-container');
            
            // Create input field
            const newTagInput = document.createElement('input');
            newTagInput.type = 'text';
            newTagInput.classList.add('new-tag-input');
            newTagInput.placeholder = 'Enter new tag';
            
            // Create save button
            const saveButton = document.createElement('button');
            saveButton.innerHTML = '✔';
            saveButton.classList.add('tag-save-button');
            
            // Create cancel button
            const cancelButton = document.createElement('button');
            cancelButton.innerHTML = '✖';
            cancelButton.classList.add('tag-cancel-button');
            
            // Append elements to container
            inputContainer.appendChild(newTagInput);
            inputContainer.appendChild(saveButton);
            inputContainer.appendChild(cancelButton);
            
            // Add container to tag list
            tagList.appendChild(inputContainer);
            
            // Focus on input
            newTagInput.focus();
            
            // Save tag functionality
            saveButton.addEventListener('click', () => {
                const tagValue = newTagInput.value.trim();
                if (tagValue) {
                    // Create tag element
                    const tagElement = document.createElement('span');
                    tagElement.classList.add('tag');
                    tagElement.textContent = tagValue;
                    
                    // Add to companyData
                    if (!companyData.tags) companyData.tags = [];
                    companyData.tags.push(tagValue);
                    
                    // Update deal tags in database
                    updateDealInDatabase(dealId, { tags: companyData.tags });
                    
                    // Insert tag before input container
                    tagList.insertBefore(tagElement, inputContainer);
                    
                    // Restore add tag button
                    tagList.appendChild(addTagButton);
                    
                    // Remove input container
                    inputContainer.remove();
                }
            });
            
            // Cancel button functionality
            cancelButton.addEventListener('click', () => {
                inputContainer.remove();
                tagList.appendChild(addTagButton);
            });
            
            // Enter key to save
            newTagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveButton.click();
                }
            });
        });
    };
    
    // Helper function to update deal in database
    const updateDealInDatabase = (dealId, updatedData) => {
        axios.patch(`${API_URL}deals/${dealId}.json`, updatedData)
            .then(response => {
                console.log('Deal updated in database:', response.data);
            })
            .catch(error => {
                console.error('Error updating deal in database:', error);
            });
    };
    
    // Initialize
    fetchDealDetails();
});

//Sagar
document.addEventListener("DOMContentLoaded", function() {
    fetchDealData();
    });
 
function fetchDealData() {
    axios.get("https://jsproject-6bca2-default-rtdb.firebaseio.com/deals.json")
        .then(response => {
            if (response.data) {
                const dealKey = Object.keys(response.data)[0];
                const deal = response.data[dealKey];
               
                if (deal && deal.stageHistory) {
                    displayTimeStamps(deal.stageHistory, deal.owner || "Unknown Owner", dealKey);
                }
            }
        });
}
 
function displayTimeStamps(stageHistory, ownerName, dealId) {
    const timelineContainer = document.getElementById("timeline");
    timelineContainer.innerHTML = "";
   
    stageHistory.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
   
    stageHistory.forEach((entry, index) => {
        let statusTransition;
        if (index === stageHistory.length - 1) {
            statusTransition = `'Started' to '${entry.stage}'`;
        } else {
            statusTransition = `'${stageHistory[index + 1].stage}' to '${entry.stage}'`;
        }
       
        const timelineItem = document.createElement("div");
        timelineItem.classList.add("timeline-item");
        timelineItem.innerHTML = `
            <span class="time">${entry.time}</span>
            <div class="dot-line">
                <div class="timeline-icon"></div>
            </div>
            <div class="timeline-content">
                <p>Stage updated by <strong>${ownerName}</strong></p>
                <p>${statusTransition}</p>
            </div>
        `;
        timelineContainer.appendChild(timelineItem);
    });
}
 
function displayEmptyTimeline() {
    const timelineContainer = document.getElementById("timeline");
    timelineContainer.innerHTML = `
        <div class="empty-state">
            <p>No timeline data available</p>
        </div>
    `;
}
 
function formatDate(timestamp) {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString();
}
 