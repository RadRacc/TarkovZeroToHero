// --- 1. INITIALIZATION AND DATA KEYS ---
const COMPLETED_TASKS_KEY = 'eftZthCompletedTasksMinimal';
const COMPLETED_OBJECTIVES_KEY = 'eftZthCompletedObjectives'; 
const TRADER_LL_KEY = 'eftZthTraderLL'; 
const QUICK_SLOT_KEY = 'eftZthQuickSlotTasks'; 
const STAT_TRACKER_KEY = 'eftZthStatTracker'; // For Stats & Tax
const VIRTUAL_STASH_KEY = 'eftZthVirtualStash'; // For Stash
const HIDE_LOCKED_KEY = 'eftZthHideLocked'; // For "Hide Locked Tasks"

let completedTasks = {}; 
let completedObjectives = {}; 
let traderLL = {}; 
let quickSlottedTasks = {}; 
let statTracker = {}; // Will hold all stats, including tax info
let virtualStash = []; 
let hideLockedTasks = false; 

// DOM Elements
let expandableCards = []; 
const traderFilter = document.getElementById('trader-filter');
const mapFilter = document.getElementById('map-filter'); 
const taskSearch = document.getElementById('task-search');
// FIX: Corrected selector to avoid grabbing the hide-locked checkbox
const llCheckboxes = document.querySelectorAll('.trader-ll-group input[type="checkbox"]');
const tasksSection = document.getElementById('tasks'); 
const hideLockedCheckbox = document.getElementById('hide-locked-tasks');

// Tab Navigation Elements
const tabButtons = document.querySelectorAll('#tab-navigation button');
const pages = document.querySelectorAll('.page-content');

// Stats & Tax Elements
const streakSurvivedBtn = document.getElementById('streak-survived');
const streakKiaBtn = document.getElementById('streak-kia');
const calculateFleaTaxBtn = document.getElementById('calculate-flea-tax');
const inputAmountToTax = document.getElementById('input-amount-to-tax'); 
const taxResults = document.getElementById('tax-results');
const inputFoundRoubles = document.getElementById('input-found-roubles');
const calculateFoundRoublesBtn = document.getElementById('calculate-found-roubles');
const foundRoublesResults = document.getElementById('found-roubles-results');

// Stash Elements
const stashAddItemBtn = document.getElementById('add-stash-item');
const stashItemNameInput = document.getElementById('stash-item-name');
const stashItemCountInput = document.getElementById('stash-item-count');
const virtualStashList = document.getElementById('virtual-stash-list');


// --- 2. CORE LOGIC FUNCTIONS ---
function loadProgress() {
    completedTasks = JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEY) || '{}');
    completedObjectives = JSON.parse(localStorage.getItem(COMPLETED_OBJECTIVES_KEY) || '{}'); 
    hideLockedTasks = JSON.parse(localStorage.getItem(HIDE_LOCKED_KEY) || false); 
    
    const defaultLLData = { 
        Prapor: { 1: false, 2: false, 3: false, 4: false }, 
        Skier: { 1: false, 2: false, 3: false, 4: false },
        Therapist: { 1: false, 2: false, 3: false, 4: false },
        Peacekeeper: { 1: false, 2: false, 3: false, 4: false },
        Mechanic: { 1: false, 2: false, 3: false, 4: false },    
        Ragman: { 1: false, 2: false, 3: false, 4: false },    
        Jaeger: { 1: false, 2: false, 3: false, 4: false }      
    };

    // NEW: Default stats object with new tax system
    const defaultStats = {
        roubles: 0,
        dollars: 0,
        euros: 0,
        streak: 0,
        salesTax: 6.0, // This is the DIVISOR (2-10)
        survivalStreakMultiplier: 1.0 // This is the multiplier (1.0-2.0)
    };

    traderLL = JSON.parse(localStorage.getItem(TRADER_LL_KEY) || JSON.stringify(defaultLLData));
    quickSlottedTasks = JSON.parse(localStorage.getItem(QUICK_SLOT_KEY) || '{}'); 
    virtualStash = JSON.parse(localStorage.getItem(VIRTUAL_STASH_KEY) || '[]'); 
    
    // Merge loaded stats with defaults to ensure new keys exist
    const loadedStats = JSON.parse(localStorage.getItem(STAT_TRACKER_KEY) || '{}');
    statTracker = { ...defaultStats, ...loadedStats };
    // Ensure multiplier is at least 1
    if (statTracker.survivalStreakMultiplier < 1.0) {
        statTracker.survivalStreakMultiplier = 1.0;
    }

    // Sync LL checkboxes with loaded data
    llCheckboxes.forEach(checkbox => {
        const trader = checkbox.closest('.trader-ll-group').getAttribute('data-trader');
        const ll = checkbox.getAttribute('data-ll');
        if (traderLL[trader] && traderLL[trader][ll]) {
            checkbox.checked = true;
        }
    });
    
    // Sync "Hide Locked" checkbox
    if (hideLockedCheckbox) {
        hideLockedCheckbox.checked = hideLockedTasks;
    }

    // Check if TASKS_DATA is available
    if (typeof TASKS_DATA === 'undefined') {
         tasksSection.innerHTML = '<h2>🎯 Task Progression</h2><p style="color:red;">FATAL ERROR: TASKS_DATA is missing. Ensure `tasksData.js` is loaded before `script.js` in your index.html file.</p>';
         console.error("FATAL ERROR: TASKS_DATA is undefined. Ensure tasksData.js is loaded before script.js.");
         return;
    }
    
    // START OF DYNAMIC GENERATION FLOW
    generateTaskCards();
    
    // Re-initialize expandableCards now that they exist in the DOM
    expandableCards = document.querySelectorAll('.task-card.expandable'); 
    
    // Add event listeners to dynamically created elements
    addEventListeners(); 

    updateStatsDisplay(); // Update stats on load
    updateAllTaskStatuses(); 
    filterTasks(); 
    sortTasks(); 
    renderStash(); // Render stash on load
}

