const fs = require('fs');

const fileContent = fs.readFileSync('projects.js', 'utf8');

let projectsStr = fileContent.match(/const projects = (\[[\s\S]+\]);/)[1];
let projects = eval(projectsStr);

// Discord bots: WB Stats Bot, SquadLink Bot, SquadBot
const desiredOrder = ['WB Stats Bot', 'SquadLink Bot', 'SquadBot'];

let discordBots = projects.filter(p => p.category === 'WB Discord Bots');
let otherProjects = projects.filter(p => p.category !== 'WB Discord Bots');

discordBots.sort((a, b) => {
    let indexA = desiredOrder.indexOf(a.name);
    let indexB = desiredOrder.indexOf(b.name);
    
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    
    if (indexA !== indexB) {
        return indexA - indexB;
    }
    
    return 0; // maintain relative order for the rest
});

// Since the grouping in UI depends on order array, we should probably keep them where the first discord bot was.
// The first discord bot in org array:
const originalIndex = projects.findIndex(p => p.category === 'WB Discord Bots');

// Let's just reconstruct the full array:
// Put everything up to originalIndex, then discordBots, then the rest.
let pre = [];
let post = [];
let seenDiscord = false;
for (let p of projects) {
    if (p.category === 'WB Discord Bots') {
        seenDiscord = true;
    } else {
        if (!seenDiscord) pre.push(p);
        else post.push(p);
    }
}

const finalProjects = [...pre, ...discordBots, ...post];

const newFileContent = `const projects = ${JSON.stringify(finalProjects, null, 4).replace(/"([^"]+)":/g, '$1:')};`;

fs.writeFileSync('projects.js', newFileContent);
