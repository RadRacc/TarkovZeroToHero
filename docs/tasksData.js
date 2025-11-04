const TASKS_DATA = [
    {
        id: "Target Practice",
        trader: "Prapor",
        title: "Target Practice",
        objectiveSummary: "Eliminate 10 Scavs and Sell 5 Scav weapons to Prapor.",
        map: "Any",
        // Only LL requirements or item requirements like "1 Toolset" should be here
        requirements: ["LL1"],
        dialogueInitial: "Listen up, my friend. We need to remind the local Scavs who runs this corner of the woods...",
        dialogueComplete: "Ah, there you are. Good work, you got the job done. Here's your payment, don't spend it all in one place...",
        objectives: [
            "Eliminate 10 Scavs",
            "Sell 5 Scav weapons to Prapor"
        ],
        rewards: [
            // All Rep rewards have been removed as requested.
            { type: "roubles", amount: 5000 },
            { type: "dollars", amount: 100 },
            { type: "euros", amount: 50 },
            { type: "item", name: "2 Bolts" }
        ]
    },
    {
        id: "Emergency Repairs",
        trader: "Prapor",
        title: "Emergency Repairs",
        objectiveSummary: "Repair 2 generators on Factory located at Medical Tent.",
        map: "Factory",
        // **NEW ITEM REQUIREMENT DEMONSTRATION**
        requirements: ["LL1", "Target Practice", "1 Toolset"], 
        dialogueInitial: "I've got a problem over on Factory. Those stupid generators near the med tent are offline...",
        dialogueComplete: "The power's back on? Excellent. You saved me a trip and a headache. Take your reward, you've earned it.",
        objectives: [
            "Locate and Repair Generator 1",
            "Locate and Repair Generator 2"
        ],
        rewards: [
            // All Rep rewards have been removed as requested.
            { type: "roubles", amount: 6000 },
            { type: "dollars", amount: 150 },
            { type: "euros", amount: 75 },
            { type: "item", name: "1 6B47 Helmet" }
        ]
    },
    {
        id: "The Key to Success",
        trader: "Skier",
        title: "The Key to Success",
        objectiveSummary: "Find the key in the blue van on Customs.",
        map: "Customs",
        requirements: ["LL2"],
        dialogueInitial: "Prapor thinks he's the only game in town. I need you to retrieve something important for me...",
        dialogueComplete: "Smart move coming to me first. You'll go far. Keep this quiet.",
        objectives: [
            "Find the key to the trailer"
        ],
        rewards: [
            // All Rep rewards have been removed as requested.
            { type: "roubles", amount: 12000 },
            { type: "dollars", amount: 50 },
            { type: "euros", amount: 25 },
            { type: "item", name: "Customs Key" }
        ]
    }
];
