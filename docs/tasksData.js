const TASKS_DATA = [
    {
        id: "Target Practice",
        trader: "Prapor",
        title: "Target Practice",
        objectiveSummary: "Eliminate 10 Scavs and Sell 5 Scav weapons to Prapor.",
        map: "Any",
        requirements: ["N/A"],
        initial_equipment: [], // NEW: No initial equipment
        walkthrough: "Find 10 Scavs on any map and eliminate them. Any Scav gun will work for the handover; sell five to Prapor through the trade-in menu.", // NEW: Walkthrough
        dialogueInitial: "Listen up, my friend. We need to remind the local Scavs who runs this corner of the woods. They're getting too comfortable, too careless. I've got a little job for you—a simple exercise, really. Go out there and eliminate ten of those rats. And while you're at it, bring back some of their junk rifles. I need parts, and they make for good scrap. Sell me five of their Scav weapons. Let's see if you can hit the broad side of a barn, eh? Don't waste your ammo. Get it done, and I'll make it worth your while.",
        dialogueComplete: "Ah, there you are. Good work, you got the job done. Ten less lowlifes cluttering the streets, and you even managed to bring back a few busted guns. Good. You're not completely useless after all. Here's your payment, don't spend it all in one place, or, actually, do—just buy more ammo! These bolts will come in handy for some... repairs. Now, get lost. I have real work to do.",
        objectives: [
            "Eliminate 10 Scavs",
            "Sell 5 Scav weapons to Prapor"
        ],
        rewards: [
            { type: "roubles", amount: 5000 },
            { type: "item", name: "3 Bolts", icon: "icon-bolts.png" }
            // Trader Rep reward is removed
        ]
    },
    // --- NEW TASK: First Aid Supplies (Example of Item Delivery) ---
    {
        id: "First Aid Supplies",
        trader: "Therapist",
        title: "First Aid Supplies",
        objectiveSummary: "Deliver 2 Salewa First Aid Kits to Therapist.",
        map: "Shoreline",
        requirements: ["N/A"],
        // NEW: Initial equipment array (the items you receive to deliver)
        initial_equipment: [ 
            { name: "2 Salewa First Aid Kits", icon: "icon-salewa.png" }
        ],
        walkthrough: "The Salewas are given to you at the start. To complete the task, you only need to survive the raid (or buy them from the Flea Market/trade if you lose them) and hand them over to Therapist through the task completion menu.", // NEW: Walkthrough
        dialogueInitial: "I am running low on certain field supplies, and supply lines are disrupted. I need two Salewa First Aid Kits. This is a simple retrieval and handover operation. I will provide the initial equipment. Bring them back to me in one piece, and I'll ensure you're compensated fairly. Do not fail this delivery, it is critical.",
        dialogueComplete: "The Salewas arrived just in time. Excellent work. Your reliability is noted, and I can assure you that this small favor will be remembered. This is your payment, use it wisely.",
        objectives: [
            "Hand over 2 Salewa First Aid Kits"
        ],
        rewards: [
            { type: "roubles", amount: 15000 },
            { type: "item", name: "1 AI-2 Medkit", icon: "icon-ai2.png" }
        ]
    },
    // --- Existing Task, updated with new properties ---
    {
        id: "Cleanup Crew",
        trader: "Peacekeeper",
        title: "Cleanup Crew",
        objectiveSummary: "Eliminate 5 PMCs.",
        map: "Any",
        requirements: ["Emergency Repairs"],
        initial_equipment: [], // NEW: No initial equipment
        walkthrough: "", // NEW: No specific walkthrough
        dialogueInitial: "We have extraneous assets operating in the area of operation. They are causing friction and disrupting the necessary equilibrium. Your task is a simple stabilization action: neutralize five hostile operators—PMCs. I don't care which faction they belong to, only that they cease function. Consider it a necessary sanitation protocol. Keep your gear light, minimize collateral, and bring me proof of successful completion. The sooner the sector is clean, the sooner you get paid.",
        dialogueComplete: "Confirmation received. The noise floor in the hot zones has dropped significantly since your last deployment. Efficient work. That's five fewer obstacles preventing the zone from reaching its required stability level. Here is the agreed-upon transfer: 120 USD. And take this bottle. It’s a bonus for maintaining operational security. Get some rest; the grid is never clean for long.",
        objectives: [
            "Eliminate 5 PMCs"
        ],
        rewards: [
            { type: "dollars", amount: 120 },
            { type: "item", name: "1 Bottle of Dan Jackiel whiskey", icon: "icon-whiskey.png" }
        ]
    }
    
];
