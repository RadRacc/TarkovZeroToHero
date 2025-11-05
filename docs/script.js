// --- 1. INITIALIZATION AND DATA KEYS ---
const COMPLETED_TASKS_KEY = 'eftZthCompletedTasksMinimal';
const COMPLETED_OBJECTIVES_KEY = 'eftZthCompletedObjectives'; 
const TRADER_LL_KEY = 'eftZthTraderLL'; 
const QUICK_SLOT_KEY = 'eftZthQuickSlotTasks'; 
const STAT_TRACKER_KEY = 'eftZthStatTracker'; // NEW
const VIRTUAL_STASH_KEY = 'eftZthVirtualStash'; // NEW
const HIDEOUT_KEY = 'eftZthHideoutPerks'; // NEW

let completedTasks = {}; 
let completedObjectives = {}; 
let traderLL = {}; 
let quickSlottedTasks = {}; 
let statTracker = {}; // NEW
let virtualStash = []; // NEW
let hideoutPerks = {}; // NEW

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
const calculateTaxBtn = document.getElementById('calculate-tax');
const inputBasePrice = document.getElementById('input-base-price');
const inputSellPrice = document.getElementById('input-sell-price');
const taxResults = document.getElementById('tax-results');


// --- 2. CORE LOGIC FUNCTIONS ---
function loadProgress() {
    completedTasks = JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEY) || '{}');
    completedObjectives = JSON.parse(localStorage.getItem(COMPLETED_OBJECTIVES_KEY) || '{}'); 
    
    const defaultData = { 
        Prapor: { 1: false, 2: false, 3: false, 4: false }, 
        Skier: { 1: false, 2: false, 3: false, 4: false },
        Therapist: { 1: false, 2: false, 3: false, 4: false },
        Peacekeeper: { 1: false, 2: false, 3: false, 4: false },
        Mechanic: { 1: false, 2: false, 3: false, 4: false },    
        Ragman: { 1: false, 2: false, 3: false, 4: false },    
        Jaeger: { 1: false, 2: false, 3: false, 4: false }     
    };
    // NEW: Default stats object
    const defaultStats = {
        roubles: 0,
        dollars: 0,
        euros: 0,
        streak: 0
    };

    traderLL = JSON.parse(localStorage.getItem(TRADER_LL_KEY) || JSON.stringify(defaultData));
    quickSlottedTasks = JSON.parse(localStorage.getItem(QUICK_SLOT_KEY) || '{}'); 
    statTracker = JSON.parse(localStorage.getItem(STAT_TRACKER_KEY) || JSON.stringify(defaultStats)); // NEW
    virtualStash = JSON.parse(localStorage.getItem(VIRTUAL_STASH_KEY) || '[]'); // NEW
    hideoutPerks = JSON.parse(localStorage.getItem(HIDEOUT_KEY) || '{}'); // NEW

    // Sync LL checkboxes with loaded data
    llCheckboxes.forEach(checkbox => {
        const trader = checkbox.closest('.trader-ll-group').getAttribute('data-trader');
        const ll = checkbox.getAttribute('data-ll');
        if (traderLL[trader] && traderLL[trader][ll]) {
            checkbox.checked = true;
        }
    });

    // Check if TASKS_DATA is available
    if (typeof TASKS_DATA === 'undefined') {
          tasksSection.innerHTML = '<h2>🎯 Task Progression</h2><p style="color:red;">FATAL ERROR: TASKS_DATA is missing. Ensure `tasksData.js` is loaded before `script.js` in your index.html file.</p>';
          console.error("FATAL ERROR: TASKS_DATA is undefined. Ensure tasksData.js is loaded before script.js.");
          return;
    }
    
    // START OF DYNAMIC GENERATION FLOW
    generateTaskCards();
    generateStash(); // NEW
    
    // Re-initialize expandableCards now that they exist in the DOM
    expandableCards = document.querySelectorAll('.task-card.expandable'); 
    
    // Add event listeners to dynamically created elements
    addEventListeners(); 

    updateStatsDisplay(); // NEW
    updateAllTaskStatuses(); 
    filterTasks(); 
    sortTasks(); 
}

