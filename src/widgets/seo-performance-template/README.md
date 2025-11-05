# SEO/Performance Widget Template

This template provides a boilerplate for creating widgets with SEO and performance best practices. It includes:

- **Structured Data Helper**: Easily add Schema.org metadata.
- **Lazy Loading**: Optimize image loading for better performance.
- **ARIA Patterns**: Ensure accessibility compliance.

## Features

1. **Structured Data**: Add JSON-LD metadata for better search engine visibility.
2. **Lazy Loading**: Use Intersection Observer to defer loading of offscreen images.
3. **Accessibility**: Predefined ARIA roles and attributes for screen reader support.

## Usage

1. Copy the template folder.
2. Customize the `index.html`, `styles.css`, and `script.js` files.
3. Test the widget locally using the provided `test.html`.

## File Structure
```
seo-performance-template/
├── index.html       # Main widget file
├── styles.css       # Widget styles
├── script.js        # Widget logic
├── test.html        # Local testing file
└── README.md        # Documentation
```

## Best Practices
- Follow the [Widget Standards](../../docs/standards/widget-standards.md).
- Validate the widget using `npm run validate:widgets`.
- Optimize images using the Responsive Image Helper.

## License
MIT License.