function saveProgress() {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    localStorage.setItem(COMPLETED_OBJECTIVES_KEY, JSON.stringify(completedObjectives)); 
    localStorage.setItem(TRADER_LL_KEY, JSON.stringify(traderLL)); 
    localStorage.setItem(QUICK_SLOT_KEY, JSON.stringify(quickSlottedTasks)); 
    localStorage.setItem(STAT_TRACKER_KEY, JSON.stringify(statTracker));
    localStorage.setItem(VIRTUAL_STASH_KEY, JSON.stringify(virtualStash));
    localStorage.setItem(HIDE_LOCKED_KEY, JSON.stringify(hideLockedTasks));
    console.log('Task and objective status saved.'); 
}

// --- HIDE LOCKED TASK HANDLER ---
function handleHideLockedToggle(event) {
    hideLockedTasks = event.target.checked;
    saveProgress();
    filterTasks(); // Re-run filters immediately
}

// --- DYNAMIC TASK CARD GENERATION ---
function generateTaskCards() {
    tasksSection.innerHTML = ''; // Clear only cards
    
    TASKS_DATA.forEach(task => {
        const card = document.createElement('div');
        card.classList.add('task-card', 'expandable');
        
        let rewardRoubles = 0;
        let rewardDollars = 0;
        let rewardEuros = 0;
        
        // --- 1. Generate Rewards List HTML ---
        const rewardsHTML = task.rewards.map(reward => {
            let itemText = '';
            let dataAttr = '';
            let iconPath = '';
            
            if (reward.type === 'roubles') {
                itemText = `${reward.amount.toLocaleString()} Roubles (₽)`;
                dataAttr = `data-item="roubles"`;
                rewardRoubles = reward.amount;
                iconPath = 'images/icon-roubles.png';
            } else if (reward.type === 'dollars') {
                itemText = `${reward.amount.toLocaleString()} Dollars ($)`;
                dataAttr = `data-item="dollars"`;
                rewardDollars = reward.amount;
                iconPath = 'images/icon-dollars.png';
            } else if (reward.type === 'euros') {
                itemText = `${reward.amount.toLocaleString()} Euros (€)`;
                dataAttr = `data-item="euros"`;
                rewardEuros = reward.amount;
                iconPath = 'images/icon-euros.png';
            } else if (reward.type === 'item') {
                itemText = reward.name;
                dataAttr = `data-item="item"`;
                
                if (reward.icon) {
                    iconPath = `images/${reward.icon}`; 
                } else {
                    iconPath = 'images/icon-item.png'; 
                }
            }
            
            const iconHTML = iconPath ? `<img src="${iconPath}" alt="${reward.type} icon" class="reward-icon">` : '';
            return `<li ${dataAttr}>${iconHTML}<span class="reward-text">${itemText}</span></li>`;

        }).join('');
        
        // --- 2. Generate Initial Equipment List HTML ---
        let initialEquipmentHTML = '';
        if (task.initial_equipment && task.initial_equipment.length > 0) {
             const itemsHTML = task.initial_equipment.map(item => {
                const iconPath = item.icon ? `images/${item.icon}` : 'images/icon-item.png';
                const iconHTML = `<img src="${iconPath}" alt="${item.name} icon" class="reward-icon">`;
                return `<li>${iconHTML}<span class="reward-text">${item.name}</span></li>`;
            }).join('');
            
            initialEquipmentHTML = `
                <h4 class="equipment-heading">Initial Equipment Given:</h4>
                <ul class="initial-equipment-list rewards-list">
                    ${itemsHTML}
                </ul>
            `;
        }

        // --- 3. Determine Collapsed Requirement Text (NEW FORMAT) ---
        let llReqText = 'N/A';
        let taskReqText = 'None';
        let itemReqText = 'None';
        const mapText = task.map || 'N/A';
        
        const requirements = task.requirements || [];
        let itemReqCount = 0;

        requirements.forEach(req => {
            const reqText = req.trim();
            if (reqText === "N/A" || reqText === "") return;

            if (reqText.startsWith('LL')) {
                llReqText = reqText.replace('LL', '');
            } else if (reqText.startsWith('I:')) {
                itemReqCount++;
            } else {
                // Find task title from TASKS_DATA
                const requiredTask = TASKS_DATA.find(t => t.id === reqText); 
                if (requiredTask) {
                    taskReqText = requiredTask.title;
                }
            }
        });
        
        itemReqText = itemReqCount > 0 ? `${itemReqCount} item(s)` : 'None';
        const collapsedReqText = `LL: ${llReqText} | Task Required: ${taskReqText} | Item Requirement: ${itemReqText} | Map: ${mapText}`;

        // Set Data Attributes
        card.setAttribute('data-task-id', task.id);
        card.setAttribute('data-trader', task.trader);
        card.setAttribute('data-map', task.map); 
        card.setAttribute('data-dialogue-initial', task.dialogueInitial);
        card.setAttribute('data-dialogue-complete', task.dialogueComplete);
        card.setAttribute('data-objective-list', task.objectives.join(';'));
        card.setAttribute('data-task-requirements', task.requirements.join(';'));
        card.setAttribute('data-task-walkthrough', task.walkthrough || ''); 
        
        // Construct Inner HTML
        card.innerHTML = `
            <div class="collapsed-view">
                <div class="trader-icon-small" data-trader-id="${task.trader}"></div>
                <div class="collapsed-text-group">
                    <span class="trader-name">${task.trader}</span>
                    <p class="collapsed-requirements">${collapsedReqText}</p>
                    <h3 class="task-title">${task.title}</h3>
                    <p class="task-objective">${task.objectiveSummary}</p>
                    <p class="reward-summary">
                        ${rewardRoubles > 0 ? `<span class="currency-rouble">${rewardRoubles.toLocaleString()}₽</span>` : ''}
                        ${rewardDollars > 0 ? `<span class="currency-dollar"> ${rewardDollars.toLocaleString()}$</span>` : ''}
                        ${rewardEuros > 0 ? `<span class="currency-euro"> ${rewardEuros.toLocaleString()}€</span>` : ''}
                    </p>
                </div>
                <button class="quick-slot-btn" aria-label="Quick Slot Task">☆</button>
            </div>
            <div class="expanded-view" style="display: none;">
                <div class="trader-image-box" data-trader-id="${task.trader}"></div>
                <div>
                    <div class="dialogue-box">
                        <h4>Dialogue (${task.trader})</h4>
                        <p class="dialogue-text">${task.dialogueInitial}</p>
                    </div>
                    
                    ${initialEquipmentHTML}
                    
                    <h4 class="requirements-heading">Requirements:</h4>
                    <div class="task-requirements-list"></div>

                    <h4 class="objectives-heading">Objectives:</h4>
                    <div class="objective-checklist"></div>
                    
                    <h4 class="rewards-heading">Rewards:</h4>
                    <ul class="rewards-list">
                        ${rewardsHTML}
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
                    
                    <div class="walkthrough-box" style="display: none;">
                        <h4>Walkthrough / Hint:</h4>
                        <p class="walkthrough-text">${task.walkthrough || 'No specific guide available for this task.'}</p>
                    </div>
                </div>
            </div>
        `;
        
        tasksSection.appendChild(card);
    });
}