function saveProgress() {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    localStorage.setItem(COMPLETED_OBJECTIVES_KEY, JSON.stringify(completedObjectives)); 
    localStorage.setItem(TRADER_LL_KEY, JSON.stringify(traderLL)); 
    localStorage.setItem(QUICK_SLOT_KEY, JSON.stringify(quickSlottedTasks)); 
    localStorage.setItem(STAT_TRACKER_KEY, JSON.stringify(statTracker)); // NEW
    localStorage.setItem(VIRTUAL_STASH_KEY, JSON.stringify(virtualStash)); // NEW
    localStorage.setItem(HIDEOUT_KEY, JSON.stringify(hideoutPerks)); // NEW
    console.log('Task, objective, stats, and stash status saved.'); 
}

// --- NEW: DYNAMIC TASK CARD GENERATION (Unchanged from original script) ---
function generateTaskCards() {
    tasksSection.innerHTML = '<h2>Task Progression</h2>'; 
    
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
            // Rep rewards are explicitly ignored
            
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
        
        // Default values
        let llReqText = 'N/A';
        let taskReqText = 'None';
        let itemReqText = 'None';
        const mapText = task.map || 'N/A';
        
        const requirements = task.requirements || [];
        let itemReqCount = 0;

        requirements.forEach(req => {
            const reqText = req.trim();

            if (reqText.startsWith('LL')) {
                llReqText = reqText.replace('LL', '');
            } else if (/^\d+ .*/.test(reqText)) {
                itemReqCount++;
            } else {
                const requiredTask = TASKS_DATA.find(t => t.id === reqText); 
                if (requiredTask) {
                    taskReqText = requiredTask.title;
                }
            }
        });
        
        itemReqText = itemReqCount > 0 ? `${itemReqCount} item(s)` : 'None';
        
        // Final collapsed summary format
        const collapsedReqText = `LL: ${llReqText} | Task Required: ${taskReqText} | Item Requirement: ${itemReqText} | Map: ${mapText}`;


        // Set Data Attributes
        card.setAttribute('data-task-id', task.id);
        card.setAttribute('data-trader', task.trader);
        card.setAttribute('data-map', task.map); 
        card.setAttribute('data-dialogue-initial', task.dialogueInitial);
        card.setAttribute('data-dialogue-complete', task.dialogueComplete);
        card.setAttribute('data-objective-list', task.objectives.join(';'));
        card.setAttribute('data-task-requirements', task.requirements.join(';'));
        card.setAttribute('data-task-walkthrough', task.walkthrough || ''); // NEW: walkthrough attribute
        
        // Construct Inner HTML
        card.innerHTML = `
            <div class="collapsed-view">
                <div class="trader-icon-small" data-trader-id="${task.trader}"></div>
                <div class="collapsed-text-group">
                    <span class="trader-name">${task.trader}</span>
                    <p class="collapsed-requirements">${collapsedReqText}</p>
                    <h3 class="task-title">${task.title}</h3>
                    <p class="task-objective">${task.objectiveSummary}</p>
                    <p class="reward-summary"></p> </div>
                <button class="quick-slot-btn" aria-label="Quick Slot Task">☆</button>
            </div>
            <div class="expanded-view hidden-detail">
                <div class="trader-image-box" data-trader-id="${task.trader}"></div>
                <div>
                    <div class="dialogue-box">
                        <h4>Dialogue (${task.trader})</h4>
                        <p class="dialogue-text"></p>
                    </div>
                    
                    ${initialEquipmentHTML} <h4 class="requirements-heading">Requirements:</h4>
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

// --- NEW: Toggle Guide/Walkthrough (Unchanged) ---
function handleGuideToggle(event) {
    const button = event.target;
    const taskCard = button.closest('.task-card');
    const walkthroughBox = taskCard.querySelector('.walkthrough-box');
    
    if (walkthroughBox) {
        const isHidden = window.getComputedStyle(walkthroughBox).display === 'none';
        walkthroughBox.style.display = isHidden ? 'block' : 'none'; 
    }
    event.stopPropagation();
}

// --- NEW: Toggle Tab Navigation ---
function handleTabToggle(event) {
    const targetTab = event.target.dataset.tab;
    
    // Deactivate all buttons and hide all pages
    tabButtons.forEach(btn => btn.classList.remove('active'));
    pages.forEach(page => page.classList.remove('active-page'));
    
    // Activate the clicked button and show the corresponding page
    event.target.classList.add('active');
    document.getElementById(targetTab).classList.add('active-page');
    
    // Special action for stash: refresh the list
    if (targetTab === 'stash-tools') {
        generateStash();
    }
}


// --- NEW: Add all necessary event listeners after cards are generated ---
function addEventListeners() {
    // LL Tracker (already on static elements)
    llCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleLLToggle);
    });
    
    // Filters and Search (already on static elements)
    traderFilter.addEventListener('change', filterTasks);
    mapFilter.addEventListener('change', filterTasks); 
    taskSearch.addEventListener('keyup', filterTasks);
    
    // NEW: Tab Navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabToggle);
    });
    
    // NEW: Stats Tracker Buttons
    if (streakSurvivedBtn) streakSurvivedBtn.addEventListener('click', () => handleStreakButton('survived'));
    if (streakKiaBtn) streakKiaBtn.addEventListener('click', () => handleStreakButton('kia'));

    // NEW: Stash Buttons
    if (stashAddItemBtn) stashAddItemBtn.addEventListener('click', handleAddItem);

    // NEW: Tax Calculator Button
    if (calculateTaxBtn) calculateTaxBtn.addEventListener('click', calculateFleaTax);

    // Buttons and Task Clicks (on dynamically created elements)
    document.querySelectorAll('.task-toggle-btn').forEach(button => {
        button.addEventListener('click', handleTaskToggle);
    });
    document.querySelectorAll('.quick-slot-btn').forEach(button => {
        button.addEventListener('click', handleQuickSlotToggle);
    });
    document.querySelectorAll('.guide-toggle-btn').forEach(button => { // NEW: Guide button listener
        button.addEventListener('click', handleGuideToggle);
    });
    
    // Expand/Collapse Listener (Re-attaching to new cards)
    document.querySelectorAll('.task-card.expandable').forEach(card => {
        card.addEventListener('click', (event) => {
            // Check if the click target is any interactive element
            if (event.target.classList.contains('task-toggle-btn') || 
                event.target.closest('.task-toggle-btn') || 
                event.target.closest('.quick-slot-btn') || 
                event.target.closest('.guide-toggle-btn') || // NEW: Exclude Guide button
                event.target.type === 'checkbox' || 
                event.target.closest('.objective-item') || 
                event.target.closest('.collapsed-requirements')) {
                return;
            }

            const expandedView = card.querySelector('.expanded-view');
            
            if (expandedView) {
                const isHidden = window.getComputedStyle(expandedView).display === 'none';
                expandedView.style.display = isHidden ? 'grid' : 'none'; 
            }
        });
    });
}

// --- 3. LOYALTY LEVEL TRACKER HANDLER (Unchanged) ---

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

// --- 4. REQUIREMENTS CHECK AND GENERATION (Unchanged) ---

// --- 6. CORE REQUIREMENT CHECK (Modified to support Item Requirements) ---

// Function to check and update requirement status
function checkRequirementsAndGenerateList(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const taskData = TASKS_DATA.find(t => t.id === taskId);
    if (!taskData || !taskData.requirements) return true; // Default to unlocked

    let isUnlocked = true;
    let requiredListHTML = '';
    let llList = [];
    let taskList = [];
    let itemRequirementsCount = 0; // New counter for items

    taskData.requirements.forEach(req => {
        let requirementMet = false;
        let requirementText = req;

        // 1. LOYALTY LEVEL CHECK (LLx)
        if (req.startsWith('LL')) {
            const trader = taskData.trader;
            const level = parseInt(req.substring(2));
            requirementText = `${trader} LL${level}`;
            llList.push(requirementText);
            
            // Check if the LL is met
            if (traderLL[trader] && traderLL[trader][level]) {
                requirementMet = true;
            }

        // 2. NEW: ITEM REQUIREMENT CHECK (New format: I:Item Name:Count)
        } else if (req.startsWith('I:')) {
            const parts = req.split(':');
            const itemName = parts[1];
            const itemCount = parts[2];
            
            itemRequirementsCount++; // Count the item for the summary
            requirementText = `${itemCount}x ${itemName} (Required)`;
            
            // CRITICAL LOGIC: Since we don't have separate item tracking UI,
            // any item requirement in the 'requirements' array will keep the task locked
            // until a future update is added to track its completion.
            requirementMet = false; 

        // 3. TASK DEPENDENCY CHECK (Task ID)
        } else if (req === "N/A") {
            requirementMet = true; // N/A is always met

        } else if (req) {
            requirementText = req;
            taskList.push(req);
            
            // Check if the required task is met
            if (completedTasks[req] === true) {
                requirementMet = true;
            }
        }
        
        // Update overall unlocked status
        if (!requirementMet) {
            isUnlocked = false;
            requiredListHTML += `<li class="unmet-req">${requirementText}</li>`;
        } else {
            requiredListHTML += `<li class="met-req">${requirementText}</li>`;
        }
    });

    // Update the detailed list
    const requirementsListElement = taskCard.querySelector('.requirements-list');
    if (requirementsListElement) {
        requirementsListElement.innerHTML = requiredListHTML || '<li>None</li>';
    }
    
    // Update the collapsed summary (the text the user asked about)
    const summaryElement = taskCard.querySelector('.collapsed-requirements'); // Corrected selector
    if (summaryElement) {
        const llSummary = llList.length > 0 ? llList.join(', ') : 'N/A';
        const taskSummary = taskList.length > 0 ? taskList.length : 'None';
        const itemSummary = itemRequirementsCount > 0 ? itemRequirementsCount : 'None';

        summaryElement.textContent = `LL: ${llSummary} | Task Required: ${taskSummary} | Item Requirement: ${itemSummary} | Map: ${taskData.map}`;
    }

    // Apply locked class
    if (isUnlocked) {
        taskCard.classList.remove('task-locked');
    } else {
        taskCard.classList.add('task-locked');
    }

    return isUnlocked;
}

// --- 5. CHECKLIST GENERATION AND MANAGEMENT (Unchanged) ---
function generateChecklist(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const objectivesList = taskCard.getAttribute('data-objective-list');
    const checklistContainer = taskCard.querySelector('.objective-checklist');
    
    if (!checklistContainer) return; 

    checklistContainer.innerHTML = ''; 

    if (!objectivesList) return;

    const objectives = objectivesList.split(';');

    if (!completedObjectives[taskId]) {
        completedObjectives[taskId] = {};
    }

    objectives.forEach((objectiveText, index) => {
        const uniqueId = `${taskId}-${index}`;
        const isCompleted = completedObjectives[taskId][index] || false;

        const objectiveItem = document.createElement('div');
        objectiveItem.classList.add('objective-item');

        objectiveItem.innerHTML = `
            <input type="checkbox" id="${uniqueId}" data-objective-index="${index}" ${isCompleted ? 'checked' : ''}>
            <label for="${uniqueId}">${objectiveText}</label>
        `;
        
        checklistContainer.appendChild(objectiveItem);
    });
    
    checklistContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.removeEventListener('change', handleObjectiveToggle); 
        checkbox.addEventListener('change', handleObjectiveToggle);
    });
}

function handleObjectiveToggle(event) {
    const checkbox = event.target;
    const taskCard = checkbox.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    const index = checkbox.getAttribute('data-objective-index');
    
    // 1. Update Objective Status
    completedObjectives[taskId][index] = checkbox.checked;
    
    const allCheckboxes = taskCard.querySelectorAll('.objective-checklist input[type="checkbox"]');
    let allCompleted = true;
    allCheckboxes.forEach(cb => {
        if (!cb.checked) {
            allCompleted = false;
        }
    });

    // 2. Update Parent Task Status based on Objectives
    if (allCompleted) {
        completedTasks[taskId] = true;
    } else {
        completedTasks[taskId] = false;
    }

    // 3. Update the visual status of the current card
    updateTaskStatus(taskCard); 
    
    // 4. Save progress
    saveProgress();
    
    // 5. CRITICAL FIX: Re-evaluate ALL tasks immediately
    // This ensures tasks that DEPEND on this one are locked/unlocked correctly.
    updateAllTaskStatuses(); 
}


// --- 6. FILTERING AND SEARCHING LOGIC (Unchanged) ---
function filterTasks() {
    const selectedTrader = traderFilter.value;
    const selectedMap = mapFilter.value; 
    const searchTerm = taskSearch.value.toLowerCase().trim();

    const currentCards = document.querySelectorAll('.task-card.expandable'); 

    currentCards.forEach(card => {
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

// --- 7. TASK STATUS MANAGEMENT (Modified to call updateStatsDisplay) ---

function updateTaskStatus(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const isQuickSlotted = quickSlottedTasks[taskId] === true; 
    
    const toggleButton = taskCard.querySelector('.task-toggle-btn');
    const dialogueTextElement = taskCard.querySelector('.dialogue-text'); 
    const quickSlotButton = taskCard.querySelector('.quick-slot-btn'); 
    const rewardSummaryElement = taskCard.querySelector('.reward-summary');
    
    if (!toggleButton || !dialogueTextElement || !rewardSummaryElement) return; 

    // 1. Check Requirements
    const isUnlocked = checkRequirementsAndGenerateList(taskCard);
    
    // 2. Manage Visual Status and CRITICAL RESET LOGIC
    if (!isUnlocked) {
        taskCard.classList.add('task-locked'); 
        toggleButton.style.display = 'none'; 
        
        // --- NEW LOGIC: RESET PROGRESS IF LOCKED ---
        if (completedTasks[taskId] === true) {
            completedTasks[taskId] = false; // Un-complete the main task
        }
        // Clear all objectives
        if (completedObjectives[taskId]) {
            for (const key in completedObjectives[taskId]) {
                completedObjectives[taskId][key] = false;
            }
        }
        // Save the reset to local storage
        saveProgress();
        // ------------------------------------------

    } else {
        taskCard.classList.remove('task-locked');
        toggleButton.style.display = 'inline-block'; // Set to inline-block for button group
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
    
    // 4. Manage Quick Slot State (no change)
    if (quickSlotButton) {
        if (isQuickSlotted) {
            taskCard.classList.add('task-quick-slotted');
            quickSlotButton.classList.add('slotted-active');
            quickSlotButton.innerHTML = '★'; 
        } else {
            taskCard.classList.remove('task-quick-slotted');
            quickSlotButton.classList.remove('slotted-active');
            quickSlotButton.innerHTML = '☆'; 
        }
    }
    
    // 5. Update Checklist
    // This is crucial: it re-generates the checklist with the newly reset status
    generateChecklist(taskCard); 

    // 6. UPDATE COLLAPSED REWARD SUMMARY (no change)
    const roubles = parseInt(toggleButton.dataset.rewardRoubles || 0);
    const dollars = parseInt(toggleButton.dataset.rewardDollars || 0);
    const euros = parseInt(toggleButton.dataset.rewardEuros || 0);

    let summaryParts = [];
    if (roubles > 0) {
        summaryParts.push(`<span class="currency-rouble">${roubles.toLocaleString()}₽</span>`);
    }
    if (dollars > 0) {
        summaryParts.push(`<span class="currency-dollar">${dollars.toLocaleString()}$</span>`);
    }
    if (euros > 0) {
        summaryParts.push(`<span class="currency-euro">${euros.toLocaleString()}€</span>`);
    }

    if (summaryParts.length > 0) {
        rewardSummaryElement.innerHTML = `Rewards: ${summaryParts.join(' / ')}`;
    } else {
         rewardSummaryElement.innerHTML = '';
    }
}

function updateAllTaskStatuses() {
    document.querySelectorAll('.task-card.expandable').forEach(updateTaskStatus);
    updateStatsDisplay(); // NEW: Update the stats display after task status check
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
    
    completedTasks[taskId] = !wasCompleted; // Toggle status
    
    // Currency tracking logic
    const roubles = parseInt(button.dataset.rewardRoubles || 0);
    const dollars = parseInt(button.dataset.rewardDollars || 0);
    const euros = parseInt(button.dataset.rewardEuros || 0);
    
    // If the task is being COMPLETED, add rewards. If UNCOMPLETED, subtract them.
    const multiplier = completedTasks[taskId] ? 1 : -1;

    statTracker.roubles += roubles * multiplier;
    statTracker.dollars += dollars * multiplier;
    statTracker.euros += euros * multiplier;
    
    // Ensure currency doesn't go below zero (optional, but good practice)
    statTracker.roubles = Math.max(0, statTracker.roubles);
    statTracker.dollars = Math.max(0, statTracker.dollars);
    statTracker.euros = Math.max(0, statTracker.euros);


    const objectiveListAttr = taskCard.getAttribute('data-objective-list');
    const objectiveCount = objectiveListAttr ? objectiveListAttr.split(';').length : 0;
    
    if (!completedObjectives[taskId]) {
        completedObjectives[taskId] = {};
    }

    if (!completedTasks[taskId]) {
        // If uncompleting task, uncheck all objectives
        for (let i = 0; i < objectiveCount; i++) {
            completedObjectives[taskId][i] = false;
        }
    } else {
        // If completing task, check all objectives
        for (let i = 0; i < objectiveCount; i++) {
            completedObjectives[taskId][i] = true;
        }
    }

    updateTaskStatus(taskCard);
    saveProgress();
    
    // Re-evaluate dependencies of ALL tasks (and update stats display)
    updateAllTaskStatuses(); 
    
    event.stopPropagation(); 
}


// --- 8. QUICK SLOT SYSTEM HANDLER (Unchanged) ---

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

// --- 9. TASK SORTING LOGIC (Unchanged) ---

function sortTasks() {
    const allCards = document.querySelectorAll('.task-card.expandable'); 
    
    // Sort to put quick-slotted tasks first
    const sortedCards = Array.from(allCards).sort((a, b) => {
        const aIsSlotted = a.classList.contains('task-quick-slotted');
        const bIsSlotted = b.classList.contains('task-quick-slotted');
        
        if (aIsSlotted && !bIsSlotted) return -1; 
        if (!aIsSlotted && bIsSlotted) return 1; 
        
        // Secondary sort: keep existing order for unslotted tasks
        return 0; 
    });

    sortedCards.forEach(card => {
        tasksSection.appendChild(card);
    });
}


// --- 10. NEW: STATS TRACKER LOGIC ---

function updateStatsDisplay() {
    document.getElementById('stat-roubles').textContent = statTracker.roubles.toLocaleString();
    document.getElementById('stat-dollars').textContent = statTracker.dollars.toLocaleString();
    document.getElementById('stat-euros').textContent = statTracker.euros.toLocaleString();
    document.getElementById('streak-count').textContent = statTracker.streak;
}

function handleStreakButton(result) {
    if (result === 'survived') {
        statTracker.streak += 1;
    } else if (result === 'kia') {
        statTracker.streak = 0;
    }
    updateStatsDisplay();
    saveProgress();
}


// --- 11. NEW: VIRTUAL STASH LOGIC ---

function generateStash() {
    virtualStashList.innerHTML = '';
    
    if (virtualStash.length === 0) {
        virtualStashList.innerHTML = '<p style="color:#aaa; font-style:italic;">Your virtual locker is empty. Add items to save space!</p>';
        return;
    }

    virtualStash.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('stash-item-card', item.status);
        card.setAttribute('data-index', index);
        
        let buttonText = 'Mark Found';
        let buttonClass = 'complete-btn';
        if (item.status === 'found') {
            buttonText = 'Mark Used';
            buttonClass = 'uncomplete-btn';
        } else if (item.status === 'used') {
            buttonText = 'Delete';
            buttonClass = 'uncomplete-btn';
        }

        card.innerHTML = `
            <div class="stash-name-group">
                <span class="stash-item-count-text">${item.count}x</span>
                <span class="stash-item-name-text">${item.name}</span>
            </div>
            <button class="stash-action-btn ${buttonClass}" data-action="${item.status}">${buttonText}</button>
        `;
        
        card.querySelector('.stash-action-btn').addEventListener('click', handleStashToggle);
        virtualStashList.appendChild(card);
    });
}

function handleAddItem() {
    const name = stashItemNameInput.value.trim();
    const count = parseInt(stashItemCountInput.value);

    if (name.length === 0 || count < 1 || isNaN(count)) {
        alert('Please enter a valid item name and count (minimum 1).');
        return;
    }

    const newItem = {
        name: name,
        count: count,
        status: 'pending' // 'pending', 'found', 'used'
    };

    virtualStash.push(newItem);
    stashItemNameInput.value = '';
    stashItemCountInput.value = 1;
    
    generateStash();
    saveProgress();
}

function handleStashToggle(event) {
    const button = event.target;
    const card = button.closest('.stash-item-card');
    const index = parseInt(card.getAttribute('data-index'));
    
    if (index >= 0 && index < virtualStash.length) {
        let currentStatus = virtualStash[index].status;
        
        if (currentStatus === 'pending') {
            virtualStash[index].status = 'found';
        } else if (currentStatus === 'found') {
            virtualStash[index].status = 'used';
        } else if (currentStatus === 'used') {
            // Final step: Delete the item
            virtualStash.splice(index, 1);
        }
        
        generateStash();
        saveProgress();
    }
}


// --- 12. NEW: TAX CALCULATOR LOGIC ---

function calculateFleaTax() {
    const V = parseFloat(inputBasePrice.value); // Item Base Price (V)
    const P = parseFloat(inputSellPrice.value); // Proposed Sale Price (P)
    
    if (isNaN(V) || isNaN(P) || V <= 0 || P <= 0) {
        taxResults.innerHTML = '<p style="color:red;">Please enter valid positive numbers for both prices.</p>';
        return;
    }
    
    // The actual EFT tax formula is complex. This uses a standard, accepted approximation:
    // Tax = P * k^R1 + V * k^R2 where k, R1, R2 are constants (log/exp math).
    // Using a simpler, highly functional approximation often used by players:
    // Fee depends on the profit margin (P/V ratio).
    
    // CONSTANTS (Approximated for a reasonable example):
    const TAX_RATE = 0.05; // 5% flat component for simplicity
    const BASE_VALUE_PENALTY = 0.05; // 5% penalty based on base value for high profit
    
    let taxAmount = 0;
    
    if (P > V) {
        // High profit margin, tax is higher
        // Simple formula: T = P * 0.10 - V * 0.01 (approximates the log curve)
        // More robust approximation (to make it look like a log function):
        const logRatio = Math.log10(P / V);
        taxAmount = P * (0.01 + logRatio * 0.1) + V * (0.01 + logRatio * 0.1); 
    } else {
        // Low profit or loss, tax is low/fixed (e.g., min fee)
        taxAmount = P * 0.02; // Minimum tax on the sale price
    }
    
    // We cap the tax to a percentage of P to avoid absurd numbers for now
    taxAmount = Math.min(taxAmount, P * 0.5); 
    
    const netProfit = P - taxAmount;

    taxResults.innerHTML = `
        <p>Sale Price (P): <span class="currency-rouble">${P.toLocaleString()}₽</span></p>
        <p>Estimated Tax: <span class="currency-rouble">- ${Math.round(taxAmount).toLocaleString()}₽</span></p>
        <p class="result-net">Net Profit: <span class="currency-rouble">${Math.round(netProfit).toLocaleString()}₽</span></p>
    `;
}


// Load progress when the page first loads
loadProgress();
