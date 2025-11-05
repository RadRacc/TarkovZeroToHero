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
const calculateTaxBtn = document.getElementById('calculate-tax');
const inputBasePrice = document.getElementById('input-base-price');
const inputSellPrice = document.getElementById('input-sell-price');
const taxResults = document.getElementById('tax-results');
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
        salesTaxRate: 6, 
        survivalStreakMultiplier: 1 
    };

    traderLL = JSON.parse(localStorage.getItem(TRADER_LL_KEY) || JSON.stringify(defaultData));
    quickSlottedTasks = JSON.parse(localStorage.getItem(QUICK_SLOT_KEY) || '{}'); 
    // Merge loaded statTracker with defaults to ensure new tax keys exist
    const loadedStats = JSON.parse(localStorage.getItem(STAT_TRACKER_KEY) || '{}');
    statTracker = { ...defaultStats, ...loadedStats };
    
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
        // Event listener is added in addEventListeners
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

// --- NEW: HIDE LOCKED TASK HANDLER ---
function handleHideLockedToggle(event) {
    hideLockedTasks = event.target.checked;
    saveProgress();
    filterTasks();
}

// --- NEW: DYNAMIC TASK CARD GENERATION (Retained from previous working version) ---

function generateTaskCards() {
    // NOTE: This function's full content is needed for the app to work, 
    // but due to space, we keep the core definition structure.
    // The previous implementation is assumed to be included here.
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

        // --- 3. Determine Collapsed Requirement Text ---
        
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

// --- NEW: Toggle Guide/Walkthrough ---
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


function addEventListeners() {
    // LL Tracker 
    llCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleLLToggle);
    });
    
    // Filters and Search 
    traderFilter.addEventListener('change', filterTasks);
    mapFilter.addEventListener('change', filterTasks); 
    taskSearch.addEventListener('keyup', filterTasks);
    // NEW: Hide Locked Tasks listener
    if (hideLockedCheckbox) hideLockedCheckbox.addEventListener('change', handleHideLockedToggle);
    
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

// --- 3. LOYALTY LEVEL TRACKER HANDLER (Logic remains same) ---
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

// --- 4. REQUIREMENTS CHECK AND GENERATION (Logic remains same) ---
function checkRequirementsAndGenerateList(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const taskData = TASKS_DATA.find(t => t.id === taskId);
    if (!taskData || !taskData.requirements) return true; 

    let isUnlocked = true;
    let requiredListHTML = '';
    let llList = [];
    let taskList = [];
    let itemRequirementsCount = 0; 

    taskData.requirements.forEach(req => {
        let requirementMet = false;
        let requirementText = req;

        // 1. LOYALTY LEVEL CHECK (LLx)
        if (req.startsWith('LL')) {
            const trader = taskData.trader;
            const level = parseInt(req.substring(2));
            requirementText = `${trader} LL${level}`;
            llList.push(requirementText);
            
            if (traderLL[trader] && traderLL[trader][level]) {
                requirementMet = true;
            }

        // 2. ITEM REQUIREMENT CHECK (New format: I:Item Name:Count)
        } else if (req.startsWith('I:')) {
            const parts = req.split(':');
            const itemName = parts[1];
            const itemCount = parts[2];
            
            itemRequirementsCount++; 
            requirementText = `${itemCount}x ${itemName} (Required)`;
            
            requirementMet = false; 

        // 3. TASK DEPENDENCY CHECK (Task ID)
        } else if (req === "N/A") {
            requirementMet = true; 

        } else if (req) {
            requirementText = req;
            taskList.push(req);
            
            if (completedTasks[req] === true) {
                requirementMet = true;
            }
        }
        
        if (!requirementMet) {
            isUnlocked = false;
            requiredListHTML += `<li class="unmet-req">${requirementText}</li>`;
        } else {
            requiredListHTML += `<li class="met-req">${requirementText}</li>`;
        }
    });

    const requirementsListElement = taskCard.querySelector('.task-requirements-list');
    if (requirementsListElement) {
        requirementsListElement.innerHTML = requiredListHTML || '<li>None</li>';
    }
    
    // Update the collapsed summary (the text the user asked about)
    const summaryElement = taskCard.querySelector('.collapsed-requirements');
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


// --- 5. CHECKLIST GENERATION AND MANAGEMENT (Logic remains same) ---
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
    updateAllTaskStatuses(); 
}


// --- 6. FILTERING AND SEARCHING LOGIC (UPDATED with hide locked logic) ---
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

// --- 7. TASK STATUS MANAGEMENT (Logic remains same) ---

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
        
        // --- LOGIC: RESET PROGRESS IF LOCKED ---
        if (completedTasks[taskId] === true) {
            completedTasks[taskId] = false; 
        }
        if (completedObjectives[taskId]) {
            for (const key in completedObjectives[taskId]) {
                completedObjectives[taskId][key] = false;
            }
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
    generateChecklist(taskCard); 

    // 6. UPDATE COLLAPSED REWARD SUMMARY
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
    sortTasks(); 
}


function handleTaskToggle(event) {
    const button = event.target;
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    
    if (taskCard.classList.contains('task-locked')) {
        event.stopPropagation();
        return;
    }
    
    completedTasks[taskId] = !completedTasks[taskId];

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
    
    // Re-evaluate dependencies of ALL tasks
    updateAllTaskStatuses(); 
    
    event.stopPropagation(); 
}


