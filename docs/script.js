// --- 1. INITIALIZATION AND DATA KEYS ---
const COMPLETED_TASKS_KEY = 'eftZthCompletedTasksMinimal';
const COMPLETED_OBJECTIVES_KEY = 'eftZthCompletedObjectives'; 
const TRADER_LL_KEY = 'eftZthTraderLL'; 
const QUICK_SLOT_KEY = 'eftZthQuickSlotTasks'; 
const STAT_TRACKER_KEY = 'eftZthStatTracker'; 
const VIRTUAL_STASH_KEY = 'eftZthVirtualStash'; 
const HIDEOUT_KEY = 'eftZthHideoutPerks'; 
const HIDE_LOCKED_KEY = 'eftZthHideLocked'; 

let completedTasks = {}; 
let completedObjectives = {}; 
let traderLL = {}; 
let quickSlottedTasks = {}; 
let statTracker = {}; 
let virtualStash = []; 
let hideoutPerks = {}; 
let hideLockedTasks = false; 

// DOM Elements
let expandableCards = []; 
const traderFilter = document.getElementById('trader-filter');
const mapFilter = document.getElementById('map-filter'); 
const taskSearch = document.getElementById('task-search');
const llCheckboxes = document.querySelectorAll('#ll-tracker input[type="checkbox"]');
const tasksSection = document.getElementById('tasks'); 

// NEW DOM Elements
const tabButtons = document.querySelectorAll('#tab-navigation button');
const pages = document.querySelectorAll('.page-content');
const streakSurvivedBtn = document.getElementById('streak-survived');
const streakKiaBtn = document.getElementById('streak-kia');
const stashAddItemBtn = document.getElementById('add-stash-item');
const stashItemNameInput = document.getElementById('stash-item-name');
const stashItemCountInput = document.getElementById('stash-item-count');
const virtualStashList = document.getElementById('virtual-stash-list');

// Flea Tax Elements (UPDATED)
const calculateFleaTaxBtn = document.getElementById('calculate-flea-tax');
const inputAmountToTax = document.getElementById('input-amount-to-tax'); // Renamed input
const taxResults = document.getElementById('tax-results');

// Found Roubles Elements (NEW)
const inputFoundRoubles = document.getElementById('input-found-roubles');
const calculateFoundRoublesBtn = document.getElementById('calculate-found-roubles');
const foundRoublesResults = document.getElementById('found-roubles-results');

const hideLockedCheckbox = document.getElementById('hide-locked-tasks'); 

