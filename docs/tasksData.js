const TASKS_DATA = [
    // --------------------------------------------------------------------------------------------------
    // CORE STARTER QUEST
    // --------------------------------------------------------------------------------------------------
    {
        id: "Target Practice",
        trader: "Prapor",
        title: "Target Practice",
        objectiveSummary: "Eliminate 10 Scavs and Sell 5 Scav weapons to Prapor.",
        map: "Any",
        requirements: ["N/A"],
        dialogueInitial: "Listen up, my friend. We need to remind the local Scavs who runs this corner of the woods. They're getting too comfortable, too careless. I've got a little job for you—a simple exercise, really. Go out there and eliminate ten of those rats. And while you're at it, bring back some of their junk rifles. I need parts, and they make for good scrap. Sell me five of their Scav weapons. Let's see if you can hit the broad side of a barn, eh? Don't waste your ammo. Get it done, and I'll make it worth your while.",
        dialogueComplete: "Ah, there are you. Good work, you got the job done. Ten less lowlifes cluttering the streets, and you even managed to bring back a few busted guns. Good. You're not completely useless after all. Here's your payment, don't spend it all in one place, or, actually, do—just buy more ammo! These bolts will come in handy for some... repairs. Now, get lost. I have real work to do.",
        objectives: [
            "Eliminate 10 Scavs",
            "Sell 5 Scav weapons to Prapor"
        ],
        rewards: [
            { type: "roubles", amount: 5000 },
            { type: "item", name: "2 Bolts", icon: "icon-bolts.png" },
            { type: "item", name: "1 Weapon Parts", icon: "icon-weapon-parts.png" }
        ]
    },
    
    // --------------------------------------------------------------------------------------------------
    // BRANCH A STARTER: PRAPOR'S INVENTORY (Leads to Emergency Repairs)
    // --------------------------------------------------------------------------------------------------
    {
        id: "Prapors Inventory",
        trader: "Prapor",
        title: "Prapor's Inventory",
        objectiveSummary: "Hand over 2 found in-raid Matches.",
        map: "Any",
        requirements: ["Target Practice"],
        dialogueInitial: "I'm running a small, unauthorized side project and I need two small things for it: matches. Doesn't matter why, just that they need to be fresh—Found In Raid. It's a simple test to see if you can grab something small but necessary without drawing attention. Bring me two boxes and you're good to go.",
        dialogueComplete: "Perfect. Just what I needed. You're efficient. Small jobs lead to big jobs, remember that. Here's a little something for your quick service.",
        objectives: [
            "Hand over 2 found in-raid Matches"
        ],
        rewards: [
            { type: "roubles", amount: 4000 },
            { type: "item", name: "1 30-round 5.45x39 magazine", icon: "icon-ak-mag.png" },
            { type: "item", name: "1 Roll of Duct Tape", icon: "icon-duct-tape.png" }
        ]
    },
    // --------------------------------------------------------------------------------------------------
    // BRANCH B STARTER: THERAPIST'S DELIVERY (Leads to Trauma Care)
    // --------------------------------------------------------------------------------------------------
    {
        id: "First Aid Supplies",
        trader: "Therapist",
        title: "First Aid Supplies",
        objectiveSummary: "Deliver 2 Salewa first aid kits to Emercom Checkpoint on Ground Zero.",
        map: "Ground Zero",
        requirements: ["Target Practice"],
        initial_equipment: [
            { name: "2 Salewa first aid kits", icon: "icon-sfak.png" }
        ],
        dialogueInitial: "I am running low on certain field supplies, and supply lines are disrupted. I need two Salewa First Aid Kits. This is a simple retrieval and handover operation. I will provide the initial equipment. Bring them back to me in one piece, and I'll ensure you're compensated fairly. Do not fail this delivery, it is critical.",
        dialogueComplete: "The Salewas arrived just in time. Excellent work. Your reliability is noted, and I can assure you that this small favor will be remembered. This is your payment, use it wisely.",
        objectives: [
            "Deliver 2 Salewa first aid kits to Emercom Checkpoint (Ground Zero)"
        ],
        rewards: [
            { type: "roubles", amount: 3500 },
            { type: "item", name: "2 Car first aid kits", icon: "icon-cfak.png" },
            { type: "item", name: "2 Army Bandages", icon: "icon-army-bandage.png" }
        ]
    },
    // --------------------------------------------------------------------------------------------------
    // BRANCH C STARTER: SKIER'S COVERT JOB (Leads to Flash Drive)
    // --------------------------------------------------------------------------------------------------
    {
        id: "Signal Interference",
        trader: "Skier",
        title: "Signal Interference",
        objectiveSummary: "Plant 1 Signal Jammer on the Customs watchtower.",
        map: "Customs",
        requirements: ["Target Practice"],
        initial_equipment: [
            { name: "1 Signal Jammer", icon: "icon-jammer.png" }
        ],
        dialogueInitial: "I need to blind some eyes watching the Customs area, specifically near the central watchtower. My competition is getting nosy. I'm giving you a signal jammer. Take it to the top of that tower and plant it. This is delicate work—I don't want a scene. Get in, plant it, and get out. You breathe a word of this, and your face is next on the target list.",
        dialogueComplete: "Static confirmed. My competitors are running around blind now. Good work. That's how you make money in this town: keeping secrets and creating confusion. Here are some parts for your next job.",
        objectives: [
            "Plant 1 Signal Jammer on the Customs watchtower",
            "Survive and Extract from the location"
        ],
        rewards: [
            { type: "roubles", amount: 5500 },
            { type: "item", name: "2 Capacitors", icon: "icon-capacitor.png" },
            // RENAMED icon-insulating-tape.png to icon-tape.png
            { type: "item", name: "1 Insulating Tape", icon: "icon-tape.png" } 
        ]
    },
    
    // --------------------------------------------------------------------------------------------------
    // MID-GAME BRANCH QUESTS (LL1)
    // --------------------------------------------------------------------------------------------------
    {
        id: "Emergency Repairs",
        trader: "Prapor",
        title: "Emergency Repairs",
        objectiveSummary: "Repair 2 generators on Factory and hand over 2 Toolsets.",
        map: "Factory",
        requirements: ["Prapors Inventory", "I:Toolset:2"], 
        dialogueInitial: "Listen, I've got a problem over on Factory. Not my problem, mind you, but I need it fixed. Those stupid generators near the med tent are offline, and I had some... equipment running off that grid. It's a simple job: you need to go there and get two of those things repaired. I don't care if you have to slap them with a wrench or yell at them, just make them work. It's a busy spot, I know, but you need to get used to the noise. Get in, fix the power, and get out. Don't come back without that juice flowing, or you'll be fixing my mood next.",
        dialogueComplete: "The lights are back on. Good. So you managed to survive a few minutes inside that scrap heap. You see? You're tougher than you look. Getting those things running means my contacts can get back to their operations, which means more roubles for me. And for you, I suppose. Take this cash—it's yours. And here's some scav armor; it's ugly, but it's better than nothing for your next run. Don't break it before you get home.",
        objectives: [
            "Locate and Repair Generator 1",
            "Locate and Repair Generator 2",
            "Hand over 2 found in raid Toolsets" 
        ],
        rewards: [
            { type: "roubles", amount: 10000 },
            { type: "item", name: "2 Electronic Components", icon: "icon-electronic-components.png" },
            { type: "item", name: "1 Screwdriver", icon: "icon-screwdriver.png" },
            { type: "item", name: "1 Silicon Tube", icon: "icon-silicon-tube.png" },
            { type: "item", name: "1 PACA Soft Armor", icon: "icon-paca.png" }
        ]
    },    
    {
        id: "Search for the Flash Drive",
        trader: "Skier",
        title: "Search for the Flash Drive",
        objectiveSummary: "Find the secure flash drive on Customs and hand it over.",
        map: "Customs",
        requirements: ["Signal Interference", "LL1"], 
        dialogueInitial: "I've heard some chatter about a lost data storage device on Customs—a flash drive. Could be nothing, could be everything. I want it. Look around the main construction areas, maybe the dorms. The quicker you find it, the more I'm willing to pay. This isn't for Prapor or Therapist; it's for me. Bring it back, and we can talk about a real contract.",
        dialogueComplete: "This is it. The data is clean. You've proven you have the nose for profitable secrets. This flash drive could be worth a fortune to the right people. Here's your cut. You've earned my trust, but don't get greedy. We have more work to do.",
        objectives: [
            "Find the secure flash drive",
            "Hand over the secure flash drive"
        ],
        rewards: [
            { type: "roubles", amount: 15000 },
            { type: "item", name: "1 Secure Flash Drive", icon: "icon-usb.png" },
            { type: "item", name: "1 Tri-Zip Backpack", icon: "icon-trizip.png" }
        ]
    },
    {
        id: "Sniper Spot",
        trader: "Prapor",
        title: "Sniper Spot",
        objectiveSummary: "Eliminate 5 Scavs in the Sniper Rock area on Woods.",
        map: "Woods",
        requirements: ["Emergency Repairs", "LL1"],
        dialogueInitial: "We've got some Scavs causing trouble near the center of Woods, specifically around that big rock—Sniper Rock. They're trying to set up a new trading post. Not on my watch. Go to Woods, clear five of those rats out of the area. I want that spot clear. Use a rifle, use a shotgun, I don't care. Just get it done quickly.",
        dialogueComplete: "Sniper Rock is clear. The patrols confirmed it. Good work, soldier. You took care of my little problem, so I'll take care of yours. Here are some scopes; maybe you can use that rock yourself next time.",
        objectives: [
            "Eliminate 5 Scavs in the Sniper Rock area",
            "Survive and Extract from Woods"
        ],
        rewards: [
            { type: "roubles", amount: 12000 },
            { type: "item", name: "1 Vudu 1-6x scope", icon: "icon-vudu.png" },
            { type: "item", name: "2 AK-74 60-round magazines", icon: "icon-ak-mag.png" }
        ]
    },
    {
        id: "Cleanup Crew",
        trader: "Peacekeeper",
        title: "Cleanup Crew",
        objectiveSummary: "Eliminate 5 PMCs.",
        map: "Any",
        requirements: ["Emergency Repairs"], 
        dialogueInitial: "We have extraneous assets operating in the area of operation. They are causing friction and disrupting the necessary equilibrium. Your task is a simple stabilization action: neutralize five hostile operators—PMCs. I don't care which faction they belong to, only that they cease function. Consider it a necessary sanitation protocol. Keep your gear light, minimize collateral, and bring me proof of successful completion. The sooner the sector is clean, the sooner you get paid.",
        dialogueComplete: "Confirmation received. The noise floor in the hot zones has dropped significantly since your last deployment. Efficient work. That's five fewer obstacles preventing the zone from reaching its required stability level. Here is the agreed-upon transfer: 120 USD. And take this bottle. It’s a bonus for maintaining operational security. Get some rest; the grid is never clean for long.",
        objectives: [
            "Eliminate 5 PMCs"
        ],
        rewards: [
            { type: "dollars", amount: 120 },
            { type: "item", name: "1 Bottle of Dan Jackiel whiskey", icon: "icon-whiskey.png" }
        ]
    },
    
    // --------------------------------------------------------------------------------------------------
    // HIGH-DIFFICULTY LL2 QUESTS
    // --------------------------------------------------------------------------------------------------
    {
        id: "Trauma Care",
        trader: "Therapist",
        title: "Trauma Care",
        objectiveSummary: "Hand over 2 found in-raid Grizzly First Aid Kits.",
        map: "Any",
        requirements: ["First Aid Supplies", "LL2"], 
        dialogueInitial: "The situation has become critical. I'm no longer dealing with minor wounds; I need full-scale trauma kits. Two Grizzly First Aid Kits, Found In Raid, immediately. This is an urgent life-saving measure, and I can't afford a moment's delay. The complexity of these injuries means I need the highest quality supplies. Bring them to me quickly.",
        dialogueComplete: "You saved lives today. That is more important than any currency. These Grizzly kits are exactly what I needed to stabilize the patients. Your ability to deliver high-value, critical supplies under pressure is noted. Take this reward; it includes a place to safely store your own medical gear.",
        objectives: [
            "Hand over 2 found in-raid Grizzly First Aid Kits"
        ],
        rewards: [
            { type: "roubles", amount: 25000 },
            // RENAMED icon-meds-case.png to icon-medicine-case.png
            { type: "item", name: "1 Meds Case", icon: "icon-medicine-case.png" } 
        ]
    },
    {
        id: "Armored Car Delivery",
        trader: "Peacekeeper",
        title: "Armored Car Delivery",
        objectiveSummary: "Find and Mark the BTR Armored Vehicle on Shoreline and eliminate 5 Scavs while wearing a specific helmet.",
        map: "Shoreline",
        requirements: ["Cleanup Crew", "LL2"], 
        dialogueInitial: "My contractors need to know the status of a decommissioned Armored Personnel Carrier (BTR) that was abandoned on Shoreline. It's a simple recon: find it and place a tracking marker on it. But I also need a demonstration of your commitment to professional security. Eliminate five Scavs while wearing an approved helmet. I don't care how ugly it is, just that you wear it. Don't fail the recon or the security demonstration.",
        dialogueComplete: "Tracking data received. The BTR is where we expected it, and your security protocol was confirmed. You're beginning to move like a proper contractor. This reward is for your discretion and execution. This ZSH-1 helmet is yours. Keep moving.",
        objectives: [
            "Find and Mark the BTR Armored Vehicle",
            "Eliminate 5 Scavs while wearing the ZSH-1-2M Helmet",
            "Survive and Extract from Shoreline"
        ],
        rewards: [
            { type: "dollars", amount: 200 },
            { type: "item", name: "1 ZSH-1-2M Helmet (Black)", icon: "icon-zsh1.png" },
            { type: "item", name: "1 Military circuit board", icon: "icon-mcb.png" }
        ]
    }
];
