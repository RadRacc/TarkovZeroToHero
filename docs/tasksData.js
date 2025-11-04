const TASKS_DATA = [
    {
        id: "Target Practice",
        trader: "Prapor",
        title: "Target Practice",
        objectiveSummary: "Eliminate 10 Scavs and Sell 5 Scav weapons to Prapor.",
        map: "Any",
        requirements: ["N/A"],
        initial_equipment: [],
        walkthrough: "Find 10 Scavs on any map and eliminate them. Any Scav gun will work for the handover; sell five to Prapor through the trade-in menu.",
        dialogueInitial: "Listen up, my friend. We need to remind the local Scavs who runs this corner of the woods. They're getting too comfortable, too careless. I've got a little job for you—a simple exercise, really. Go out there and eliminate ten of those rats. And while you're at it, bring back some of their junk rifles. I need parts, and they make for good scrap. Sell me five of their Scav weapons. Let's see if you can hit the broad side of a barn, eh? Don't waste your ammo. Get it done, and I'll make it worth your while.",
        dialogueComplete: "Ah, there you are. Good work, you got the job done. Ten less lowlifes cluttering the streets, and you even managed to bring back a few busted guns. Good. You're not completely useless after all. Here's your payment, don't spend it all in one place, or, actually, do—just buy more ammo! These bolts will come in handy for some... repairs. Now, get lost. I have real work to do.",
        objectives: [
            "Eliminate 10 Scavs",
            "Sell 5 Scav weapons to Prapor"
        ],
        rewards: [
            { type: "roubles", amount: 6000 },
            { type: "item", name: "2 Bolts", icon: "icon-bolts.png" },
            { type: "item", name: "1 Weapon Parts", icon: "icon-weapon-parts.png" },
            { type: "item", name: "1 Emergency water ration", icon: "icon-emr.png" }
        ]
    },
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
        walkthrough: "The Salewas are given to you at the start. To complete the task, you only need to survive the raid after delivering them to Emercom Checkpoint on Ground Zero.",
        dialogueInitial: "I am running low on certain field supplies, and supply lines are disrupted. I need two Salewa First Aid Kits. This is a simple retrieval and handover operation. I will provide the initial equipment. Bring them back to me in one piece, and I'll ensure you're compensated fairly. Do not fail this delivery, it is critical.",
        dialogueComplete: "The Salewas arrived just in time. Excellent work. Your reliability is noted, and I can assure you that this small favor will be remembered. This is your payment, use it wisely.",
        objectives: [
            "Deliver 2 Salewa first aid kits to Emercom Checkpoint (Ground Zero)"
        ],
        rewards: [
            { type: "roubles", amount: 4000 },
            { type: "item", name: "2 AI-2 medkits", icon: "icon-ai2.png" },
            { type: "item", name: "1 Aseptic bandage", icon: "icon-aseptic-bandage.png" },
            { type: "item", name: "1 Esmarch tourniquet", icon: "icon-esmarch.png" }
        ]
    },
    {
        id: "Emergency Repairs",
        trader: "Prapor",
        title: "Emergency Repairs",
        objectiveSummary: "Repair 2 generators on Factory located at Medical Tent.",
        map: "Factory",
        requirements: ["Target Practice"],
        initial_equipment: [],
        walkthrough: "The first generator can be located inside the Medical Tent in the right corner. The second is just outside to the left next to a pillar.",
        dialogueInitial: "Listen, I've got a problem over on Factory. Not my problem, mind you, but I need it fixed. Those stupid generators near the med tent are offline, and I had some... equipment running off that grid. It's a simple job: you need to go there and get two of those things repaired. I don't care if you have to slap them with a wrench or yell at them, just make them work. It's a busy spot, I know, but you need to get used to the noise. Get in, fix the power, and get out. Don't come back without that juice flowing, or you'll be fixing my mood next.",
        dialogueComplete: "The lights are back on. Good. So you managed to survive a few minutes inside that scrap heap. You see? You're tougher than you look. Getting those things running means my contacts can get back to their operations, which means more roubles for me. And for you, I suppose. Take this cash—it's yours. And here's some scav armor; it's ugly, but it's better than nothing for your next run. Don't break it before you get home.",
        objectives: [
            "Locate and Repair Generator 1",
            "Locate and Repair Generator 2",
            "Survive and Extract from the location"
        ],
        rewards: [
            { type: "roubles", amount: 8000 },
            { type: "item", name: "2 Electronic components", icon: "icon-electronic-components.png" },
            { type: "item", name: "1 Screwdriver", icon: "icon-screwdriver.png" },
            { type: "item", name: "1 Silicon tube", icon: "icon-silicon-tube.png" },
            { type: "item", name: "1 PACA Soft Armor", icon: "icon-paca.png" }
        ]
    },    
    {
        id: "Antibiotics - Part 1",
        trader: "Therapist",
        title: "Antibiotics - Part 1",
        objectiveSummary: "Hand over 5 found in-raid Analgin painkillers.", 
        map: "Any",
        requirements: ["Emergency Repairs", "First Aid Supplies"], 
        initial_equipment: [],
        walkthrough: "Analgin painkillers are common medical spawns. Look for them in medicine bags, ambulances, and inside medical supply crates, particularly on Shoreline and Interchange. Ensure they are Found In Raid (FIR). Once you have 5, hand them over to Therapist.", 
        dialogueInitial: "The situation is worsening. I'm seeing more infected wounds than ever before. To treat these, I need a reliable supply of basic pain management drugs, and my reserves are almost gone. I need you to find me five packs of Analgin painkillers, and they must be found in-raid. I can't risk using anything that's been tampered with. This is a simple collection job, but a vital one for the rest of my patients.",
        dialogueComplete: "Excellent, you procured them quickly. Analgin is a start, it helps ease the worst of the pain while we prepare for more complex treatments. I appreciate your discretion and promptness. Here, take these medical supplies; you'll likely need them more than I do right now. Be ready for the next phase of this operation.",
        objectives: [
            "Hand over 5 found in-raid Analgin painkillers"
        ],
        rewards: [
            { type: "roubles", amount: 5000 },
            { type: "item", name: "2 Bottles of hydrogen peroxide", icon: "icon-hydrogen-peroxide.png" },
            { type: "item", name: "1 Aseptic bandage", icon: "icon-aseptic-bandage.png" },
        ]
    },
    {
        id: "Strange Symbol - Part 1",
        trader: "Skier",
        title: "Strange Symbol - Part 1",
        objectiveSummary: "Investigate the strange markings in the bunker at Sniper Rock.",
        map: "Woods",
        requirements: ["Emergency Repairs"],
        initial_equipment: [],
        walkthrough: "The bunker is located at the base of Sniper Rock (the largest rock outcropping in the center of the map). The interaction point is inside the bunker itself. You only need to visit the location and survive the raid.",
        dialogueInitial: "Hey, listen. I got a tip about something weird out in the Woods, near the old Sniper Rock. There's a bunker entrance there, and someone—or something—has been scratching strange symbols on the walls inside. I don't care about spooky stories; I care about **information**. Get in there, look at the markings, and bring back a detailed report in your head. Prove you saw it and get out. I'll pay you well for your silence and your memory. Don't tell *anyone* you're doing this for me.",
        dialogueComplete: "So, you saw it. Good. That confirms what I was told. The symbols are... interesting. Could be nothing, could be something big. Either way, the information is mine now. You did good work, kid. Here’s your payment. Now, let’s see if you’re ready for a real task—something that actually makes me money.",
        objectives: [
            "Find the bunker",
            "Survive and Extract from the location"
        ],
        rewards: [
            { type: "roubles", amount: 5000 },
            { type: "item", name: "6 Bundles of wires", icon: "icon-wires.png" },
            { type: "item", name: "2 PC CPU", icon: "icon-cpu.png" },
            { type: "item", name: "2 Metal spare parts", icon: "icon-metal-spare-parts.png" }
        ]
    },
    {
        id: "Strange Symbol - Part 2",
        trader: "Skier",
        title: "Strange Symbol - Part 2",
        objectiveSummary: "Investigate the strange markings in the bunker behind Sniper Rock.",
        map: "Woods",
        requirements: ["Strange Symbol - Part 1"],
        initial_equipment: [],
        walkthrough: "This bunker is separate from the first one. It's located just south and slightly to the east of Sniper Rock, often referred to as the 'Old Log Camp' bunker. The markings are an interaction point found on the wall inside the bunker's main room. Visit the location and survive the raid to complete the task.",
        dialogueInitial: "The first set of symbols—they're complex. Too complex for a typical ritual, maybe. But the report I got says there’s a second set of markings, deeper in the woods, near a secondary bunker system. This one is less obvious, hidden near an old logging operation. You need to go back out there, find those new symbols, and confirm if they match the first set, or if they tell a different part of the story. Same rule as last time: eyes only. Get me the data, and get out clean.",
        dialogueComplete: "Two separate locations, two sets of symbols. Interesting. They point to something... organized. I’m starting to see a pattern, but I need a lot more components to figure it out fully. You've earned this pay—it's worth more than the dirt you walked through. Don't worry, the next step involves less walking and more profit, assuming you can keep your mouth shut.",
        objectives: [
            "Find the bunker",
            "Survive and Extract from the location"
        ],
        rewards: [
            { type: "roubles", amount: 6000 },
            { type: "item", name: "1 Golden neck chain", icon: "icon-gold-chain.png" },
            { type: "item", name: "4 Light bulb", icon: "icon-light-bulb.png" }
        ]
    },
    {
        id: "Pest Control",
        trader: "Therapist",
        title: "Pest Control",
        objectiveSummary: "Eliminate 15 Scavs on Shoreline.",
        map: "Shoreline",
        requirements: ["Strange Symbol - Part 2"],
        initial_equipment: [],
        walkthrough: "Shoreline is a large map, but Scavs are most common around the cottages, the gas station, and the pier/scav island. Focus on those areas to efficiently clear 15 targets.",
        dialogueInitial: "I need some relief around the Sanatorium area. The Scavs are becoming too numerous and they're harassing my runners who are bringing in supplies. This is not about healing; it's about making our work environment safe. Go to Shoreline and neutralize fifteen of those pests. Make sure they know they're not welcome near my jurisdiction.",
        dialogueComplete: "The reports confirm a reduction in hostile activity on Shoreline. Thank you. This small action helps keep my supply lines open and safe. Your willingness to get your hands dirty for the greater good of my work is appreciated. Use these meds to keep yourself patched up.",
        objectives: [
            "Eliminate 15 Scavs on Shoreline"
        ],
        rewards: [
            { type: "roubles", amount: 9000 },
            { type: "item", name: "1 Car first aid kit", icon: "icon-cfak.png" },
            { type: "item", name: "2 Esmarch tourniquets", icon: "icon-esmarch.png" }
        ]
    },
    {
        id: "Important Business",
        trader: "Peacekeeper",
        title: "Important Business",
        objectiveSummary: "Plant 9 F-1 hand grenades inside the 3 story dorms building on Customs.",
        map: "Customs",
        requirements: ["Emergency Repairs"],
        initial_equipment: [
            { name: "3 F-1 hand grenade", icon: "icon-f1-grenade.png" }
        ],
        walkthrough: "The three F-1 grenades are provided at the start (you'll need to source 6 more). The planting spots are specific interaction points located inside the 3-story dorms: one on the first floor, one on the second, and one on the third. The task is split into three parts, meaning you must survive the raid after planting the three required grenades on each floor.",
        dialogueInitial: "We have intelligence indicating a high concentration of unauthorized personnel operating out of the three-story dorms on Customs. This location is now flagged for necessary sanitation. Your mission is to covertly place three F-1 fragmentation devices on each of the three floors—that's nine placements in total. I'll provide a few starters, but you'll need to acquire the rest. This isn't a demolition job; it's a message. Ensure the placements are stable and then extract. Failure is not an option. Move.",
        dialogueComplete: "Excellent work, operator. Sensor data confirms the strategic assets were deployed precisely where they needed to be. The target area will experience a significant, localized 'deterrent' soon. Efficiency and silence are cornerstones of our operation, and you demonstrated both. Here is your compensation, and a little something extra for your continued efforts in stabilization. Stand by for your next deployment.",
        objectives: [
            "Plant 3 F-1 hand grenades on the first floor of the 3 story dorms",
            "Plant 3 F-1 hand grenades on the second floor of the 3 story dorms",
            "Plant 3 F-1 hand grenades on the third floor of the 3 story dorms",
            "Survive and Extract from the location"
        ],
        rewards: [
            { type: "dollars", amount: 50 },
            { type: "item", name: "2 Xenomorph sealing foam", icon: "icon-xenomorph.png" },
            { type: "item", name: "1 Gas analyzer", icon: "icon-gas-analyzer.png" } // <-- FIXED ERROR HERE
        ]
    },
    {
        id: "What's on the Inside?",
        trader: "Skier",
        title: "What's on the Inside?",
        objectiveSummary: "Hand over 3 found in-raid PC CPU and 3 Bundles of wires.",
        map: "Any",
        requirements: ["LL1", "Strange Symbol - Part 1"],
        initial_equipment: [],
        walkthrough: "CPU's and Wires are most often found in PC Blocks, which spawn in offices and tech stores across all maps. Customs (Dorms/Offices) and Interchange (Tech stores) are good bets. Both items must be Found In Raid.",
        dialogueInitial: "The information you brought back about the symbols... it wasn't free. I need to process it, and that takes computing power I don't currently have. Get me three PC CPU units and three Bundles of wires. I need them found in raid, so get moving. Don't ask what it's for. Just know that if I can decrypt this information, we both stand to gain.",
        dialogueComplete: "These components are sufficient for now. I'll have my tech guy work on the data. For your services, you get this. Come back later; once I've pieced together the real meaning of those symbols, I'll have a much more profitable job for you.",
        objectives: [
            "Hand over 3 found in-raid PC CPU",
            "Hand over 3 found in-raid Bundles of wires"
        ],
        rewards: [
            { type: "roubles", amount: 11000 },
            { type: "item", name: "40 12/70 Copper Sabot Premier HP slugs", icon: "icon-csp-slug.png" }
        ]
    },
    {
        id: "Cleanup Crew",
        trader: "Peacekeeper",
        title: "Cleanup Crew",
        objectiveSummary: "Eliminate 8 PMCs with an MP5 and hand over 8 found in-raid dogtags.",
        map: "Any",
        requirements: ["LL1", "Important Business"],
        initial_equipment: [
            { name: "3 HK MP5 9x19 submachine gun (Navy 3 Round Burst)", icon: "icon-mp5.png" }
        ],
        walkthrough: "The MP5's provided should be enough to get you started, but you'll need to acquire more. Focus on maps with high PMC density like Customs, Interchange, or Ground Zero. You must kill the PMCs with the MP5, and then find and hand over 8 dogtags (any faction, FIR).",
        dialogueInitial: "We have extraneous assets operating in the area of operation. They are causing friction and disrupting the necessary equilibrium. Your task is a simple stabilization action: neutralize eight hostile operators—PMCs. I don't care which faction they belong to, only that they cease function. Consider it a necessary sanitation protocol. Keep your gear light, minimize collateral, and bring me proof of successful completion. The sooner the sector is clean, the sooner you get paid.",
        dialogueComplete: "Confirmation received. The noise floor in the hot zones has dropped significantly since your last deployment. Efficient work. That's eight fewer obstacles preventing the zone from reaching its required stability level. Here is the agreed-upon transfer: 150 USD. And take this bottle. It’s a bonus for maintaining operational security. Get some rest; the grid is never clean for long.",
        objectives: [
            "Eliminate 8 PMCs with an MP5",
            "Hand over 8 found in-raid dogtags"
        ],
        rewards: [
            { type: "dollars", amount: 150 },
            { type: "item", name: "1 Bottle of Dan Jackiel whiskey", icon: "icon-whiskey.png" },
            { type: "item", name: "1 Military power filter", icon: "icon-mpf.png" }
        ]
    }
];
