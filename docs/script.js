// --- 1. INITIALIZATION AND DATA KEYS ---
const COMPLETED_TASKS_KEY = 'eftZthCompletedTasksMinimal';
const COMPLETED_OBJECTIVES_KEY = 'eftZthCompletedObjectives'; 
const TRADER_LL_KEY = 'eftZthTraderLL'; 
const QUICK_SLOT_KEY = 'eftZthQuickSlotTasks'; 

let completedTasks = {}; 
let completedObjectives = {}; 
let traderLL = {}; 
let quickSlottedTasks = {}; 

// DOM Elements
let expandableCards = []; 
const traderFilter = document.getElementById('trader-filter');
const mapFilter = document.getElementById('map-filter'); 
const taskSearch = document.getElementById('task-search');
const llCheckboxes = document.querySelectorAll('#ll-tracker input[type="checkbox"]');
const tasksSection = document.getElementById('tasks'); 

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

    traderLL = JSON.parse(localStorage.getItem(TRADER_LL_KEY) || JSON.stringify(defaultData));
    quickSlottedTasks = JSON.parse(localStorage.getItem(QUICK_SLOT_KEY) || '{}'); 

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
    
    // Re-initialize expandableCards now that they exist in the DOM
    expandableCards = document.querySelectorAll('.task-card.expandable'); 
    
    // Add event listeners to dynamically created elements
    addEventListeners(); 

    updateAllTaskStatuses(); 
    filterTasks(); 
    sortTasks(); 
}

function saveProgress() {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    localStorage.setItem(COMPLETED_OBJECTIVES_KEY, JSON.stringify(completedObjectives)); 
    localStorage.setItem(TRADER_LL_KEY, JSON.stringify(traderLL)); 
    localStorage.setItem(QUICK_SLOT_KEY, JSON.stringify(quickSlottedTasks)); 
    console.log('Task and objective status saved.'); 
}

// --- NEW: DYNAMIC TASK CARD GENERATION ---

