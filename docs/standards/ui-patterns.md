
# UI Patterns — Vite Site (2026+)

This document defines the core UI patterns for the Vite-based production site. All new components and pages should follow these patterns for consistency, accessibility, and maintainability.

## Principles
- Use semantic HTML and ARIA roles
- Responsive by default (mobile-first)
- Themeable via CSS variables or Tailwind CSS
- Accessible color contrast (WCAG AA+)
- Keyboard navigation support
- Prefer functional React components and hooks
- Use Vite's asset and SVG import features

---

## Core Patterns & Examples

### Header & Navigation
- Semantic `<header>` and `<nav>` with ARIA landmarks
- Responsive hamburger menu for mobile
- Example:
```jsx
<header>
	<nav aria-label="Main navigation">
		<a href="/" className="logo">McCal Media</a>
		<button aria-label="Open menu" className="menu-btn">☰</button>
		{/* ...nav links... */}
	</nav>
</header>
```

### Footer
- Use `<footer>` with clear links and contact info
- Example:
```jsx
<footer>
	<p>&copy; 2026 McCal Media</p>
	<nav aria-label="Footer links">
		<a href="/privacy">Privacy</a>
		<a href="/contact">Contact</a>
	</nav>
</footer>
```

### Cards & Lists
- Use `<ul>`/`<li>` for lists, `<section>`/`<article>` for cards
- Example:
```jsx
<ul className="card-list">
	{items.map(item => (
		<li key={item.id} className="card">
			<img src={item.img} alt={item.alt} />
			<h3>{item.title}</h3>
			<p>{item.desc}</p>
		</li>
	))}
</ul>
```

### Buttons & Inputs
- Use `<button>`, `<input>`, `<label>` with accessible labels
- Example:
```jsx
<label htmlFor="email">Email</label>
<input id="email" type="email" required />
<button type="submit">Subscribe</button>
```

### Modals & Dialogs
- Use ARIA roles and focus trap
- Example:
```jsx
<dialog open aria-modal="true" aria-labelledby="modal-title">
	<h2 id="modal-title">Dialog Title</h2>
	<button aria-label="Close">×</button>
	{/* ...modal content... */}
</dialog>
```

### Alerts & Toasts
- Use `<div role="alert">` for important messages
- Example:
```jsx
<div role="alert" className="toast toast-success">
	Profile updated successfully!
</div>
```

### Skeleton Loaders
- Use animated placeholders for loading states
- Example:
```jsx
<div className="skeleton skeleton-card" aria-hidden="true"></div>
```

### Progressive Image Loading
- Use `loading="lazy"` and low-res placeholders
- Example:
```jsx
<img src="/images/hero.jpg" alt="Concert crowd" loading="lazy" />
```

### Dark Mode Toggle
- Use CSS variables or Tailwind dark mode
- Example:
```jsx
<button aria-pressed={isDark} onClick={toggleDark}>
	{isDark ? '🌙' : '☀️'}
</button>
```

### Responsive Grids
- Use CSS grid/flex or Tailwind utilities
- Example:
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
	{/* ...grid items... */}
</div>
```

---

## Accessibility Notes
- All interactive elements must be keyboard accessible
- Use visible focus indicators
- Test with screen readers (NVDA, VoiceOver)
- Use ARIA roles only when native elements are insufficient

---

## UI Anti-Patterns (Avoid)
| Don’t | Do |
|-------|-----|
| Use divs for buttons | Use `<button>` |
| Hide focus outlines | Show clear focus |
| Hardcode colors | Use CSS variables |
| Skip alt text | Always provide alt |
| Rely on hover only | Support keyboard |

---

*These patterns ensure consistent, accessible UI across the Vite site.*
