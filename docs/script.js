// --- 1. INITIALIZATION AND DATA KEYS ---
const COMPLETED_TASKS_KEY = 'eftZthCompletedTasksMinimal';

let completedTasks = {}; 

// DOM Elements
const expandableCards = document.querySelectorAll('.task-card.expandable'); 
const traderFilter = document.getElementById('trader-filter'); // NEW
const taskSearch = document.getElementById('task-search');       // NEW

// --- 2. CORE LOGIC FUNCTIONS ---
function loadProgress() {
    completedTasks = JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEY) || '{}');
    updateAllTaskStatuses(); 
    // Apply initial filter/search (which is 'all' and empty)
    filterTasks(); 
}

function saveProgress() {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    console.log('Task status saved.'); 
}

// --- 3. FILTERING AND SEARCHING LOGIC (NEW) ---

function filterTasks() {
    const selectedTrader = traderFilter.value;
    const searchTerm = taskSearch.value.toLowerCase().trim();

    expandableCards.forEach(card => {
        const trader = card.getAttribute('data-trader');
        const title = card.querySelector('.task-title').textContent.toLowerCase();
        const objective = card.querySelector('.task-objective').textContent.toLowerCase();

        let matchesTrader = (selectedTrader === 'all' || trader === selectedTrader);
        let matchesSearch = true;

        if (searchTerm.length > 0) {
            matchesSearch = title.includes(searchTerm) || objective.includes(searchTerm);
        }

        if (matchesTrader && matchesSearch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Attach filter/search listeners
traderFilter.addEventListener('change', filterTasks);
taskSearch.addEventListener('keyup', filterTasks);


// --- 4. TASK COMPLETION / UNMARK LOGIC (UPDATED FOR DIALOGUE) ---

function updateTaskStatus(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const toggleButton = taskCard.querySelector('.task-toggle-btn');
    const dialogueTextElement = taskCard.querySelector('.dialogue-text'); // NEW

    if (!toggleButton || !dialogueTextElement) return; 

    const initialDialogue = taskCard.getAttribute('data-dialogue-initial');
    const completeDialogue = taskCard.getAttribute('data-dialogue-complete');

    if (completedTasks[taskId]) {
        // MARKED AS COMPLETE
        taskCard.classList.add('task-completed');
        toggleButton.textContent = 'Mark as Uncomplete';
        toggleButton.classList.remove('complete-btn'); 
        toggleButton.classList.add('uncomplete-btn');
        dialogueTextElement.textContent = completeDialogue; // Set completed dialogue
    } else {
        // MARKED AS INCOMPLETE
        taskCard.classList.remove('task-completed');
        toggleButton.textContent = 'Mark as Complete';
        toggleButton.classList.remove('uncomplete-btn');
        toggleButton.classList.add('complete-btn');
        dialogueTextElement.textContent = initialDialogue; // Set initial dialogue
    }
}

function updateAllTaskStatuses() {
    expandableCards.forEach(updateTaskStatus);
}

function handleTaskToggle(event) {
    const button = event.target;
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    
    // Toggle the status
    completedTasks[taskId] = !completedTasks[taskId];

    updateTaskStatus(taskCard);
    saveProgress();
    
    event.stopPropagation(); 
}

// Attach the toggle handler to all task buttons
document.querySelectorAll('.task-toggle-btn').forEach(button => {
    button.addEventListener('click', handleTaskToggle);
});


// --- 5. EXPAND/COLLAPSE TASK LOGIC ---
expandableCards.forEach(card => {
    card.addEventListener('click', (event) => {
        // Only collapse/expand if not clicking on the action button
        if (event.target.classList.contains('task-toggle-btn') || event.target.closest('.task-toggle-btn')) {
            return;
        }

        const expandedView = card.querySelector('.expanded-view');
        
        if (expandedView) {
            const isHidden = window.getComputedStyle(expandedView).display === 'none';
            expandedView.style.display = isHidden ? 'grid' : 'none'; // Changed to grid for layout
        }
    });
});

// Load progress when the page first loads
loadProgress();
