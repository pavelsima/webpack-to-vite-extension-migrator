# Webpack to Vite Extension Migrator

This tool facilitates the migration of imports of webpack-based app project Vite. Transitioning to Vite can offer improved performance and developer experience.

## How to Use

### Prerequisites
Ensure you have Node.js version 16 or higher installed on your system.

### Configuration
Before running the migration script, make sure to configure the following variables in the `index.js` file:

```javascript
const projectRoot = __dirname; // Replace with your project root directory
const fileExtensionsToCheck = ['.js', '.vue']; // Specify the file extensions that the script should test

// Define your alias mappings here
const aliasMappings = {
  '@': './src',
  // Add more aliases as needed
};
```

### Running the Migration
- Clone or download this repository.
- Navigate to the root directory of the project in your terminal.
- Set up the configuration variables as mentioned above.
- Run the migration script with the following command:
```javascript
node index.js
```

## Notes
- This tool has been tested primarily on Vue projects. However, it should function similarly for React projects.
- Please feel free to contribute to this project by submitting issues or pull requests.