// --- TAB NAVIGATION ---
function handleTabToggle(event) {
    const targetTabId = event.target.getAttribute('data-tab');

    // Update button active state
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === targetTabId);
    });

    // Show/Hide pages
    pages.forEach(page => {
        // The 'tasks' section and 'filter-controls' are linked
        if (page.id === 'tasks' || page.id === 'filter-controls') {
            const isActive = targetTabId === 'tasks';
            page.classList.toggle('active-page', isActive);
            // 'tasks' is block, 'filter-controls' is flex
            page.style.display = isActive ? (page.id === 'tasks' ? 'block' : 'flex') : 'none';
        } else {
            // Handle other pages
            const isActive = page.id === targetTabId;
            page.classList.toggle('active-page', isActive);
            page.style.display = isActive ? 'block' : 'none';
        }
    });
}

// --- FIX: GUIDE BUTTON HANDLER (Added back) ---
function handleGuideToggle(event) {
    const button = event.target;
    const taskCard = button.closest('.task-card');
    const walkthroughBox = taskCard.querySelector('.walkthrough-box');
    
    // This logic also supports HTML (like <img> tags) in the walkthrough
    const walkthroughText = taskCard.getAttribute('data-task-walkthrough') || 'No specific guide available for this task.'; 

    if (walkthroughBox) {
        // Inject the HTML content
        walkthroughBox.querySelector('.walkthrough-text').innerHTML = walkthroughText; 
        
        // Toggle visibility
        const isHidden = window.getComputedStyle(walkthroughBox).display === 'none';
        walkthroughBox.style.display = isHidden ? 'block' : 'none'; 
    }
    event.stopPropagation();
}


