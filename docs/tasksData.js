const TASKS_DATA = [
    {
        id: "Target Practice",
        trader: "Prapor",
        title: "Target Practice",
        objectiveSummary: "Eliminate 10 Scavs and Sell 5 Scav weapons to Prapor.",
        map: "Any",
        requirements: ["None"],
        dialogueInitial: "Listen up, my friend. We need to remind the local Scavs who runs this corner of the woods. They're getting too comfortable, too careless. I've got a little job for you—a simple exercise, really. Go out there and eliminate ten of those rats. And while you're at it, bring back some of their junk rifles. I need parts, and they make for good scrap. Sell me five of their Scav weapons. Let's see if you can hit the broad side of a barn, eh? Don't waste your ammo. Get it done, and I'll make it worth your while.",
        dialogueComplete: "Ah, there you are. Good work, you got the job done. Ten less lowlifes cluttering the streets, and you even managed to bring back a few busted guns. Good. You're not completely useless after all. Here's your payment, don't spend it all in one place, or, actually, do—just buy more ammo! These bolts will come in handy for some... repairs. Now, get lost. I have real work to do.",
        objectives: [
            "Eliminate 10 Scavs",
            "Sell 5 Scav weapons to Prapor"
        ],
        rewards: [
            { type: "roubles", amount: 5000 },
            { type: "item", name: "2 Bolts" }
        ]
    },
    {
        id: "Emergency Repairs",
        trader: "Prapor",
        title: "Emergency Repairs",
        objectiveSummary: "Repair 2 generators on Factory located at Medical Tent.",
        map: "Factory",
        requirements: ["LL1", "Target Practice", "1 Toolset"],
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
    }
