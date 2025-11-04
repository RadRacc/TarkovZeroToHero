<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EFT Zero to Hero: Task Tracker</title>
    
    <link rel="stylesheet" href="style.css"> 
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>

    <header id="landing-bar">
        <h1 class="header-title">EFT Zero to Hero</h1>
        <nav>
            <button class="nav-btn" data-page="tasks">Tasks</button>
            <button class="nav-btn" data-page="hideout">Hideout</button>
            <button class="nav-btn" data-page="stats">Stat Tracking</button>
            <button class="nav-btn" data-page="store">Store/Taxes</button>
        </nav>
    </header>

    <div class="container">
        <div id="status-bar">
            <p>Roubles: <span id="roubles-display">0</span></p>
            <p>Licenses: <span id="licenses-display">0</span></p>
            <button id="save-btn" class="complete-btn">Save Progress</button>
        </div>
        
        <section id="tasks" class="page-content active-page">
            <h2>🎯 Phase 1: Prapor's Initial Orders</h2>

            <div class="task-card task-completed" data-task-id="task-1">
                <span class="trader-name">Prapor</span>
                <h3 class="task-title">Target Practice (Completed)</h3>
                <p class="task-description">Eliminate 10 Scavs and Sell 5 Scav weapons to Prapor.</p>
                <h4>Rewards:</h4>
                <ul class="rewards-list">
                    <li>5,000 Roubles</li>
                    <li>2 Bolts</li>
                </ul>
            </div>
            
            <div class="task-card" data-task-id="task-2">
                <span class="trader-name">Prapor</span>
                <h3 class="task-title">Emergency Repairs (Active)</h3>
                <p class="task-description">Repair 2 generators on Factory located at med tent.</p>
                <h4>Rewards:</h4>
                <ul class="rewards-list">
                    <li>6,000 Roubles</li>
                    <li>1 6B47 Helmet</li>
                </ul>
                
                <button class="complete-btn" data-reward-roubles="6000" data-reward-licenses="0">Mark as Complete</button>
            </div>
        </section>

        <section id="hideout" class="page-content hidden-page">
            <h2>🛠️ Hideout Progression</h2>
            <p>Track your Hideout module upgrades here. (Coming Soon!)</p>
        </section>

        <section id="stats" class="page-content hidden-page">
            <h2>📈 Overall Stats</h2>
            <p>Monitor your overall progress, survival rate, and other non-currency metrics. (Coming Soon!)</p>
        </section>

        <section id="store" class="page-content hidden-page">
            <h2>💰 Store & Taxes</h2>
            <p>Record your purchases, calculate your 'Flea Market Tax' (in-game or custom), and track inventory value. (Coming Soon!)</p>
            <p>Total Taxes Paid: <span id="taxes-paid-display">0</span> Roubles</p>
        </section>

    </div>

    <script src="script.js"></script>
</body>
</html>
