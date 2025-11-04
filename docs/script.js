// --- 1. INITIALIZATION AND DATA KEYS ---
const ROUBLES_KEY = 'eftZthRoubles';
const DEBT_KEY = 'eftZthDebt';
const TAXES_KEY = 'eftZthTaxes'; 
const COMPLETED_TASKS_KEY = 'eftZthCompletedTasks'; 

// Default starting values
let roubles = 0;
let debt = 0;
let taxesPaid = 0;
let completedTasks = {}; 

// DOM Elements
const roublesDisplay = document.getElementById('roubles-display');
const debtDisplay = document.getElementById('debt-display');
const taxesPaidDisplay = document.getElementById('taxes-paid-display'); 
const debtStatusDisplay = document.getElementById('debt-status-display'); // NEW ELEMENT for dedicated debt page

const navButtons = document.querySelectorAll('.nav-btn');
const pageContents = document.querySelectorAll('.page-content');
const saveButton = document.getElementById('save-btn');
const expandableCards = document.querySelectorAll('.task-card.expandable'); 
const currencyActionButtons = document.querySelectorAll('.action-btn'); 
const taxAddButton = document.getElementById('add-tax-btn'); 

// --- 2. CORE LOGIC FUNCTIONS ---
function loadProgress() {
    roubles = parseInt(localStorage.getItem(ROUBLES_KEY) || '0');
    debt = parseInt(localStorage.getItem(DEBT_KEY) || '0');
    taxesPaid = parseInt(localStorage.getItem(TAXES_KEY) || '0');
    completedTasks = JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEY) || '{}');
    
    updateDisplay();
    updateAllTaskStatuses(); 
}

function updateDisplay() {
    // Status Bar & Taxes Page
    roublesDisplay.textContent = roubles.toLocaleString(); 
    debtDisplay.textContent = debt.toLocaleString();
    taxesPaidDisplay.textContent = taxesPaid.toLocaleString();
    
    // NEW: Update Debt on dedicated Debt Page
    if (debtStatusDisplay) {
        debtStatusDisplay.textContent = debt.toLocaleString();
    }
}

function saveProgress() {
    localStorage.setItem(ROUBLES_KEY, roubles);
    localStorage.setItem(DEBT_KEY, debt);
    localStorage.setItem(TAXES_KEY, taxesPaid);
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    console.log('Progress saved.'); 
    alert('Progress saved to your browser!');
}

// --- 3. TASK COMPLETION / UNMARK LOGIC ---
function updateTaskStatus(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const toggleButton = taskCard.querySelector('.task-toggle-btn');

    if (!toggleButton) return; // Guard against missing button

    if (completedTasks[taskId]) {
        taskCard.classList.add('task-completed');
        toggleButton.textContent = 'Mark as Uncomplete';
        toggleButton.classList.remove('complete-btn');
        toggleButton.classList.add('uncomplete-btn');
    } else {
        taskCard.classList.remove('task-completed');
        toggleButton.textContent = 'Mark as Complete';
        toggleButton.classList.remove('uncomplete-btn');
        toggleButton.classList.add('complete-btn');
    }
}

function updateAllTaskStatuses() {
    expandableCards.forEach(updateTaskStatus);
}


function handleTaskToggle(event) {
    const button = event.target;
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    const rblReward = parseInt(button.getAttribute('data-reward-roubles') || '0');

    if (completedTasks[taskId]) {
        // ACTION: UNMARK AS COMPLETE
        completedTasks[taskId] = false;
        roubles = Math.max(0, roubles - rblReward); 
    } else {
        // ACTION: MARK AS COMPLETE
        completedTasks[taskId] = true;
        roubles += rblReward;
    }

    updateTaskStatus(taskCard);
    updateDisplay();
    saveProgress();
}

// Attach the toggle handler to all task buttons
document.querySelectorAll('.task-toggle-btn').forEach(button => {
    button.addEventListener('click', handleTaskToggle);
});

// --- 4. CUSTOM CURRENCY ACTION LOGIC ---
function handleCurrencyAction(event) {
    const currency = event.target.getAttribute('data-currency');
    const action = event.target.getAttribute('data-action');
    
    const inputId = (currency === 'taxes') ? 'tax-amount' : `${currency}-amount`;
    const inputElement = document.getElementById(inputId);
    
    const amount = parseInt(inputElement.value || '0');
    inputElement.value = '';

    if (amount <= 0 || isNaN(amount)) {
        alert("Please enter a valid amount greater than 0.");
        return;
    }

    if (currency === 'roubles') {
        if (action === 'add') {
            roubles += amount;
        } else if (action === 'subtract') {
            roubles = Math.max(0, roubles - amount); 
        }
    } else if (currency === 'debt') {
        if (action === 'add') {
            debt += amount;
        } else if (action === 'subtract') {
            debt = Math.max(0, debt - amount); 
        }
    } else if (currency === 'taxes' && action === 'add') {
        taxesPaid += amount;
    }

    updateDisplay();
    saveProgress();
}

// Attach action handlers to all buttons
currencyActionButtons.forEach(button => {
    button.addEventListener('click', handleCurrencyAction);
});

if (taxAddButton) {
    taxAddButton.addEventListener('click', handleCurrencyAction);
}


// --- 5. EXPAND/COLLAPSE TASK LOGIC ---
expandableCards.forEach(card => {
    card.addEventListener('click', (event) => {
        if (event.target.classList.contains('task-toggle-btn') || event.target.closest('.currency-input-group')) {
            return;
        }

        const expandedView = card.querySelector('.expanded-view');
        
        if (expandedView) {
            const isHidden = window.getComputedStyle(expandedView).display === 'none';
            expandedView.style.display = isHidden ? 'block' : 'none';
        }
    });
});

// --- 6. NAVIGATION ---
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetPageId = button.getAttribute('data-page');

        pageContents.forEach(page => {
            page.classList.remove('active-page');
            page.classList.add('hidden-page');
        });

        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.add('active-page');
            targetPage.classList.remove('hidden-page');
        }
    });
});

// Attach save function to button
saveButton.addEventListener('click', saveProgress);

// Load progress when the page first loads
loadProgress();