// --- ADD ALL EVENT LISTENERS ---
function addEventListeners() {
    // LL Tracker
    llCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleLLToggle);
    });
    
    // Filters and Search
    traderFilter.addEventListener('change', filterTasks);
    mapFilter.addEventListener('change', filterTasks); 
    taskSearch.addEventListener('keyup', filterTasks);
    if (hideLockedCheckbox) {
        hideLockedCheckbox.addEventListener('change', handleHideLockedToggle);
    }
    
    // Tab Navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabToggle);
    });
    
    // Stats Tracker Buttons
    if (streakSurvivedBtn) streakSurvivedBtn.addEventListener('click', () => handleStreakButton('survived'));
    if (streakKiaBtn) streakKiaBtn.addEventListener('click', () => handleStreakButton('kia'));

    // Stash Buttons
    if (stashAddItemBtn) stashAddItemBtn.addEventListener('click', handleAddItem);

    // Tax Calculator Buttons
    if (calculateFleaTaxBtn) calculateFleaTaxBtn.addEventListener('click', calculateFleaTax);
    if (calculateFoundRoublesBtn) calculateFoundRoublesBtn.addEventListener('click', calculateFoundRoubles);

    // Dynamic Task Card Buttons (must be re-run after generateTaskCards)
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
    document.querySelectorAll('.task-card .collapsed-view').forEach(header => {
        header.addEventListener('click', (event) => {
            // Stop if clicking an interactive element inside the header
            if (event.target.closest('button, input, a, label')) {
                return;
            }

            const card = header.closest('.task-card');
            if (card.classList.contains('task-locked')) return; // Don't expand locked tasks

            const expandedView = card.querySelector('.expanded-view');
            expandedView.style.display = expandedView.style.display === 'none' ? 'grid' : 'none';
        });
    });
}

// --- 3. LOYALTY LEVEL TRACKER HANDLER ---
function handleLLToggle(event) {
    const checkbox = event.target;
    const trader = checkbox.closest('.trader-ll-group').getAttribute('data-trader');
    const ll = checkbox.getAttribute('data-ll');
    const isChecked = checkbox.checked;
    
    traderLL[trader][ll] = isChecked;

    const allLLCheckboxes = checkbox.closest('.ll-checkbox-group').querySelectorAll('input[type="checkbox"]');
    
    allLLCheckboxes.forEach(cb => {
        const cbLL = parseInt(cb.getAttribute('data-ll'));

        if (isChecked && cbLL < parseInt(ll)) {
            cb.checked = true;
            traderLL[trader][cbLL] = true;
        } else if (!isChecked && cbLL > parseInt(ll)) {
            cb.checked = false;
            traderLL[trader][cbLL] = false;
        }
    });

    saveProgress();
    updateAllTaskStatuses(); 
}