// --- 2. CORE LOGIC FUNCTIONS ---
function loadProgress() {
    completedTasks = JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEY) || '{}');
    completedObjectives = JSON.parse(localStorage.getItem(COMPLETED_OBJECTIVES_KEY) || '{}'); 
    hideLockedTasks = JSON.parse(localStorage.getItem(HIDE_LOCKED_KEY) || 'false'); 

    const defaultData = { 
        Prapor: { 1: false, 2: false, 3: false, 4: false }, 
        Skier: { 1: false, 2: false, 3: false, 4: false },
        Therapist: { 1: false, 2: false, 3: false, 4: false },
        Peacekeeper: { 1: false, 2: false, 3: false, 4: false },
        Mechanic: { 1: false, 2: false, 3: false, 4: false },    
        Ragman: { 1: false, 2: false, 3: false, 4: false },    
        Jaeger: { 1: false, 2: false, 3: false, 4: false }     
    };
    
    // Default stats object with tax variables (Sales Tax starts at 6%, Multiplier at 1.0)
    const defaultStats = {
        roubles: 0,
        dollars: 0,
        euros: 0,
        streak: 0,
        salesTaxRate: 6.00, 
        survivalStreakMultiplier: 1.0 
    };

    traderLL = JSON.parse(localStorage.getItem(TRADER_LL_KEY) || JSON.stringify(defaultData));
    quickSlottedTasks = JSON.parse(localStorage.getItem(QUICK_SLOT_KEY) || '{}'); 
    // Merge loaded statTracker with defaults to ensure new tax keys exist
    const loadedStats = JSON.parse(localStorage.getItem(STAT_TRACKER_KEY) || '{}');
    statTracker = { ...defaultStats, ...loadedStats };
    
    // Safety check to ensure the multiplier is a valid number, defaults to 1.0
    if (typeof statTracker.survivalStreakMultiplier !== 'number' || isNaN(statTracker.survivalStreakMultiplier) || statTracker.survivalStreakMultiplier < 1.0) {
        statTracker.survivalStreakMultiplier = 1.0;
    }

    virtualStash = JSON.parse(localStorage.getItem(VIRTUAL_STASH_KEY) || '[]'); 
    hideoutPerks = JSON.parse(localStorage.getItem(HIDEOUT_KEY) || '{}'); 

    // Sync LL checkboxes with loaded data
    llCheckboxes.forEach(checkbox => {
        const trader = checkbox.closest('.trader-ll-group').getAttribute('data-trader');
        const ll = checkbox.getAttribute('data-ll');
        if (traderLL[trader] && traderLL[trader][ll]) {
            checkbox.checked = true;
        }
    });
    
    // Sync Hide Locked Tasks checkbox
    if (hideLockedCheckbox) {
        hideLockedCheckbox.checked = hideLockedTasks;
    }

    if (typeof TASKS_DATA === 'undefined') {
          tasksSection.innerHTML = '<h2>🎯 Task Progression</h2><p style="color:red;">FATAL ERROR: TASKS_DATA is missing. Ensure `tasksData.js` is loaded before `script.js` in your index.html file.</p>';
          console.error("FATAL ERROR: TASKS_DATA is undefined. Ensure tasksData.js is loaded before script.js.");
          return;
    }
    
    generateTaskCards();
    expandableCards = document.querySelectorAll('.task-card.expandable'); 
    addEventListeners(); 

    updateStatsDisplay(); 
    updateAllTaskStatuses(); 
    filterTasks(); 
    sortTasks(); 
    
    // Render stash on load
    renderStash();
}

function saveProgress() {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    localStorage.setItem(COMPLETED_OBJECTIVES_KEY, JSON.stringify(completedObjectives)); 
    localStorage.setItem(TRADER_LL_KEY, JSON.stringify(traderLL)); 
    localStorage.setItem(QUICK_SLOT_KEY, JSON.stringify(quickSlottedTasks)); 
    localStorage.setItem(STAT_TRACKER_KEY, JSON.stringify(statTracker)); 
    localStorage.setItem(VIRTUAL_STASH_KEY, JSON.stringify(virtualStash)); 
    localStorage.setItem(HIDEOUT_KEY, JSON.stringify(hideoutPerks)); 
    localStorage.setItem(HIDE_LOCKED_KEY, JSON.stringify(hideLockedTasks)); 
    console.log('Task, objective, stats, and stash status saved.'); 
}

// ... (handleHideLockedToggle and generateTaskCards remain the same) ...

function handleHideLockedToggle(event) {
    hideLockedTasks = event.target.checked;
    saveProgress();
    filterTasks();
}