function generateTaskCards() {
    tasksSection.innerHTML = '<h2>Task Progression</h2>'; 
    
    TASKS_DATA.forEach(task => {
        const card = document.createElement('div');
        card.classList.add('task-card', 'expandable');
        
        let rewardRoubles = 0;
        let rewardDollars = 0;
        let rewardEuros = 0;

        // Map rewards array to HTML list items
        const rewardsHTML = task.rewards.map(reward => {
            let itemText = '';
            let dataAttr = '';
            let iconPath = ''; // ADDED: Icon path variable
            
            if (reward.type === 'roubles') {
                itemText = `${reward.amount.toLocaleString()} Roubles (₽)`;
                dataAttr = `data-item="roubles"`;
                rewardRoubles = reward.amount;
                iconPath = 'images/icon-roubles.png'; // ADDED: Roubles icon path
            } else if (reward.type === 'dollars') {
                itemText = `${reward.amount.toLocaleString()} Dollars ($)`;
                dataAttr = `data-item="dollars"`;
                rewardDollars = reward.amount;
                iconPath = 'images/icon-dollars.png'; // ADDED: Dollars icon path
            } else if (reward.type === 'euros') {
                itemText = `${reward.amount.toLocaleString()} Euros (€)`;
                dataAttr = `data-item="euros"`;
                rewardEuros = reward.amount;
                iconPath = 'images/icon-euros.png'; // ADDED: Euros icon path
            } else if (reward.type === 'item') {
                itemText = reward.name;
                dataAttr = `data-item="item"`;
                // You may want to use a specific icon for common items, or a generic one
                iconPath = 'images/icon-item.png'; // ADDED: Generic item icon path
            }
            // Rep rewards are explicitly ignored
            
            // MODIFIED: Return statement now includes an <img> for the icon and a <span> for the text
            const iconHTML = iconPath ? `<img src="${iconPath}" alt="${reward.type} icon" class="reward-icon">` : '';
            return `<li ${dataAttr}>${iconHTML}<span class="reward-text">${itemText}</span></li>`;

        }).join('');

        // Determine requirement summary text for the collapsed view
        let collapsedReqText = 'LL: N/A | Task Required: None';
        const llReq = task.requirements.find(r => r.startsWith('LL'));
        
        // Find the task dependency (by checking if the requirement is a task ID)
        const taskReq = task.requirements.find(r => 
            r !== 'None' && 
            !r.startsWith('LL') && 
            !/^\d+ .*/.test(r) && // Ignore item requirements like "1 Toolset"
            TASKS_DATA.some(t => t.id === r)
        );
        
        if (llReq) {
            collapsedReqText = `LL: ${llReq.replace('LL', '')}`;
            if (taskReq) {
                const requiredTask = TASKS_DATA.find(t => t.id === taskReq);
                const taskName = requiredTask ? requiredTask.title : taskReq;
                collapsedReqText += ` | Task Required: ${taskName}`;
            } else {
                collapsedReqText += ` | Task Required: None`;
            }
        } else if (taskReq) {
            const requiredTask = TASKS_DATA.find(t => t.id === taskReq);
            const taskName = requiredTask ? requiredTask.title : taskReq;
            collapsedReqText = `LL: N/A | Task Required: ${taskName}`;
        }
        
        // Set Data Attributes
        card.setAttribute('data-task-id', task.id);
        card.setAttribute('data-trader', task.trader);
        card.setAttribute('data-map', task.map); 
        card.setAttribute('data-dialogue-initial', task.dialogueInitial);
        card.setAttribute('data-dialogue-complete', task.dialogueComplete);
        card.setAttribute('data-objective-list', task.objectives.join(';'));
        card.setAttribute('data-task-requirements', task.requirements.join(';'));
        
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
                    
                    <h4 class="requirements-heading">Requirements:</h4>
                    <div class="task-requirements-list"></div>

                    <h4 class="objectives-heading">Objectives:</h4>
                    <div class="objective-checklist"></div>

                    <h4 class="rewards-heading">Rewards:</h4>
                    <ul class="rewards-list">
                        ${rewardsHTML}
                    </ul>
                    <button class="task-toggle-btn complete-btn" 
                            data-reward-roubles="${rewardRoubles}" 
                            data-reward-dollars="${rewardDollars}"
                            data-reward-euros="${rewardEuros}">
                        Mark as Complete
                    </button>
                </div>
            </div>
        `;
        
        tasksSection.appendChild(card);
    });
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
    
    // Buttons and Task Clicks (on dynamically created elements)
    document.querySelectorAll('.task-toggle-btn').forEach(button => {
        button.addEventListener('click', handleTaskToggle);
    });
    document.querySelectorAll('.quick-slot-btn').forEach(button => {
        button.addEventListener('click', handleQuickSlotToggle);
    });
    
    // Expand/Collapse Listener (Re-attaching to new cards)
    document.querySelectorAll('.task-card.expandable').forEach(card => {
        card.addEventListener('click', (event) => {
            if (event.target.classList.contains('task-toggle-btn') || 
                event.target.closest('.task-toggle-btn') || 
                event.target.closest('.quick-slot-btn') || 
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

// --- 4. REQUIREMENTS CHECK AND GENERATION ---

/**
 * Checks all prerequisites for a task and updates the requirements list display.
 * @param {HTMLElement} taskCard - The task card element.
 * @returns {boolean} True if ALL task/LL requirements are met, false otherwise.
 */
function checkRequirementsAndGenerateList(taskCard) {
    const requirementsAttribute = taskCard.getAttribute('data-task-requirements');
    const requirementsContainer = taskCard.querySelector('.task-requirements-list');
    
    if (!requirementsContainer) return true; 

    requirementsContainer.innerHTML = ''; 
    let allUnlockRequirementsMet = true; // Only checks LL and Task dependencies
    const traderName = taskCard.getAttribute('data-trader');

    if (requirementsAttribute === 'None' || !requirementsAttribute) {
        requirementsContainer.innerHTML = '<div class="requirement-item met">No prerequisites.</div>';
        return true;
    }

    const requirements = requirementsAttribute.split(';');

    requirements.forEach(req => {
        const reqText = req.trim();
        let isMet = true;
        let displayReqText = reqText;
        let statusClass = 'met';
        
        // Item requirement check (e.g., "1 Toolset") - these do NOT lock the task
        const isItemRequirement = /^\d+ .*/.test(reqText); 
        
        if (isItemRequirement) {
            // Item Handover Requirement
            displayReqText = `Hand over: ${reqText}`;
            statusClass = 'item-handover';
            isMet = true; 

        } else if (reqText.startsWith('LL')) {
            // Loyalty Level Requirement: 'LL1', 'LL2', etc.
            const requiredLL = reqText.replace('LL', '');
            isMet = traderLL[traderName] && traderLL[traderName][requiredLL] === true;
            displayReqText = `${traderName} LL${requiredLL}`;

            if (!isMet) {
                allUnlockRequirementsMet = false;
                statusClass = 'unmet';
            } else {
                statusClass = 'met';
            }

        } else {
            // Task Dependency: Uses the task title/ID
            const requiredTask = TASKS_DATA.find(t => t.id === reqText); 
            if (requiredTask) {
                isMet = completedTasks[requiredTask.id] === true;
                displayReqText = `Complete: ${requiredTask.title}`;
                
                if (!isMet) {
                    allUnlockRequirementsMet = false;
                    statusClass = 'unmet';
                } else {
                    statusClass = 'met';
                }
            } else if (reqText !== 'None' && reqText.length > 0) {
                 // Unknown/general text, display as unmet
                displayReqText = reqText;
                statusClass = 'unmet';
                allUnlockRequirementsMet = false;
            }
        }

        const requirementItem = document.createElement('div');
        requirementItem.classList.add('requirement-item', statusClass);
        if (isItemRequirement) {
             requirementItem.classList.add('item-handover');
        }
        requirementItem.textContent = displayReqText;
        requirementsContainer.appendChild(requirementItem);
    });
    
    return allUnlockRequirementsMet;
}


// --- 5. CHECKLIST GENERATION AND MANAGEMENT ---
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
    
    completedObjectives[taskId][index] = checkbox.checked;
    
    const allCheckboxes = taskCard.querySelectorAll('.objective-checklist input[type="checkbox"]');
    let allCompleted = true;
    allCheckboxes.forEach(cb => {
        if (!cb.checked) {
            allCompleted = false;
        }
    });

    if (allCompleted) {
        completedTasks[taskId] = true;
    } else {
        completedTasks[taskId] = false;
    }

    updateTaskStatus(taskCard); 
    saveProgress();
}


// --- 6. FILTERING AND SEARCHING LOGIC ---
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

// --- 7. TASK STATUS MANAGEMENT ---

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
    
    // 2. Manage Visual Status
    if (!isUnlocked) {
        taskCard.classList.add('task-locked'); 
        toggleButton.style.display = 'none'; 
    } else {
        taskCard.classList.remove('task-locked');
        toggleButton.style.display = 'block'; 
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

    // 6. UPDATE COLLAPSED REWARD SUMMARY (Includes new currencies)
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


// Load progress when the page first loads
loadProgress();
