# WB Community Projects Hub

A central directory of community-made tools, APIs, stats sites, and utilities for War Brokers. This repository hosts a clean, searchable directory that honors the rich history of the War Brokers developer and contributor community.

## Project Categories

Projects in this directory are grouped into specific categories to help users find exactly what they need:

- **WB Stats Sites**: Independent sites offering player stats, leaderboards, and rankings (e.g. original stats site, POMP's ELO site, Did You Get Sniped?).
- **WB Discord Bots**: Bots designed to improve the Discord experience with game data lookups and integration (e.g. SquadBot, SquadLink Bot, WBStats).
- **WB APIs & Endpoints**: Fundamental data services and libraries for developers (e.g. WB API, SquadLink API, WB Types).
- **WB Mods**: Modifications and browser extensions extending the base game experience (e.g. WBM).
- **WB Tools & Utilities**: Miscellaneous helpful tools for data processing, localization, and analytics (e.g. WB Utilities, wbdb, Localization tracker).
- **WB Community Sites**: Knowledge bases, Wikis, timelines, and organizational profiles (e.g. WB Timeline, War Brokers Wiki, PCGamingWiki, WBP org).

## Status Options

Each project lists its operational status so users know what to expect:

- **Active**: The project is online, fully functioning, and actively used/supported.
- **Maintenance**: The project is online and functioning, but might not be receiving new feature updates.
- **Removed**: The project is no longer available online, or the repository has been deleted/archived. It is kept in the directory for historical purposes.

## Contributing: How to Add or Update a Project

We welcome pull requests from the community to keep this directory accurate and updated! If you've created a new project or noticed an issue with an existing one, here’s how you can make a Pull Request.

### 1. Fork the Repository
Click the "Fork" button at the top right of this repository to create your own copy.

### 2. Edit `projects.js`
All project data is stored in the `projects.js` file. To add a new project, insert a new JSON object into the `projects` array. 

Format:
```javascript
{
    id: 99, // Use the next available sequential number
    name: 'Your Project Name',
    creator: 'Your Name or Squad',
    category: 'WB Stats Sites', // Must be one of the exact categories listed above
    shortDescription: 'A brief 1-2 sentence summary.',
    details: 'A longer, more detailed explanation of what the project does, tech stack used, etc.',
    image: 'images/your-project.jpg', // Local path OR external URL
    link: 'https://link.to.your.project.com/', // Project URL. Be sure this is valid.
    status: 'Active' // Must be Active, Maintenance, or Removed
}
```

### 3. Adding an Image (Optional)
- **Local Images**: Put a screenshot in the `images` folder (size it reasonably around 1280x720) and reference it as `'images/filename.jpg'`. The UI will scale it cleanly.
- **GitHub README Cards**: If you don't have an image, you can use a GitHub auto-generated repo card. E.g.: `'https://github-readme-stats.vercel.app/api/pin/?username=YourUser&repo=YourRepo&theme=dark&hide_border=true'`.
- **No Image**: You can also just set `image: null` and the site will display a clean placeholder box.

### 4. Create a Pull Request (PR)
- Commit your changes to your fork.
- Go to the original repository.
- Click "Pull Requests" -> "New Pull Request".
- Compare across forks: set the base to the main repository and the head to your fork.
- Submit the PR with a brief description of the addition or update.