// --- 4. REQUIREMENTS CHECK AND GENERATION (From script(1).js) ---
function checkRequirementsAndGenerateList(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const taskData = TASKS_DATA.find(t => t.id === taskId);
    const requirementsListElement = taskCard.querySelector('.task-requirements-list');
    requirementsListElement.innerHTML = ''; // Clear old list
    
    if (!taskData || !taskData.requirements || taskData.requirements[0] === "N/A") {
        requirementsListElement.innerHTML = '<div class="requirement-item met">No prerequisites.</div>';
        return true; // Unlocked
    }

    let allUnlockRequirementsMet = true; 
    const traderName = taskData.trader;

    taskData.requirements.forEach(req => {
        const reqText = req.trim();
        let isMet = true;
        let displayReqText = reqText;
        let reqClass = 'met';
        
        if (reqText.startsWith('I:')) {
            // Item Requirement (e.g., "I:Toolset:2")
            const parts = reqText.split(':');
            displayReqText = `Hand over: ${parts[2]}x ${parts[1]}`;
            // This is an objective, not a lock. We assume it's "met" for locking purposes.
            isMet = true; 
            reqClass = 'item-handover';
            
        } else if (reqText.startsWith('LL')) {
            // Loyalty Level Requirement
            const requiredLL = reqText.replace('LL', '');
            isMet = traderLL[traderName] && traderLL[traderName][requiredLL] === true;
            displayReqText = `${traderName} LL${requiredLL}`;
            if (!isMet) allUnlockRequirementsMet = false;

        } else {
            // Task Dependency
            const requiredTask = TASKS_DATA.find(t => t.id === reqText); 
            if (requiredTask) {
                isMet = completedTasks[requiredTask.id] === true;
                displayReqText = `Complete: ${requiredTask.title}`;
                if (!isMet) allUnlockRequirementsMet = false;
            } else {
                // Unknown requirement, treat as locked
                isMet = false;
                allUnlockRequirementsMet = false;
            }
        }

        const requirementItem = document.createElement('div');
        requirementItem.classList.add('requirement-item', isMet ? 'met' : 'unmet');
        if (reqClass === 'item-handover') {
            requirementItem.classList.add('item-handover');
        }
        requirementItem.textContent = displayReqText;
        requirementsListElement.appendChild(requirementItem);
    });
    
    return allUnlockRequirementsMet;
}


// --- 5. CHECKLIST GENERATION AND MANAGEMENT (From script(1).js) ---
function generateChecklist(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const objectivesList = TASKS_DATA.find(t => t.id === taskId).objectives;
    const checklistContainer = taskCard.querySelector('.objective-checklist');
    
    if (!checklistContainer) return; 
    checklistContainer.innerHTML = ''; 

    if (!objectivesList || objectivesList.length === 0) return;

    // Ensure objectives data exists for this task
    if (!completedObjectives[taskId] || completedObjectives[taskId].length !== objectivesList.length) {
        completedObjectives[taskId] = Array(objectivesList.length).fill(false);
    }

    objectivesList.forEach((objectiveText, index) => {
        const uniqueId = `${taskId}-${index}`;
        const isCompleted = completedObjectives[taskId][index] || false;

        const objectiveItem = document.createElement('div');
        objectiveItem.classList.add('objective-item');

        objectiveItem.innerHTML = `
            <input type="checkbox" id="${uniqueId}" data-task-id="${taskId}" data-index="${index}" ${isCompleted ? 'checked' : ''}>
            <label for="${uniqueId}">${objectiveText}</label>
        `;
        
        checklistContainer.appendChild(objectiveItem);
    });
    
    checklistContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleObjectiveToggle);
    });
}

