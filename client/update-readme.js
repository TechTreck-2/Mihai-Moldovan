const fs = require('fs');
const path = require('path');

function updateReadmeWithScreenshots() {
  const readmePath = path.join(process.cwd(), '..', 'README.md');
  
  console.log('Current working directory:', process.cwd());
  console.log('Looking for README.md at:', readmePath);
  
  if (!fs.existsSync(readmePath)) {
    console.error('README.md not found!');
    return;
  }
  
  console.log('README.md found, proceeding with update...');
  
  let readme = fs.readFileSync(readmePath, 'utf8');
  
  const screenshotSection = `
## Screenshots

### Login Page
| Light Mode | Dark Mode |
|------------|-----------|
| ![Login Light](screenshots/login-light.png) | ![Login Dark](screenshots/login-dark.png) |

### Clock In/Out Page
| Light Mode | Dark Mode |
|------------|-----------|
| ![Clocking Light](screenshots/clocking-light.png) | ![Clocking Dark](screenshots/clocking-dark.png) |

### Holiday Planning Page
| Light Mode | Dark Mode |
|------------|-----------|
| ![Holiday Light](screenshots/holiday-light.png) | ![Holiday Dark](screenshots/holiday-dark.png) |

*Screenshots are automatically updated on every client code change.*

`;
  
  const screenshotStartMarker = '## Screenshots';
  const nextSectionMarkers = ['## Setup and Running', '## Development', '## Features', '## API Documentation', '## Contributing', '## License'];
  
  let startIndex = readme.indexOf(screenshotStartMarker);
  if (startIndex !== -1) {
    let endIndex = readme.length;
    
    for (const marker of nextSectionMarkers) {
      const markerIndex = readme.indexOf(marker, startIndex + screenshotStartMarker.length);
      if (markerIndex !== -1 && markerIndex < endIndex) {
        endIndex = markerIndex;
      }
    }
    
    readme = readme.substring(0, startIndex) + readme.substring(endIndex);
  }
  
  let insertIndex = readme.indexOf('## Setup and Running');
  if (insertIndex === -1) {
    insertIndex = readme.indexOf('## Development');
  }
  if (insertIndex === -1) {
    insertIndex = readme.indexOf('## Features');
  }
  if (insertIndex === -1) {
    insertIndex = readme.length;
  }
  
  readme = readme.substring(0, insertIndex) + screenshotSection + '\n' + readme.substring(insertIndex);
  
  fs.writeFileSync(readmePath, readme);
  console.log('README.md updated with screenshots');
  console.log('File written to:', readmePath);
}

if (require.main === module) {
  updateReadmeWithScreenshots();
}

module.exports = { updateReadmeWithScreenshots };
