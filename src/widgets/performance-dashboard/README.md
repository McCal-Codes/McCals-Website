# Performance Dashboard Widget

This widget provides a real-time dashboard for monitoring Core Web Vitals and other performance metrics.

## Features

1. **Core Web Vitals**: Displays metrics like FCP, LCP, CLS, and TBT.
2. **Real-Time Updates**: Fetches and updates metrics dynamically.
3. **Responsive Design**: Works seamlessly on desktop and mobile.

## Usage

1. Copy the widget folder to your project.
2. Include the `index.html`, `styles.css`, and `script.js` files in your project.
3. Open `test.html` to preview the widget locally.

## File Structure
```
performance-dashboard/
├── index.html       # Main widget file
├── styles.css       # Widget styles
├── script.js        # Widget logic
├── test.html        # Local testing file
└── README.md        # Documentation
```

## Best Practices
- Follow the [Widget Standards](../../docs/standards/widget-standards.md).
- Validate the widget using `npm run validate:widgets`.
- Optimize performance using Lighthouse CI.

## License
MIT License.