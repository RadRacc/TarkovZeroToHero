const TASKS_DATA = [
    {
        id: "Target Practice",
        trader: "Prapor",
        title: "Target Practice",
        objectiveSummary: "Eliminate 10 Scavs and Sell 5 Scav weapons to Prapor.",
        map: "Any",
        requirements: [""],
        dialogueInitial: "Listen up, my friend. We need to remind the local Scavs who runs this corner of the woods. They're getting too comfortable, too careless. I've got a little job for you—a simple exercise, really. Go out there and eliminate ten of those rats. And while you're at it, bring back some of their junk rifles. I need parts, and they make for good scrap. Sell me five of their Scav weapons. Let's see if you can hit the broad side of a barn, eh? Don't waste your ammo. Get it done, and I'll make it worth your while.",
        dialogueComplete: "Ah, there you are. Good work, you got the job done. Ten less lowlifes cluttering the streets, and you even managed to bring back a few busted guns. Good. You're not completely useless after all. Here's your payment, don't spend it all in one place, or, actually, do—just buy more ammo! These bolts will come in handy for some... repairs. Now, get lost. I have real work to do.",
        objectives: [
            "Eliminate 10 Scavs",
            "Sell 5 Scav weapons to Prapor"
        ],
        rewards: [
            { type: "roubles", amount: 5000 },
            { type: "item", name: "2 Bolts" },
            { type: "item", name: "1 Weapon Parts" }
        ]
    },
    {
        id: "Emergency Repairs",
        trader: "Prapor",
        title: "Emergency Repairs",
        objectiveSummary: "Repair 2 generators on Factory located at Medical Tent.",
        map: "Factory",
        // This task requires LL1, previous task completion, and a physical item (Toolset)
        requirements: ["Target Practice", "2 Toolset"], 
        dialogueInitial: "Listen, I've got a problem over on Factory. Not my problem, mind you, but I need it fixed. Those stupid generators near the med tent are offline, and I had some... equipment running off that grid. It's a simple job: you need to go there and get two of those things repaired. I don't care if you have to slap them with a wrench or yell at them, just make them work. It's a busy spot, I know, but you need to get used to the noise. Get in, fix the power, and get out. Don't come back without that juice flowing, or you'll be fixing my mood next.",
        dialogueComplete: "The lights are back on. Good. So you managed to survive a few minutes inside that scrap heap. You see? You're tougher than you look. Getting those things running means my contacts can get back to their operations, which means more roubles for me. And for you, I suppose. Take this cash—it's yours. And here's some scav armor; it's ugly, but it's better than nothing for your next run. Don't break it before you get home.",
        objectives: [
            "Locate and Repair Generator 1",
            "Locate and Repair Generator 2"
        ],
        rewards: [
            { type: "roubles", amount: 10000 },
            { type: "item", name: "2 Electrical Components" },
            { type: "item", name: "1 Screwdriver" },
            { type: "item", name: "1 Silicon Tube" },
            { type: "item", name: "1 PACA Soft Armor" }
            // Trader Rep reward is removed
        ]
    },
    {
        id: "Cleanup Crew",
        trader: "Peacekeeper",
        title: "Cleanup Crew",
        objectiveSummary: "Eliminate 5 PMCs.",
        map: "Any",
        // This task requires LL1, previous task completion, and a physical item (Toolset)
        requirements: ["Emergency Repairs"], 
        dialogueInitial: "We have extraneous assets operating in the area of operation. They are causing friction and disrupting the necessary equilibrium. Your task is a simple stabilization action: neutralize five hostile operators—PMCs. I don't care which faction they belong to, only that they cease function. Consider it a necessary sanitation protocol. Keep your gear light, minimize collateral, and bring me proof of successful completion. The sooner the sector is clean, the sooner you get paid.",
        dialogueComplete: "Confirmation received. The noise floor in the hot zones has dropped significantly since your last deployment. Efficient work. That's five fewer obstacles preventing the zone from reaching its required stability level. Here is the agreed-upon transfer: 120 USD. And take this bottle. It’s a bonus for maintaining operational security. Get some rest; the grid is never clean for long.",
        objectives: [
            "Eliminate 5 PMCs"
        ],
        rewards: [
            { type: "dollars", amount: 120 },
            { type: "item", name: "1 Bottle of Dan Jackiel whiskey" }
            // Trader Rep reward is removed
        ]
    },
    {
        id: "/",
        trader: "Prapor",
        title: "/",
        objectiveSummary: "/",
        map: "Any",
        // This task requires LL1, previous task completion, and a physical item (Toolset)
        requirements: ["Emergency Repairs"], 
        dialogueInitial: "We have extraneous assets operating in the area of operation. They are causing friction and disrupting the necessary equilibrium. Your task is a simple stabilization action: neutralize five hostile operators—PMCs. I don't care which faction they belong to, only that they cease function. Consider it a necessary sanitation protocol. Keep your gear light, minimize collateral, and bring me proof of successful completion. The sooner the sector is clean, the sooner you get paid.",
        dialogueComplete: "Confirmation received. The noise floor in the hot zones has dropped significantly since your last deployment. Efficient work. That's five fewer obstacles preventing the zone from reaching its required stability level. Here is the agreed-upon transfer: 120 USD. And take this bottle. It’s a bonus for maintaining operational security. Get some rest; the grid is never clean for long.",
        objectives: [
            "Eliminate 5 PMCs"
        ],
        rewards: [
            { type: "dollars", amount: 120 },
            { type: "item", name: "1 Bottle of Dan Jackiel whiskey" }
            // Trader Rep reward is removed
        ]
    }
    
];