function handleObjectiveToggle(event) {
    const checkbox = event.target;
    const taskId = checkbox.getAttribute('data-task-id');
    const index = parseInt(checkbox.getAttribute('data-index'));
    
    completedObjectives[taskId][index] = checkbox.checked;
    
    const taskCard = checkbox.closest('.task-card');
    const allCheckboxes = taskCard.querySelectorAll('.objective-checklist input[type="checkbox"]');
    let allCompleted = true;
    allCheckboxes.forEach(cb => {
        if (!cb.checked) allCompleted = false;
    });

    // If all objectives are checked, mark task as complete.
    // If an objective is unchecked, mark task as incomplete.
    if (allCompleted && !completedTasks[taskId]) {
        // Find the "Mark as Complete" button and click it to trigger reward logic
        const completeButton = taskCard.querySelector('.task-toggle-btn.complete-btn');
        if (completeButton) {
            handleTaskToggle({ target: completeButton, stopPropagation: () => {} });
        }
    } else if (!allCompleted && completedTasks[taskId]) {
        // Find the "Mark as Incomplete" button and click it to trigger reward removal
        const incompleteButton = taskCard.querySelector('.task-toggle-btn.uncomplete-btn');
        if (incompleteButton) {
            handleTaskToggle({ target: incompleteButton, stopPropagation: () => {} });
        }
    }

    saveProgress();
    // No need to call updateAllTaskStatuses here, handleTaskToggle already does it.
}


