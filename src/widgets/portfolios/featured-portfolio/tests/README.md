# Featured Portfolio Widget Tests

This folder contains testing and debugging tools for the Featured Portfolio Widget v1.5.

## Files

- **`debug-console.html`** - Comprehensive debugging tool with all tests combined
  - Manifest loading tests
  - URL resolution tests  
  - Path segment tests
  - Live widget preview
  - Copy/paste functionality for error logs
  - Real-time status updates

- **`debug-image-urls.html`** - Legacy image URL debugging tool
- **`debug-manifests.html`** - Legacy manifest debugging tool  
- **`direct-widget-test.html`** - Simple widget iframe test wrapper

## Usage

1. Open `debug-console.html` in your browser
2. Click "🚀 Run All Tests" to execute all debugging tests
3. View results in real-time across different test panels
4. Use "📋 Copy All Logs" to copy debugging information for support
5. Individual test buttons available for focused debugging

## Test Categories

### 📋 Manifest Loading Test
- Tests fetching of `featured-manifest.json` and `portfolio-manifest.json`
- Validates JSON structure and item counts
- Checks both local and production environments

### 🔗 URL Resolution Test  
- Tests URL construction for local vs production
- Validates HTTP accessibility of manifest files
- Checks path resolution logic

### 🛤️ Path Segments Test
- Tests `extractRootSegments` function
- Validates path parsing for different URL formats
- Tests folder path processing

### 🎯 Widget Integration Test
- Live widget preview with debug messages
- Real-time monitoring of widget performance
- Integration testing with actual manifest data

## Debugging Features

- **Copy/Paste**: Each test panel has a copy button for logs
- **Real-time Updates**: Tests run automatically and update status
- **Error Highlighting**: Different log levels (info, success, warning, error)
- **Summary Metrics**: Key performance indicators at the top
- **Live Preview**: Embedded widget frame for immediate testing

## Troubleshooting

If tests fail, check:
1. Development server is running (`npm run dev`)
2. Manifest files exist in `src/images/Portfolios/`
3. Network connectivity for production tests
4. Browser console for additional errors