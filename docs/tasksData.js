const TASKS_DATA = [
    {
        id: "task-1",
        trader: "Prapor",
        title: "Target Practice",
        objectiveSummary: "Eliminate 10 Scavs and Sell 5 Scav weapons to Prapor.",
        map: "Any",
        requirements: ["None"],
        dialogueInitial: "Listen up, my friend. We need to remind the local scavs who runs this corner of the woods...",
        dialogueComplete: "You've earned your stripes, rookie. The local scavs are finally keeping their distance. Good work. Now, get ready for the next job.",
        objectives: [
            "Eliminate 10 Scavs (0/10)",
            "Sell 5 Scav weapons to Prapor (0/5)"
        ],
        rewards: [
            { type: "roubles", amount: 5000 },
            { type: "item", name: "2 Bolts" },
            { type: "rep", trader: "Prapor", amount: 0.01 }
        ]
    },
    {
        id: "task-2",
        trader: "Prapor",
        title: "Emergency Repairs",
        objectiveSummary: "Repair 2 generators on Factory located at med tent.",
        map: "Factory",
        requirements: ["LL1", "task-1"],
        dialogueInitial: "I've got a problem over on Factory. Those stupid generators near the med tent are offline...",
        dialogueComplete: "The power's back on? Excellent. You saved me a trip and a headache. Take your reward, you've earned it.",
        objectives: [
            "Locate and Repair Generator 1",
            "Locate and Repair Generator 2"
        ],
        rewards: [
            { type: "roubles", amount: 6000 },
            { type: "item", name: "1 6B47 Helmet" },
            { type: "rep", trader: "Prapor", amount: 0.01 }
        ]
    },
    {
        id: "task-3",
        trader: "Skier",
        title: "Shakedown",
        objectiveSummary: "Hand over 3 MP-133 shotguns.",
        map: "Any",
        requirements: ["None"],
        dialogueInitial: "Look, I need you to go to Customs. Bring back three MP-133 shotguns. Don't ask questions, just do it. And hurry up.",
        dialogueComplete: "About time. These look clean. Don't talk about this job to anyone. The less people know, the better for your health, friend.",
        objectives: [
            "Hand over 3 MP-133 shotguns"
        ],
        rewards: [
            { type: "roubles", amount: 10000 },
            { type: "rep", trader: "Skier", amount: 0.01 }
        ]
    },
    {
        id: "task-4",
        trader: "Therapist",
        title: "Pain Management",
        objectiveSummary: "Hand over 2 Salewa first aid kits and 3 Painkillers.",
        map: "Any",
        requirements: ["LL1", "task-1"],
        dialogueInitial: "We are running low on vital medical supplies. You must find and deliver two Salewas and three painkiller bottles.",
        dialogueComplete: "Excellent! These will save lives, comrade. Thank you for your speedy delivery. We can continue our work now.",
        objectives: [
            "Hand over 2 Salewa first aid kits (0/2)",
            "Hand over 3 Painkillers (0/3)"
        ],
        rewards: [
            { type: "roubles", amount: 4500 },
            { type: "rep", trader: "Therapist", amount: 0.02 }
        ]
    },
    {
        id: "task-5",
        trader: "Peacekeeper",
        title: "The Western Front",
        objectiveSummary: "Eliminate 4 USEC PMCs and secure a flash drive.",
        map: "Any",
        requirements: ["LL3", "task-3"],
        dialogueInitial: "We have intel that a USEC squad is trying to block key supply routes. I need you to eliminate them and recover their intel.",
        dialogueComplete: "The operation was a success. Their intel has been secured, and the route is clear. Your continued cooperation is noted.",
        objectives: [
            "Eliminate 4 USEC PMCs (0/4)",
            "Hand over 1 Secure Flash Drive"
        ],
        rewards: [
            { type: "dollars", amount: 2000 },
            { type: "rep", trader: "Peacekeeper", amount: 0.03 }
        ]
    },
    {
        id: "task-6",
        trader: "Mechanic",
        title: "Gunsmith - Part 1",
        objectiveSummary: "Assemble a customized MP-133 shotgun.",
        map: "Any",
        requirements: ["LL2", "task-2"],
        dialogueInitial: "Hey, I need you to assemble a specific weapon for me. It's a test of your capabilities. Let me know when you have the components.",
        dialogueComplete: "Perfect. You clearly know your way around a workbench. I have more complex projects lined up for you.",
        objectives: [
            "Assemble MP-133 to specs"
        ],
        rewards: [
            { type: "roubles", amount: 15000 },
            { type: "rep", trader: "Mechanic", amount: 0.01 }
        ]
    },
    {
        id: "task-7",
        trader: "Ragman",
        title: "Salesmanship",
        objectiveSummary: "Hand over 2 6B23-1 armored vests.",
        map: "Any",
        requirements: ["LL1", "task-3"],
        dialogueInitial: "My shelves are empty, and the clients are waiting. I need basic combat equipment for the street level guys. Get me some armored vests.",
        dialogueComplete: "These are rugged. Exactly what I need to keep the wheels turning. You're good for business, and that's good for you.",
        objectives: [
            "Hand over 2 6B23-1 armored vests"
        ],
        rewards: [
            { type: "roubles", amount: 8000 },
            { type: "rep", trader: "Ragman", amount: 0.01 }
        ]
    },
    {
        id: "task-8",
        trader: "Jaeger",
        title: "Hunter's Path",
        objectiveSummary: "Eliminate 3 Scavs on Woods with a headshot.",
        map: "Woods",
        requirements: ["LL2", "task-4"],
        dialogueInitial: "Found a few traps near my camp, but they were empty. Clearly, the locals need a lesson in tracking. Bring me some proof you're better than they are.",
        dialogueComplete: "Hmm. Not bad. The marksmanship is acceptable. Return when you have more to prove.",
        objectives: [
            "Eliminate 3 Scavs on Woods with a headshot"
        ],
        rewards: [
            { type: "roubles", amount: 9000 },
            { type: "rep", trader: "Jaeger", amount: 0.02 }
        ]
    },
    {
        id: "task-9",
        trader: "Prapor",
        title: "Delivery From the Past",
        objectiveSummary: "Find the document on Factory, survive, and hand it over to Prapor.",
        map: "Factory",
        requirements: ["LL2", "task-2"],
        dialogueInitial: "I need you to go to Factory and bring back the documents I hid in the office. Don't let anyone see them.",
        dialogueComplete: "The documents are safe. You are proving to be very reliable, thank you.",
        objectives: [
            "Find the document on Factory",
            "Survive and extract from Factory",
            "Hand over the secure folder to Prapor"
        ],
        rewards: [
            { type: "roubles", amount: 12000 },
            { type: "item", name: "1 AK-74N" },
            { type: "rep", trader: "Prapor", amount: 0.03 }
        ]
    }
];