// The full generateTaskCards function is omitted for brevity but should be present in your file.
function generateTaskCards() {
    // NOTE: This function's full content is needed for the app to work, 
    // The previous implementation must be included here.
    tasksSection.innerHTML = '<h2>Task Progression</h2>'; 
    
    TASKS_DATA.forEach(task => {
        // (Full logic to create and append task cards)
        const card = document.createElement('div');
        card.classList.add('task-card', 'expandable');
        
        let rewardRoubles = 0;
        let rewardDollars = 0;
        let rewardEuros = 0;
        
        // ... (Logic to calculate rewardsHTML, initialEquipmentHTML, collapsedReqText) ...
        
        // Construct Inner HTML
        card.innerHTML = `
            <div class="collapsed-view">
                <div class="trader-icon-small" data-trader-id="${task.trader}"></div>
                <div class="collapsed-text-group">
                    <span class="trader-name">${task.trader}</span>
                    <p class="collapsed-requirements"></p>
                    <h3 class="task-title">${task.title}</h3>
                    <p class="task-objective">${task.objectiveSummary}</p>
                    <p class="reward-summary"></p> </div>
                <button class="quick-slot-btn" aria-label="Quick Slot Task">☆</button>
            </div>
            <div class="expanded-view hidden-detail" style="display:none;">
                <div class="trader-image-box" data-trader-id="${task.trader}"></div>
                <div>
                    <div class="dialogue-box">
                        <h4>Dialogue (${task.trader})</h4>
                        <p class="dialogue-text"></p>
                    </div>
                    
                    ${/* initialEquipmentHTML */''} <h4 class="requirements-heading">Requirements:</h4>
                    <div class="task-requirements-list"></div>

                    <h4 class="objectives-heading">Objectives:</h4>
                    <div class="objective-checklist"></div>
                    
                    <h4 class="rewards-heading">Rewards:</h4>
                    <ul class="rewards-list">
                        ${/* rewardsHTML */''}
                    </ul>
                    
                    <div class="task-buttons-group">
                        <button class="task-toggle-btn complete-btn" 
                                data-reward-roubles="${rewardRoubles}" 
                                data-reward-dollars="${rewardDollars}"
                                data-reward-euros="${rewardEuros}">
                            Mark as Complete
                        </button>
                        <button class="guide-toggle-btn">Guide</button>
                    </div>
                    
                    <div class="walkthrough-box hidden-detail" style="display: none;">
                        <h4>Walkthrough / Hint:</h4>
                        <p class="walkthrough-text">${task.walkthrough || 'No specific guide available for this task.'}</p>
                    </div>
                    
                </div>
            </div>
        `;
        
        tasksSection.appendChild(card);
    });
}


// ... (handleGuideToggle, handleLLToggle, checkRequirementsAndGenerateList, generateChecklist, handleObjectiveToggle, filterTasks, updateTaskStatus, updateAllTaskStatuses, handleTaskToggle, handleQuickSlotToggle, sortTasks remain the same) ...


function addEventListeners() {
    // LL Tracker 
    llCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleLLToggle);
    });
    
    // Filters and Search 
    traderFilter.addEventListener('change', filterTasks);
    mapFilter.addEventListener('change', filterTasks); 
    taskSearch.addEventListener('keyup', filterTasks);
    // Hide Locked Tasks listener
    if (hideLockedCheckbox) hideLockedCheckbox.addEventListener('change', handleHideLockedToggle);
    
    // Tab Navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabToggle);
    });
    
    // Stats Tracker Buttons
    if (streakSurvivedBtn) streakSurvivedBtn.addEventListener('click', () => handleStreakButton('survived'));
    if (streakKiaBtn) streakKiaBtn.addEventListener('click', () => handleStreakButton('kia'));

    // Stash Buttons
    if (stashAddItemBtn) stashAddItemBtn.addEventListener('click', handleAddItem);

    // Tax Calculator Buttons (UPDATED)
    if (calculateFleaTaxBtn) calculateFleaTaxBtn.addEventListener('click', calculateFleaTax);
    if (calculateFoundRoublesBtn) calculateFoundRoublesBtn.addEventListener('click', calculateFoundRoubles);

    // Buttons and Task Clicks (on dynamically created elements)
    document.querySelectorAll('.task-toggle-btn').forEach(button => {
        button.addEventListener('click', handleTaskToggle);
    });
    document.querySelectorAll('.quick-slot-btn').forEach(button => {
        button.addEventListener('click', handleQuickSlotToggle);
    });
    document.querySelectorAll('.guide-toggle-btn').forEach(button => { 
        button.addEventListener('click', handleGuideToggle);
    });
    
    // Expand/Collapse Listener (Re-attaching to new cards)
    document.querySelectorAll('.task-card.expandable').forEach(card => {
        card.addEventListener('click', (event) => {
            // Check if the click target is any interactive element
            if (event.target.classList.contains('task-toggle-btn') || 
                event.target.closest('.task-toggle-btn') || 
                event.target.closest('.quick-slot-btn') || 
                event.target.closest('.guide-toggle-btn') || 
                event.target.type === 'checkbox' || 
                event.target.closest('.objective-item') || 
                event.target.closest('.collapsed-requirements')) {
                return;
            }

            const expandedView = card.querySelector('.expanded-view');
            
            if (expandedView) {
                const isHidden = window.getComputedStyle(expandedView).display === 'none';
                // Only allow expansion if the task is not hidden by the 'hide locked' filter
                if (card.style.display !== 'none') {
                    expandedView.style.display = isHidden ? 'grid' : 'none'; 
                }
            }
        });
    });
}