// --- 8. QUICK SLOT SYSTEM HANDLER (Logic remains same) ---

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

// --- 9. TASK SORTING LOGIC (Logic remains same) ---

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

// --- STATS TRACKER LOGIC (New Tax Mechanics) ---

function handleTabToggle(event) {
    const tabName = event.target.getAttribute('data-tab');

    tabButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    pages.forEach(page => {
        if (page.id === tabName) {
            page.classList.add('active-page');
            page.style.display = 'block';
        } else {
            page.classList.remove('active-page');
            page.style.display = 'none';
        }
    });

    if (tabName === 'stats-tracker') {
        updateStatsDisplay(); 
    }
}

function updateStatsDisplay() {
    // Stat displays (assuming they exist in HTML)
    document.getElementById('stat-roubles').textContent = statTracker.roubles.toLocaleString();
    document.getElementById('stat-dollars').textContent = statTracker.dollars.toLocaleString();
    document.getElementById('stat-euros').textContent = statTracker.euros.toLocaleString();
    document.getElementById('streak-count').textContent = statTracker.streak;
    
    // NEW: Update Sales Tax Rate Display
    const salesTaxRateElement = document.getElementById('current-sales-tax-rate');
    if (salesTaxRateElement) {
        salesTaxRateElement.textContent = `${statTracker.salesTaxRate.toFixed(2)}% (x${statTracker.survivalStreakMultiplier.toFixed(1)} multiplier)`;
    }
}

function handleStreakButton(result) {
    // Rounding function for two decimal places
    const roundToTwo = (num) => Math.round(num * 100) / 100;

    if (result === 'survived') {
        statTracker.streak += 1;
        
        // 1. Decrease sales tax by 0.5 * multiplier (min 2)
        const taxDecrease = 0.5 * statTracker.survivalStreakMultiplier;
        statTracker.salesTaxRate = Math.max(2, statTracker.salesTaxRate - taxDecrease);
        
        // 2. Increase multiplier by 0.1 (max 2)
        statTracker.survivalStreakMultiplier = Math.min(2, statTracker.survivalStreakMultiplier + 0.1);

    } else if (result === 'kia') {
        
        // 1. Increase sales tax by 1 * multiplier (max 10)
        const taxIncrease = 1 * statTracker.survivalStreakMultiplier;
        statTracker.salesTaxRate = Math.min(10, statTracker.salesTaxRate + taxIncrease);
        
        // 2. Reset multiplier and streak
        statTracker.survivalStreakMultiplier = 0;
        statTracker.streak = 0;
    }
    
    // Ensure both tax rate and multiplier are rounded for display/storage
    statTracker.salesTaxRate = roundToTwo(statTracker.salesTaxRate);
    statTracker.survivalStreakMultiplier = roundToTwo(statTracker.survivalStreakMultiplier);


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


// --- TAX CALCULATOR LOGIC (New Tax Tiers) ---

function calculateFleaTax() {
    // const V = parseFloat(inputBasePrice.value); // Base Price (V) is not used in the final calculation
    const P = parseFloat(inputSellPrice.value); // Proposed Sale Price (P)
    
    if (isNaN(P) || P <= 0) {
        taxResults.innerHTML = '<p style="color:red;">Please enter a valid positive Sale Price (P).</p>';
        return;
    }
    
    // 1. Calculate SALES TAX
    const salesTaxRate = statTracker.salesTaxRate / 100;
    const salesTaxAmount = P * salesTaxRate;
    const incomeBeforeIncomeTax = P - salesTaxAmount;
    
    // 2. Determine INCOME TAX TIER
    let incomeTaxRate = 0;
    
    if (incomeBeforeIncomeTax <= 100000) {
        incomeTaxRate = 0.65; // 65%
    } else if (incomeBeforeIncomeTax <= 200000) {
        incomeTaxRate = 0.75; // 75%
    } else if (incomeBeforeIncomeTax <= 400000) {
        incomeTaxRate = 0.80; // 80%
    } else if (incomeBeforeIncomeTax <= 800000) {
        incomeTaxRate = 0.85; // 85%
    } else {
        incomeTaxRate = 0.90; // 90%
    }
    
    // 3. Calculate INCOME TAX and FINAL PROFIT
    const incomeTaxAmount = incomeBeforeIncomeTax * incomeTaxRate;
    const netProfit = incomeBeforeIncomeTax - incomeTaxAmount;
    
    taxResults.innerHTML = `
        <p>Sale Price (P): <span class="currency-rouble">${P.toLocaleString()}₽</span></p>
        <p>Dynamic Sales Fee (${(salesTaxRate * 100).toFixed(2)}%): <span class="currency-rouble">- ${Math.round(salesTaxAmount).toLocaleString()}₽</span></p>
        <p>Income Before Tax: <span class="currency-rouble">${Math.round(incomeBeforeIncomeTax).toLocaleString()}₽</span></p>
        <hr style="border-color:#444;">
        <p>Income Tax (${(incomeTaxRate * 100).toFixed(0)}%): <span class="currency-rouble">- ${Math.round(incomeTaxAmount).toLocaleString()}₽</span></p>
        <p class="result-net">Net Profit (Take Home): <span class="currency-rouble">${Math.round(netProfit).toLocaleString()}₽</span></p>
    `;
}

// Load progress when the page first loads
loadProgress();
