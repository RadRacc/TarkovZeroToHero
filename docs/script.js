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
    quickSlottedTasks = JSON.parse(localStorage.getItem(QUICK_SLOT_KEY) || '{}');
    
    // Initialize all 7 traders in the default data structure 
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

    renderTaskCards();
    updateAllTaskStatuses();
    sortTasks();
}

function saveProgress() {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    localStorage.setItem(COMPLETED_OBJECTIVES_KEY, JSON.stringify(completedObjectives));
    localStorage.setItem(TRADER_LL_KEY, JSON.stringify(traderLL));
    localStorage.setItem(QUICK_SLOT_KEY, JSON.stringify(quickSlottedTasks));
}

// --- 3. DYNAMIC CARD GENERATION ---

/**
 * Renders all task cards based on TASKS_DATA.
 */
function renderTaskCards() {
    tasksSection.innerHTML = '<h2>Task Progression</h2>';
    
    TASKS_DATA.forEach(task => {
        const isCompleted = completedTasks[task.id];
        const isSlotted = quickSlottedTasks[task.id];

        // 1. Build Requirements List
        const requirementsListHTML = task.requirements.map(req => {
            // Check if requirement is an item (contains a number and a space, e.g., "1 Toolset")
            const isItemRequirement = /^\d+ .*/.test(req) && !req.startsWith('LL');
            const reqClass = isItemRequirement ? 'item-requirement' : '';
            return `<p class="${reqClass}">${req}</p>`;
        }).join('');

        // 2. Build Objectives List
        const objectiveChecklistHTML = task.objectives.map((obj, index) => {
            const objectiveId = `${task.id}-obj-${index}`;
            const isChecked = completedObjectives[task.id] && completedObjectives[task.id][objectiveId] ? 'checked' : '';
            return `<label class="objective-item" data-objective-id="${objectiveId}">
                        <input type="checkbox" ${isChecked}> ${obj}
                    </label>`;
        }).join('');

        // 3. Build Rewards List and calculate currency data attributes
        let rewardsHTML = '';
        let rewardRoubles = 0;
        let rewardDollars = 0;
        let rewardEuros = 0;

        task.rewards.forEach(reward => {
            if (reward.type === 'roubles') {
                rewardsHTML += `<li data-item="roubles">${reward.amount.toLocaleString()} Roubles</li>`;
                rewardRoubles = reward.amount;
            } else if (reward.type === 'dollars') {
                rewardsHTML += `<li data-item="dollars">${reward.amount.toLocaleString()} Dollars</li>`;
                rewardDollars = reward.amount;
            } else if (reward.type === 'euros') {
                rewardsHTML += `<li data-item="euros">${reward.amount.toLocaleString()} Euros</li>`;
                rewardEuros = reward.amount;
            } else if (reward.type === 'item') {
                rewardsHTML += `<li data-item="item">${reward.name}</li>`;
            }
            // Rep rewards are explicitly ignored
        });

        const taskCardHTML = `
            <div class="task-card expandable ${isCompleted ? 'completed' : ''} ${isSlotted ? 'task-quick-slotted' : ''}" 
                 data-trader="${task.trader}" 
                 data-task-id="${task.id}" 
                 data-map="${task.map}">
                
                <div class="collapsed-view">
                    <div class="header-status">
                        <h3 class="task-title">${task.title}</h3>
                        <p class="task-status-text">Status: ${isCompleted ? 'Complete' : 'In Progress'}</p>
                    </div>
                    <div class="collapsed-requirements">
                        <p>${task.objectiveSummary}</p>
                    </div>
                    <button class="quick-slot-btn ${isSlotted ? 'slotted' : ''}" aria-label="Quick Slot Task">★</button>
                </div>
                
                <div class="expanded-view hidden-detail">
                    <div class="trader-image-box" data-trader-id="${task.trader}">
                        ${task.trader.charAt(0)}
                    </div>
                    <div>
                        <div class="dialogue-box">
                            <h4>Dialogue (${task.trader})</h4>
                            <p class="dialogue-text">${task.dialogueInitial}</p>
                        </div>
                        
                        <h4 class="requirements-heading">Requirements (Required for unlock):</h4>
                        <div class="task-requirements-list">
                            ${requirementsListHTML || '<p>None</p>'}
                        </div>

                        <h4 class="objectives-heading">Objectives:</h4>
                        <div class="objective-checklist">
                            ${objectiveChecklistHTML}
                        </div>

                        <h4 class="rewards-heading">Rewards:</h4>
                        <ul class="rewards-list">
                            ${rewardsHTML}
                        </ul>
                        
                        <button class="task-toggle-btn ${isCompleted ? 'uncomplete-btn' : 'complete-btn'}" 
                                data-reward-roubles="${rewardRoubles}" 
                                data-reward-dollars="${rewardDollars}"
                                data-reward-euros="${rewardEuros}"
                                data-task-id="${task.id}">
                            Mark as ${isCompleted ? 'Uncomplete' : 'Complete'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        tasksSection.insertAdjacentHTML('beforeend', taskCardHTML);
    });

    // Re-select all cards after generation and attach listeners
    expandableCards = document.querySelectorAll('.task-card.expandable');
    attachEventListeners();
}

// --- 4. ATTACH LISTENERS ---

function attachEventListeners() {
    // Re-attach to dynamically generated elements
    document.querySelectorAll('.task-toggle-btn').forEach(button => {
        button.removeEventListener('click', handleTaskToggle); // Prevent duplicate listeners
        button.addEventListener('click', handleTaskToggle);
    });

    document.querySelectorAll('.objective-checklist input[type="checkbox"]').forEach(checkbox => {
        checkbox.removeEventListener('change', handleObjectiveToggle);
        checkbox.addEventListener('change', handleObjectiveToggle);
    });

    document.querySelectorAll('.quick-slot-btn').forEach(button => {
        button.removeEventListener('click', handleQuickSlotToggle);
        button.addEventListener('click', handleQuickSlotToggle);
    });

    expandableCards.forEach(card => {
        card.removeEventListener('click', handleCardExpansion);
        card.addEventListener('click', handleCardExpansion);
    });
}

function handleCardExpansion(event) {
    // Don't toggle expansion if clicking on an interactive element inside
    if (event.target.closest('.task-toggle-btn') || event.target.type === 'checkbox' || event.target.closest('.quick-slot-btn')) {
        return;
    }

    const expandedView = event.currentTarget.querySelector('.expanded-view');
    if (expandedView) {
        const isHidden = window.getComputedStyle(expandedView).display === 'none';
        expandedView.style.display = isHidden ? 'grid' : 'none'; 
    }
}


// --- 5. FILTERING AND SORTING LOGIC ---

function filterTasks() {
    const selectedTrader = traderFilter.value;
    const selectedMap = mapFilter.value;
    const searchText = taskSearch.value.toLowerCase();

    expandableCards.forEach(card => {
        const trader = card.dataset.trader;
        const map = card.dataset.map;
        const title = card.querySelector('.task-title').textContent.toLowerCase();
        const summary = card.querySelector('.collapsed-requirements p').textContent.toLowerCase();

        const traderMatch = selectedTrader === 'all' || trader === selectedTrader;
        const mapMatch = selectedMap === 'all' || map === selectedMap;
        const searchMatch = title.includes(searchText) || summary.includes(searchText);

        if (traderMatch && mapMatch && searchMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

traderFilter.addEventListener('change', filterTasks);
mapFilter.addEventListener('change', filterTasks);
taskSearch.addEventListener('input', filterTasks);

function sortTasks() {
    const taskList = tasksSection;
    const allCards = document.querySelectorAll('.task-card.expandable'); 
    
    const sortedCards = Array.from(allCards).sort((a, b) => {
        const aIsSlotted = a.classList.contains('task-quick-slotted');
        const bIsSlotted = b.classList.contains('task-quick-slotted');
        
        if (aIsSlotted && !bIsSlotted) return -1; 
        if (!aIsSlotted && bIsSlotted) return 1;
        
        // Secondary sort: Incomplete before Complete
        const aIsCompleted = a.classList.contains('completed');
        const bIsCompleted = b.classList.contains('completed');

        if (!aIsCompleted && bIsCompleted) return -1;
        if (aIsCompleted && !bIsCompleted) return 1;

        // Tertiary sort: by Title
        const aTitle = a.querySelector('.task-title').textContent;
        const bTitle = b.querySelector('.task-title').textContent;
        return aTitle.localeCompare(bTitle);
    });

    // Re-append sorted cards
    sortedCards.forEach(card => taskList.appendChild(card));
}

// --- 6. OBJECTIVE, QUICK SLOTS, AND TASK STATUS LOGIC ---

function handleObjectiveToggle(event) {
    const taskCard = event.target.closest('.task-card');
    const taskId = taskCard.dataset.taskId;
    const objectiveId = event.target.closest('.objective-item').dataset.objectiveId;

    if (!completedObjectives[taskId]) {
        completedObjectives[taskId] = {};
    }
    
    completedObjectives[taskId][objectiveId] = event.target.checked;
    
    saveProgress();
    event.stopPropagation();
}

function handleTaskToggle(event) {
    const button = event.target;
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.dataset.taskId;
    
    // Check if task is already complete
    const isCompletedBeforeToggle = taskCard.classList.contains('completed');
    
    // Toggle completion status
    const isCompleted = !isCompletedBeforeToggle;
    completedTasks[taskId] = isCompleted;

    // Get the total number of objectives for this task
    const objectiveCount = taskCard.querySelectorAll('.objective-item').length;

    if (!completedObjectives[taskId]) {
        completedObjectives[taskId] = {};
    }

    if (!isCompleted && objectiveCount > 0) {
        // If uncompleting task, uncheck all objectives
        for (let i = 0; i < objectiveCount; i++) {
            completedObjectives[taskId][`${taskId}-obj-${i}`] = false;
        }
    } else if (isCompleted && objectiveCount > 0) {
        // If completing task, check all objectives
        for (let i = 0; i < objectiveCount; i++) {
            completedObjectives[taskId][`${taskId}-obj-${i}`] = true;
        }
    }

    // Since objectives were changed, we must update the checkboxes visually
    taskCard.querySelectorAll('.objective-checklist input[type="checkbox"]').forEach((checkbox, index) => {
        checkbox.checked = completedObjectives[taskId][`${taskId}-obj-${index}`];
    });

    updateTaskStatus(taskCard);
    saveProgress();
    
    // Re-evaluate dependencies of ALL tasks
    updateAllTaskStatuses(); 
    
    event.stopPropagation(); 
}

function handleQuickSlotToggle(event) {
    const button = event.target.closest('.quick-slot-btn');
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    
    quickSlottedTasks[taskId] = !quickSlottedTasks[taskId];
    if (!quickSlottedTasks[taskId]) {
        delete quickSlottedTasks[taskId]; 
    }

    // Update UI and save
    updateTaskStatus(taskCard);
    button.classList.toggle('slotted', quickSlottedTasks[taskId]);
    taskCard.classList.toggle('task-quick-slotted', quickSlottedTasks[taskId]);

    saveProgress();
    sortTasks(); 
    
    event.stopPropagation(); 
}

/**
 * Updates the visual status of a task card and its collapsed summary.
 * @param {HTMLElement} taskCard - The HTML element of the task card.
 */
function updateTaskStatus(taskCard) {
    const taskId = taskCard.dataset.taskId;
    const isCompleted = completedTasks[taskId] || false;
    
    const statusText = taskCard.querySelector('.task-status-text');
    const toggleButton = taskCard.querySelector('.task-toggle-btn');
    const collapsedRequirements = taskCard.querySelector('.collapsed-requirements');

    // Update Text and Button Style
    taskCard.classList.toggle('completed', isCompleted);
    statusText.textContent = `Status: ${isCompleted ? 'Complete' : 'In Progress'}`;
    toggleButton.textContent = `Mark as ${isCompleted ? 'Uncomplete' : 'Complete'}`;
    toggleButton.classList.toggle('complete-btn', !isCompleted);
    toggleButton.classList.toggle('uncomplete-btn', isCompleted);


    // --- Currency/Reward Summary Update (Collapsed View) ---
    // Fetch reward data from the button's data attributes
    const roubles = parseInt(toggleButton.dataset.rewardRoubles || 0);
    const dollars = parseInt(toggleButton.dataset.rewardDollars || 0);
    const euros = parseInt(toggleButton.dataset.rewardEuros || 0);

    let summaryContent = '';
    
    // Helper to format currency
    const formatCurrency = (amount, symbol, currencyClass) => {
        if (amount === 0) return '';
        const sign = amount > 0 ? '+' : '';
        const absAmount = Math.abs(amount).toLocaleString();
        return `<span class="currency ${currencyClass}">${sign}${absAmount} ${symbol}</span>`;
    };

    // Use the new currencies here, removing all REP logic
    const rblText = formatCurrency(roubles, '₽', 'rouble-reward');
    const usdText = formatCurrency(dollars, '$', 'dollar-reward');
    const eurText = formatCurrency(euros, '€', 'euro-reward');

    // Build the reward line for the collapsed view
    const currencyParts = [rblText, usdText, eurText].filter(Boolean);
    
    if (currencyParts.length > 0) {
        summaryContent += `<p class="reward-summary">💰 Rewards: ${currencyParts.join(', ')}</p>`;
    } else {
        // Fallback to objectives summary if no currency rewards are present
        const taskData = TASKS_DATA.find(t => t.id === taskId);
        if (taskData) {
            summaryContent = `<p>${taskData.objectiveSummary}</p>`;
        } else {
            summaryContent = `<p>Click to view details...</p>`;
        }
    }
    
    collapsedRequirements.innerHTML = summaryContent;
}

/**
 * Re-runs status update for all cards to check for dependencies and update the UI.
 * NOTE: Dependency checking logic for task locking is intentionally simplified here.
 */
function updateAllTaskStatuses() {
    expandableCards.forEach(updateTaskStatus);
    // In a full application, dependency checks (e.g., checking if 'Target Practice' is completed
    // to unlock 'Emergency Repairs') would occur here and update a 'task-locked' class.
}


// --- 7. LOYALTY LEVEL (LL) TRACKER LOGIC ---
llCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
        const trader = event.target.closest('.trader-ll-group').dataset.trader;
        const ll = event.target.dataset.ll;
        
        if (traderLL[trader]) {
            traderLL[trader][ll] = event.target.checked;
        }
        
        saveProgress();
        updateAllTaskStatuses();
    });
});


// Load progress when the page first loads
loadProgress();