// --- 6. FILTERING AND SEARCHING LOGIC ---
function filterTasks() {
    const selectedTrader = traderFilter.value;
    const selectedMap = mapFilter.value; 
    const searchTerm = taskSearch.value.toLowerCase().trim();

    const currentCards = document.querySelectorAll('.task-card.expandable'); 

    currentCards.forEach(card => {
        const isLocked = card.classList.contains('task-locked');

        // 1. HIDE LOCKED TASKS LOGIC
        if (hideLockedTasks && isLocked) {
            card.style.display = 'none';
            return; // Skip other checks if hidden by the locked filter
        }
        
        // 2. Apply Filters (Trader/Map/Search)
        const trader = card.getAttribute('data-trader');
        const map = card.getAttribute('data-map'); 
        
        const titleElement = card.querySelector('.task-title');
        const objectiveElement = card.querySelector('.task-objective');

        const title = titleElement ? titleElement.textContent.toLowerCase() : '';
        const objective = objectiveElement ? objectiveElement.textContent.toLowerCase() : '';

        let matchesTrader = (selectedTrader === 'all' || trader === selectedTrader);
        let matchesMap = (selectedMap === 'all' || map === selectedMap || map === 'Any'); 
        let matchesSearch = true;

        if (searchTerm.length > 0) {
            matchesSearch = title.includes(searchTerm) || objective.includes(searchTerm);
        }

        if (matchesTrader && matchesMap && matchesSearch) { 
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// --- 7. TASK STATUS MANAGEMENT (From script(1).js) ---
function updateTaskStatus(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const isQuickSlotted = quickSlottedTasks[taskId] === true; 
    
    const toggleButton = taskCard.querySelector('.task-toggle-btn');
    const dialogueTextElement = taskCard.querySelector('.dialogue-text'); 
    const quickSlotButton = taskCard.querySelector('.quick-slot-btn'); 
    
    if (!toggleButton || !dialogueTextElement || !quickSlotButton) return; 

    // 1. Check Requirements
    const isUnlocked = checkRequirementsAndGenerateList(taskCard);
    
    // 2. Manage Visual Status and CRITICAL RESET LOGIC
    if (!isUnlocked) {
        taskCard.classList.add('task-locked'); 
        toggleButton.style.display = 'none'; 
        
        // --- LOGIC: RESET PROGRESS IF LOCKED ---
        if (completedTasks[taskId] === true) {
            completedTasks[taskId] = false; 
        }
        if (completedObjectives[taskId]) {
            Object.keys(completedObjectives[taskId]).forEach(key => {
                completedObjectives[taskId][key] = false;
            });
        }
        saveProgress();
        // ------------------------------------------

    } else {
        taskCard.classList.remove('task-locked');
        toggleButton.style.display = 'inline-block'; 
    }

    // 3. Manage Complete/Incomplete State (only if unlocked)
    if (completedTasks[taskId] && isUnlocked) {
        taskCard.classList.add('task-completed');
        toggleButton.textContent = 'Mark as Incomplete';
        toggleButton.classList.remove('complete-btn'); 
        toggleButton.classList.add('uncomplete-btn');
        dialogueTextElement.textContent = taskCard.getAttribute('data-dialogue-complete'); 
    } else {
        taskCard.classList.remove('task-completed');
        toggleButton.textContent = 'Mark as Complete';
        toggleButton.classList.remove('uncomplete-btn');
        toggleButton.classList.add('complete-btn');
        dialogueTextElement.textContent = taskCard.getAttribute('data-dialogue-initial'); 
    }
    
    // 4. Manage Quick Slot State
    if (quickSlotButton) {
        quickSlotButton.classList.toggle('slotted-active', isQuickSlotted);
        quickSlotButton.innerHTML = isQuickSlotted ? '★' : '☆';
    }
    
    // 5. Update Checklist
    generateChecklist(taskCard); 
}

function updateAllTaskStatuses() {
    document.querySelectorAll('.task-card.expandable').forEach(updateTaskStatus);
    filterTasks(); // Re-run filters to hide/show locked tasks
    sortTasks(); 
}

function handleTaskToggle(event) {
    const button = event.target;
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    const wasCompleted = completedTasks[taskId] === true;
    
    if (taskCard.classList.contains('task-locked')) {
        event.stopPropagation();
        return;
    }
    
    const isCompleting = !wasCompleted;
    completedTasks[taskId] = isCompleting;
    
    // Currency tracking logic
    const roubles = parseInt(button.dataset.rewardRoubles || 0);
    const dollars = parseInt(button.dataset.rewardDollars || 0);
    const euros = parseInt(button.dataset.rewardEuros || 0);
    
    const multiplier = isCompleting ? 1 : -1;

    statTracker.roubles += (roubles * multiplier);
    statTracker.dollars += (dollars * multiplier);
    statTracker.euros += (euros * multiplier);
    
    statTracker.roubles = Math.max(0, statTracker.roubles);
    statTracker.dollars = Math.max(0, statTracker.dollars);
    statTracker.euros = Math.max(0, statTracker.euros);

    // Objective list syncing
    const objectivesList = TASKS_DATA.find(t => t.id === taskId).objectives;
    const objectiveCount = objectivesList.length;
    
    if (!completedObjectives[taskId]) {
        completedObjectives[taskId] = {};
    }

    for (let i = 0; i < objectiveCount; i++) {
        completedObjectives[taskId][i] = isCompleting;
    }

    updateStatsDisplay(); // Update stats immediately
    saveProgress();
    
    // Re-evaluate dependencies of ALL tasks
    updateAllTaskStatuses(); 
    
    event.stopPropagation(); 
}


// --- 8. QUICK SLOT SYSTEM HANDLER ---
function handleQuickSlotToggle(event) {
    const button = event.target.closest('.quick-slot-btn');
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    
    quickSlottedTasks[taskId] = !quickSlottedTasks[taskId];
    if (!quickSlottedTasks[taskId]) {
        delete quickSlottedTasks[taskId]; 
    }

    updateTaskStatus(taskCard);
    saveProgress();
    sortTasks(); 
    
    event.stopPropagation(); 
}

// --- 9. TASK SORTING LOGIC ---
function sortTasks() {
    const allCards = document.querySelectorAll('.task-card.expandable'); 
    
    const sortedCards = Array.from(allCards).sort((a, b) => {
        const aIsSlotted = a.classList.contains('task-quick-slotted');
        const bIsSlotted = b.classList.contains('task-quick-slotted');
        
        if (aIsSlotted && !bIsSlotted) return -1; 
        if (!aIsSlotted && bIsSlotted) return 1; 
        
        return 0; 
    });

    sortedCards.forEach(card => {
        tasksSection.appendChild(card);
    });
}


// --- 10. STATS & TAX LOGIC ---
function updateStatsDisplay() {
    document.getElementById('stat-roubles').textContent = statTracker.roubles.toLocaleString();
    document.getElementById('stat-dollars').textContent = statTracker.dollars.toLocaleString();
    document.getElementById('stat-euros').textContent = statTracker.euros.toLocaleString();
    
    document.getElementById('streak-count').textContent = statTracker.streak;
    const multiplierElement = document.getElementById('current-survival-multiplier');
    if (multiplierElement) {
        multiplierElement.textContent = `${statTracker.survivalStreakMultiplier.toFixed(1)}x`;
    }
    
    const salesTaxRateElement = document.getElementById('current-sales-tax');
    if (salesTaxRateElement) {
        salesTaxRateElement.textContent = `${statTracker.salesTax.toFixed(2)}`;
    }
}

function handleStreakButton(result) {
    const roundToTwo = (num) => Math.round(num * 100) / 100;
    const roundToOne = (num) => Math.round(num * 10) / 10;
    
    let currentMultiplier = statTracker.survivalStreakMultiplier || 1.0;

    if (result === 'survived') {
        statTracker.streak += 1;
        
        // Sales Tax - (Sales Tax Reduction * Survival Streak Multiplier)
        // You mentioned 0.5 reduction, so we'll use that as the base reduction.
        const taxDecrease = 0.5 * currentMultiplier;
        statTracker.salesTax = Math.max(2, statTracker.salesTax - taxDecrease);
        
        // Increase multiplier by 0.1 (max 2.0)
        statTracker.survivalStreakMultiplier = Math.min(2.0, currentMultiplier + 0.1); 

    } else if (result === 'kia') {
        // Increase sales tax by 1 (max 10)
        statTracker.salesTax = Math.min(10, statTracker.salesTax + 1);
        
        // Reset multiplier and streak
        statTracker.survivalStreakMultiplier = 1.0; // Reset to 1.0
        statTracker.streak = 0;
    }
    
    statTracker.salesTax = roundToTwo(statTracker.salesTax);
    statTracker.survivalStreakMultiplier = roundToOne(statTracker.survivalStreakMultiplier);

    updateStatsDisplay();
    saveProgress();
}

function calculateFleaTax() {
    const P = parseFloat(inputAmountToTax.value); // Amount to Tax
    
    if (isNaN(P) || P <= 0) {
        taxResults.innerHTML = '<p style="color:red;">Please enter a valid positive Amount to Tax.</p>';
        return;
    }
    
    // 1. Calculate SALES TAX (as a divisor)
    const ST = statTracker.salesTax;
    const preIncomeTaxes = P / ST;
    
    // 2. Determine INCOME TAX TIER
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
    // FST - Income Tax% = Income  (FST is preIncomeTaxes)
    const incomeTaxAmount = preIncomeTaxes * incomeTaxRate;
    const netProfit = preIncomeTaxes - incomeTaxAmount;
    
    taxResults.innerHTML = `
        <p>Money from sales: <span class="currency-rouble">${P.toLocaleString()}₽</span></p>
        <p>Sales Tax: <span class="currency-rouble">÷ ${ST.toFixed(2)}</span></p>
        <p>Pre-Income Taxes (FST): <span class="currency-rouble">${Math.round(preIncomeTaxes).toLocaleString()}₽</span></p>
        <hr style="border-color:#444;">
        <p>Income Tax (${(incomeTaxRate * 100).toFixed(0)}%): <span class="currency-rouble">- ${Math.round(incomeTaxAmount).toLocaleString()}₽</span></p>
        <p class="result-net">Final Income: <span class="currency-rouble">${Math.round(netProfit).toLocaleString()}₽</span></p>
    `;
}

function calculateFoundRoubles() {
    const R = parseFloat(inputFoundRoubles.value); 
    
    if (isNaN(R) || R <= 0) {
        foundRoublesResults.innerHTML = '<p style="color:red;">Please enter a valid positive amount.</p>';
        return;
    }
    
    const keepAmount = R / 5;
    const taxAmount = R - keepAmount;
    
    foundRoublesResults.innerHTML = `
        <p>Total Roubles Found: <span class="currency-rouble">${R.toLocaleString()}₽</span></p>
        <p>Tax: <span class="currency-rouble">- ${Math.round(taxAmount).toLocaleString()}₽</span></p>
        <p class.result-net">Take Home: <span class="currency-rouble">${Math.round(keepAmount).toLocaleString()}₽</span></p>
    `;
}


// --- 11. VIRTUAL STASH LOGIC ---
function handleAddItem() {
    const name = stashItemNameInput.value.trim();
    const count = parseInt(stashItemCountInput.value);

    if (name && count > 0) {
        const existingItem = virtualStash.find(item => item.name.toLowerCase() === name.toLowerCase());
        if (existingItem) {
            existingItem.count += count;
        } else {
            virtualStash.push({ name, count, id: Date.now() });
        }
        
        stashItemNameInput.value = '';
        stashItemCountInput.value = 1;
        renderStash();
        saveProgress();
    }
}

function renderStash() {
    virtualStashList.innerHTML = '';
    if (virtualStash.length === 0) {
        virtualStashList.innerHTML = '<p style="font-style: italic; color: #888;">No items in virtual stash.</p>';
        return;
    }
    
    virtualStash.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('stash-item');
        itemDiv.innerHTML = `
            <span><span class="currency-rouble">${item.count}x</span> ${item.name}</span>
            <button class="remove-stash-item" data-index="${index}">Remove</button>
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


// --- 12. Load progress when the page first loads ---
loadProgress();
