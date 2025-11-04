// --- 1. INITIALIZATION AND DATA KEYS ---
const COMPLETED_TASKS_KEY = 'eftZthCompletedTasksMinimal';
const COMPLETED_OBJECTIVES_KEY = 'eftZthCompletedObjectives'; 
const TRADER_LL_KEY = 'eftZthTraderLL'; 

let completedTasks = {}; 
let completedObjectives = {}; 
let traderLL = {}; 

// DOM Elements
const expandableCards = document.querySelectorAll('.task-card.expandable'); 
const traderFilter = document.getElementById('trader-filter');
const taskSearch = document.getElementById('task-search');
const llCheckboxes = document.querySelectorAll('#ll-tracker input[type="checkbox"]');

// --- 2. CORE LOGIC FUNCTIONS ---
function loadProgress() {
    completedTasks = JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEY) || '{}');
    completedObjectives = JSON.parse(localStorage.getItem(COMPLETED_OBJECTIVES_KEY) || '{}'); 
    
    // Initialize all 7 traders in the default data structure (FIXED)
    const defaultData = { 
        Prapor: { 1: false, 2: false, 3: false, 4: false }, 
        Skier: { 1: false, 2: false, 3: false, 4: false },
        Therapist: { 1: false, 2: false, 3: false, 4: false },
        Peacekeeper: { 1: false, 2: false, 3: false, 4: false },
        Mechanic: { 1: false, 2: false, 3: false, 4: false },   
        Ragman: { 1: false, 2: false, 3: false, 4: false },
        Jaeger: { 1: false, 2: false, 3: false, 4: false },
    };

    traderLL = JSON.parse(localStorage.getItem(TRADER_LL_KEY) || JSON.stringify(defaultData)); 
    
    // Apply loaded state to DOM
    expandableCards.forEach(card => {
        const taskId = card.dataset.taskId;
        if (completedTasks[taskId]) {
            card.classList.add('completed');
        } else {
            card.classList.remove('completed');
        }
        
        // Re-run status update to ensure UI reflects data and has rewards summary
        updateTaskStatus(card);
        
        // Apply objective state
        if (completedObjectives[taskId]) {
            Object.entries(completedObjectives[taskId]).forEach(([objId, isChecked]) => {
                const checkbox = card.querySelector(`[data-objective-id="${objId}"] input[type="checkbox"]`);
                if (checkbox) {
                    checkbox.checked = isChecked;
                }
            });
        }
    });

    // Apply LL state
    llCheckboxes.forEach(checkbox => {
        const trader = checkbox.closest('.trader-ll-group').dataset.trader;
        const ll = checkbox.dataset.ll;
        if (traderLL[trader] && traderLL[trader][ll]) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    });
}

function saveProgress() {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    localStorage.setItem(COMPLETED_OBJECTIVES_KEY, JSON.stringify(completedObjectives));
    localStorage.setItem(TRADER_LL_KEY, JSON.stringify(traderLL));
}

// --- 3. FILTERING LOGIC ---
function filterTasks() {
    const selectedTrader = traderFilter.value;
    const searchText = taskSearch.value.toLowerCase();

    expandableCards.forEach(card => {
        const trader = card.dataset.trader;
        const title = card.querySelector('.task-title').textContent.toLowerCase();

        const traderMatch = selectedTrader === 'all' || trader === selectedTrader;
        const searchMatch = title.includes(searchText);

        if (traderMatch && searchMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

traderFilter.addEventListener('change', filterTasks);
taskSearch.addEventListener('input', filterTasks);


// --- 4. LOYALTY LEVEL (LL) TRACKER LOGIC ---
llCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
        const trader = event.target.closest('.trader-ll-group').dataset.trader;
        const ll = event.target.dataset.ll;
        
        if (traderLL[trader]) {
            traderLL[trader][ll] = event.target.checked;
        } else {
            // Should not happen if defaultData is initialized correctly
            traderLL[trader] = { [ll]: event.target.checked };
        }
        
        saveProgress();
    });
});


// --- 5. OBJECTIVE CHECKBOX LOGIC ---
document.querySelectorAll('.objective-checklist input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
        const taskCard = event.target.closest('.task-card');
        const taskId = taskCard.dataset.taskId;
        const objectiveId = event.target.closest('.objective-item').dataset.objectiveId;

        if (!completedObjectives[taskId]) {
            completedObjectives[taskId] = {};
        }
        
        completedObjectives[taskId][objectiveId] = event.target.checked;
        
        saveProgress();
        event.stopPropagation(); // Prevent card expansion when checking objectives
    });
});


// --- 6. TASK STATUS & REWARD DISPLAY LOGIC ---

/**
 * Updates the visual status of a task card and its collapsed summary.
 * This is crucial for displaying rewards in the collapsed view.
 * @param {HTMLElement} taskCard - The HTML element of the task card.
 */