// --- STATS TRACKER LOGIC (Updated Display and Streak Logic) ---

function updateStatsDisplay() {
    // Stat displays
    document.getElementById('stat-roubles').textContent = statTracker.roubles.toLocaleString();
    document.getElementById('stat-dollars').textContent = statTracker.dollars.toLocaleString();
    document.getElementById('stat-euros').textContent = statTracker.euros.toLocaleString();
    
    // UPDATED: Show both streak count and multiplier
    document.getElementById('streak-count').textContent = statTracker.streak;
    const multiplierElement = document.getElementById('current-survival-multiplier');
    if (multiplierElement) {
        multiplierElement.textContent = statTracker.survivalStreakMultiplier.toFixed(1);
    }
    
    // Update Sales Tax Rate Display
    const salesTaxRateElement = document.getElementById('current-sales-tax-rate');
    if (salesTaxRateElement) {
        salesTaxRateElement.textContent = `${statTracker.salesTaxRate.toFixed(2)}%`;
    }
}

function handleStreakButton(result) {
    // Rounding function for one decimal place (for multiplier) and two (for tax rate)
    const roundToTwo = (num) => Math.round(num * 100) / 100;
    const roundToOne = (num) => Math.round(num * 10) / 10;
    
    // Use current multiplier, defaulting to 1.0
    let currentMultiplier = statTracker.survivalStreakMultiplier || 1.0;

    if (result === 'survived') {
        statTracker.streak += 1;
        
        // 1. Decrease sales tax by 0.5 * multiplier (min 2)
        const taxDecrease = 0.5 * currentMultiplier;
        statTracker.salesTaxRate = Math.max(2, statTracker.salesTaxRate - taxDecrease);
        
        // 2. Increase multiplier by 0.1 (max 2.0).
        statTracker.survivalStreakMultiplier = Math.min(2.0, currentMultiplier + 0.1); 

    } else if (result === 'kia') {
        
        // 1. Increase sales tax by 1 * multiplier (max 10)
        const taxIncrease = 1 * currentMultiplier;
        statTracker.salesTaxRate = Math.min(10, statTracker.salesTaxRate + taxIncrease);
        
        // 2. Reset multiplier and streak
        statTracker.survivalStreakMultiplier = 1.0; // Reset to 1.0, as requested
        statTracker.streak = 0;
    }
    
    // Ensure both tax rate and multiplier are rounded for display/storage
    statTracker.salesTaxRate = roundToTwo(statTracker.salesTaxRate);
    statTracker.survivalStreakMultiplier = roundToOne(statTracker.survivalStreakMultiplier); // Round to 1 decimal place

    updateStatsDisplay();
    saveProgress();
}


// --- VIRTUAL STASH LOGIC (Simplified, assuming helper functions exist) ---

function handleAddItem() {
    const name = stashItemNameInput.value.trim();
    const count = parseInt(stashItemCountInput.value);

    if (name && count > 0) {
        virtualStash.push({ name, count, timestamp: Date.now() });
        stashItemNameInput.value = '';
        stashItemCountInput.value = '1';
        renderStash();
        saveProgress();
    }
}

function renderStash() {
    virtualStashList.innerHTML = '';
    if (virtualStash.length === 0) {
        virtualStashList.innerHTML = '<p>No items in stash.</p>';
        return;
    }
    virtualStash.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('stash-item');
        itemDiv.innerHTML = `
            <span>${item.count}x ${item.name}</span>
            <button class="remove-stash-item" data-index="${index}">-</button>
        `;
        virtualStashList.appendChild(itemDiv);
    });

    document.querySelectorAll('.remove-stash-item').forEach(button => {
        button.addEventListener('click', handleRemoveItem);
    });
}

