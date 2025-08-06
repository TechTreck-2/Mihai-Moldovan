# Screenshot Scripts

This folder contains automation scripts for taking screenshots of the application and updating the README.

## Files

- **`take-screenshots.js`** - Takes screenshots of different pages in light/dark themes
- **`update-readme.js`** - Updates the main README.md with screenshot section

## Usage

### Prerequisites

Install dependencies in the client folder:
```bash
cd client
npm install
```

### Taking Screenshots Locally

1. Start your application locally:
```bash
cd client
npm start
```

2. In another terminal, take screenshots:
```bash
cd client
npm run screenshots
```

This will create a `screenshots/` folder in the project root with all the captured images.

### Updating README

After taking screenshots, update the README:
```bash
cd client
npm run screenshots:update-readme
```

### Environment Variables

- **`BASE_URL`** - Base URL for the application (defaults to `http://localhost:4200`)

### GitHub Actions

These scripts are automatically used by the GitHub Actions workflow when client code changes are deployed to GitHub Pages. The workflow:

1. Deploys the application to GitHub Pages
2. Takes screenshots from the live deployed URL
3. Updates the README with the new screenshots
4. Commits the changes back to the repository

## Local Testing

To test the scripts locally with your development server:

```bash
# Terminal 1: Start the app
cd client
npm start

# Terminal 2: Take screenshots
cd client
BASE_URL=http://localhost:4200 npm run screenshots
npm run screenshots:update-readme
```