function updateTaskStatus(taskCard) {
    const taskId = taskCard.dataset.taskId;
    const isCompleted = completedTasks[taskId] || false;
    
    const statusText = taskCard.querySelector('.task-status-text');
    const toggleButton = taskCard.querySelector('.task-toggle-btn');
    const collapsedRequirements = taskCard.querySelector('.collapsed-requirements');

    // Update Text and Button Style
    if (isCompleted) {
        taskCard.classList.add('completed');
        statusText.textContent = 'Status: Complete';
        toggleButton.textContent = 'Mark as Uncomplete';
        toggleButton.classList.remove('complete-btn');
        toggleButton.classList.add('uncomplete-btn');
    } else {
        taskCard.classList.remove('completed');
        statusText.textContent = 'Status: In Progress';
        toggleButton.textContent = 'Mark as Complete';
        toggleButton.classList.remove('uncomplete-btn');
        toggleButton.classList.add('complete-btn');
    }

    // --- Currency/Reward Summary Update (Collapsed View) ---
    // Fetch reward/penalty data from the button's data attributes
    // Use reward if penalty is 0, and vice versa. Assuming a task gives either a reward OR a penalty.
    const roubles = parseInt(toggleButton.dataset.rewardRoubles || 0) - parseInt(toggleButton.dataset.penaltyRoubles || 0);
    const dollars = parseInt(toggleButton.dataset.rewardDollars || 0) - parseInt(toggleButton.dataset.penaltyDollars || 0);
    const euros = parseInt(toggleButton.dataset.rewardEuros || 0) - parseInt(toggleButton.dataset.penaltyEuros || 0);

    let summaryContent = '';
    
    // Helper to format currency
    const formatCurrency = (amount, symbol, currencyClass) => {
        if (amount === 0) return '';
        const sign = amount > 0 ? '+' : '';
        const absAmount = Math.abs(amount).toLocaleString();
        return `<span class="currency ${currencyClass}">${sign}${absAmount} ${symbol}</span>`;
    };

    // Use the new currencies here
    const rblText = formatCurrency(roubles, 'Rbls', 'rouble-reward');
    const usdText = formatCurrency(dollars, 'USD', 'dollar-reward');
    const eurText = formatCurrency(euros, 'EUR', 'euro-reward');

    // Build the reward line for the collapsed view
    const currencyParts = [rblText, usdText, eurText].filter(Boolean);
    
    if (currencyParts.length > 0) {
        summaryContent += `<p class="reward-summary">💰 Rewards: ${currencyParts.join(', ')}</p>`;
    }
    
    // Add Rep summary (This is basic and assumes a simple rep structure)
    const rewardTrader = toggleButton.dataset.rewardTrader;
    const penaltyTrader = toggleButton.dataset.penaltyTrader;
    const repReward = parseFloat(toggleButton.dataset.rewardRep || 0);
    const repPenalty = parseFloat(toggleButton.dataset.penaltyRep || 0);

    if (repReward > 0 && rewardTrader) {
        summaryContent += `<p class="reward-summary">🤝 Rep: +${repReward} ${rewardTrader}</p>`;
    }
    if (repPenalty > 0 && penaltyTrader) {
        summaryContent += `<p class="reward-summary">🤝 Rep: -${repPenalty} ${penaltyTrader}</p>`;
    }
    
    collapsedRequirements.innerHTML = summaryContent || '<p>Click to view details...</p>';
}


// --- 7. TASK COMPLETION LOGIC ---
function handleTaskToggle(event) {
    const button = event.target;
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.dataset.taskId;

    // Read all currency and rep attributes (Important for the updateTaskStatus logic)
    const roublesReward = parseInt(button.dataset.rewardRoubles || 0);
    const roublesPenalty = parseInt(button.dataset.penaltyRoubles || 0);
    const dollarsReward = parseInt(button.dataset.rewardDollars || 0);
    const dollarsPenalty = parseInt(button.dataset.penaltyDollars || 0);
    const eurosReward = parseInt(button.dataset.rewardEuros || 0);
    const eurosPenalty = parseInt(button.dataset.penaltyEuros || 0);
    
    // Check if task is already complete
    const isCompletedBeforeToggle = taskCard.classList.contains('completed');
    
    // Toggle completion status
    const isCompleted = !isCompletedBeforeToggle;
    completedTasks[taskId] = isCompleted;

    // Handle objectives status based on task completion
    if (!completedObjectives[taskId]) {
        completedObjectives[taskId] = {};
    }

    if (!isCompleted) {
        // If uncompleting task, uncheck all objectives
        Object.keys(completedObjectives[taskId]).forEach(key => {
            completedObjectives[taskId][key] = false;
        });
    }

    if (isCompleted) {
        // If completing task, check all objectives
        // NOTE: In a real tracker, this might only check *required* objectives, but for simplicity, we check all.
        Object.keys(completedObjectives[taskId]).forEach(key => {
            completedObjectives[taskId][key] = true;
        });
    }

    // Apply the visual and summary update
    updateTaskStatus(taskCard);
    
    // Since objectives were changed, we must update the checkboxes visually
    taskCard.querySelectorAll('.objective-checklist input[type="checkbox"]').forEach(checkbox => {
        const objectiveId = checkbox.closest('.objective-item').dataset.objectiveId;
        checkbox.checked = completedObjectives[taskId] ? completedObjectives[taskId][objectiveId] : false;
    });

    saveProgress();
    
    event.stopPropagation(); 
}

// Attach listener to all toggle buttons on load
document.querySelectorAll('.task-toggle-btn').forEach(button => {
    button.addEventListener('click', handleTaskToggle);
});


// --- 8. EXPAND/COLLAPSE TASK LOGIC ---
expandableCards.forEach(card => {
    card.addEventListener('click', (event) => {
        // Don't toggle expansion if clicking on a button, checkbox, or related element
        if (event.target.classList.contains('task-toggle-btn') || event.target.closest('.task-toggle-btn') || event.target.type === 'checkbox' || event.target.closest('.objective-item') || event.target.closest('.collapsed-requirements')) {
            return;
        }

        const expandedView = card.querySelector('.expanded-view');
        
        if (expandedView) {
            const isHidden = window.getComputedStyle(expandedView).display === 'none';
            expandedView.style.display = isHidden ? 'grid' : 'none'; 
        }
    });
});

// Load progress when the page first loads and run initial filter/status update
loadProgress();
filterTasks();