function handleRemoveItem(event) {
    const index = parseInt(event.target.getAttribute('data-index'));
    virtualStash.splice(index, 1);
    renderStash();
    saveProgress();
}


// --- TAX CALCULATOR LOGIC (Updated Flea Tax Calculation) ---

function calculateFleaTax() {
    // P is the Amount to Tax (Roubles)
    const P = parseFloat(inputAmountToTax.value); 
    
    if (isNaN(P) || P <= 0) {
        taxResults.innerHTML = '<p style="color:red;">Please enter a valid positive Amount to Tax (P).</p>';
        return;
    }
    
    // 1. Calculate SALES TAX
    const salesTaxRate = statTracker.salesTaxRate / 100;
    // Sales Tax Amount = Amount to Tax * Sales Tax Rate
    const salesTaxAmount = P * salesTaxRate;
    
    // Pre-Income Taxes = Amount to Tax - Sales Tax Amount
    const preIncomeTaxes = P - salesTaxAmount;
    
    // 2. Determine INCOME TAX TIER (Tiers apply to Pre-Income Taxes)
    let incomeTaxRate = 0;
    
    if (preIncomeTaxes <= 100000) {
        incomeTaxRate = 0.65; // 65%
    } else if (preIncomeTaxes <= 200000) {
        incomeTaxRate = 0.75; // 75%
    } else if (preIncomeTaxes <= 400000) {
        incomeTaxRate = 0.80; // 80%
    } else if (preIncomeTaxes <= 800000) {
        incomeTaxRate = 0.85; // 85%
    } else {
        incomeTaxRate = 0.90; // 90%
    }
    
    // 3. Calculate INCOME TAX and FINAL PROFIT
    // Income Tax Amount = Pre-Income Taxes * Income Tax Rate
    const incomeTaxAmount = preIncomeTaxes * incomeTaxRate;
    // Net Profit = Pre-Income Taxes - Income Tax Amount
    const netProfit = preIncomeTaxes - incomeTaxAmount;
    
    taxResults.innerHTML = `
        <p>Amount to Tax (P): <span class="currency-rouble">${P.toLocaleString()}₽</span></p>
        <p>Sales Tax (${(salesTaxRate * 100).toFixed(2)}%): <span class="currency-rouble">- ${Math.round(salesTaxAmount).toLocaleString()}₽</span></p>
        <p>Income Before Tax (Pre-Income Taxes): <span class="currency-rouble">${Math.round(preIncomeTaxes).toLocaleString()}₽</span></p>
        <hr style="border-color:#444;">
        <p>Income Tax (${(incomeTaxRate * 100).toFixed(0)}%): <span class="currency-rouble">- ${Math.round(incomeTaxAmount).toLocaleString()}₽</span></p>
        <p class="result-net">Net Profit (Take Home): <span class="currency-rouble">${Math.round(netProfit).toLocaleString()}₽</span></p>
    `;
}

// --- NEW: FOUND ROUBLES TAX LOGIC ---

function calculateFoundRoubles() {
    const R = parseFloat(inputFoundRoubles.value); // R is the total roubles found
    
    if (isNaN(R) || R <= 0) {
        foundRoublesResults.innerHTML = '<p style="color:red;">Please enter a valid positive amount of Found Roubles.</p>';
        return;
    }
    
    // Found roubles are ONLY divided by 3 (i.e., you keep 1/3rd)
    const keepAmount = R / 3;
    const taxAmount = R - keepAmount;
    
    foundRoublesResults.innerHTML = `
        <p>Total Roubles Found: <span class="currency-rouble">${R.toLocaleString()}₽</span></p>
        <p>Tax Applied (2/3rd): <span class="currency-rouble">- ${Math.round(taxAmount).toLocaleString()}₽</span></p>
        <p class="result-net">Net Profit (Keep Amount): <span class="currency-rouble">${Math.round(keepAmount).toLocaleString()}₽</span></p>
    `;
}

// Load progress when the page first loads
loadProgress();
