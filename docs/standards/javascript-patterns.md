# JavaScript Patterns & Modernization Guide

> **Version**: 2.0.0  
> **Last Updated**: December 2, 2025  
> **Purpose**: Modern JavaScript patterns, best practices, and migration guides for McCal Media widgets

---

## Table of Contents

1. [Overview](#overview)
2. [Modern JavaScript Standards](#modern-javascript-standards)
3. [Variable Declarations](#variable-declarations)
4. [Strict Equality](#strict-equality)
5. [Function Patterns](#function-patterns)
6. [Module Structure](#module-structure)
7. [Common Utilities](#common-utilities)
8. [Widget Self-Containment](#widget-self-containment)
9. [Migration Guide](#migration-guide)

---

## Overview

McCal Media widgets follow modern JavaScript (ES6+) standards while maintaining self-contained architecture for Squarespace compatibility.

### Key Principles

- ✅ Use `const` and `let` instead of `var`
- ✅ Use strict equality (`===`, `!==`)
- ✅ Use arrow functions for brevity
- ✅ Keep widgets self-contained (inline all code)
- ✅ Avoid global namespace pollution
- ✅ Include proper error handling
- ✅ Use modern async/await patterns

---

## Modern JavaScript Standards

### ES6+ Features to Use

```javascript
// Destructuring
const { data, error } = response;
const [first, ...rest] = array;

// Template literals
const message = `Hello, ${name}!`;
const multiline = `
  Line 1
  Line 2
`;

// Arrow functions
const double = (x) => x * 2;
const greet = (name) => `Hello, ${name}!`;

// Default parameters
const greet = (name = "Guest") => `Hello, ${name}!`;

// Spread operator
const combined = [...array1, ...array2];
const merged = { ...obj1, ...obj2 };

// Optional chaining
const value = obj?.property?.nested;

// Nullish coalescing
const result = value ?? defaultValue;

// Array methods
const filtered = items.filter((item) => item.active);
const mapped = items.map((item) => item.name);
const found = items.find((item) => item.id === 5);
```

---

## Variable Declarations

### Use `const` by Default

```javascript
// ✅ Good - immutable reference
const API_URL = "https://api.example.com";
const element = document.querySelector(".widget");
const data = await fetchData();

// ❌ Avoid - unnecessary mutability
var API_URL = "https://api.example.com";
var element = document.querySelector(".widget");
var data = await fetchData();
```

### Use `let` for Reassignment

```javascript
// ✅ Good - needs reassignment
let counter = 0;
let currentIndex = 0;
let retries = 3;

for (let i = 0; i < items.length; i++) {
  counter += items[i];
}

// ❌ Avoid - const would be better
var counter = 0;
```

### Never Use `var`

```javascript
// ❌ Avoid - function scoped, hoisting issues
var count = 0;
if (true) {
  var count = 1; // Same variable!
}
console.log(count); // 1

// ✅ Good - block scoped
let count = 0;
if (true) {
  let count = 1; // Different variable
}
console.log(count); // 0
```

---

## Strict Equality

### Always Use `===` and `!==`

```javascript
// ✅ Good - strict equality
if (value === 0) {
}
if (str !== "") {
}
if (obj === null) {
}

// ❌ Avoid - loose equality (type coercion)
if (value == 0) {
}
if (str != "") {
}
if (obj == null) {
}
```

### Type Coercion Issues

```javascript
// Loose equality problems
0 == false; // true (unexpected!)
"" == false; // true (unexpected!)
"0" == 0; // true (unexpected!)
null == undefined; // true (unexpected!)

// Strict equality - predictable
0 === false; // false
"" === false; // false
"0" === 0; // false
null === undefined; // false

// ✅ Good - explicit checks
if (value === 0) {
}
if (str === "") {
}
if (typeof value === "undefined") {
}
if (value === null) {
}

// ❌ Avoid - implicit coercion
if (value == 0) {
}
if (str == "") {
}
if (value == undefined) {
}
if (value == null) {
}
```

---

## Function Patterns

### Arrow Functions

```javascript
// ✅ Good - concise arrow functions
const double = (x) => x * 2;
const greet = (name) => `Hello, ${name}!`;
const process = (data) => {
  // Multiple statements
  const result = transform(data);
  return result;
};

// ❌ Avoid - verbose function expressions
const double = function (x) {
  return x * 2;
};
```

### Async/Await

```javascript
// ✅ Good - modern async/await
const fetchData = async () => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch failed:", error);
    return null;
  }
};

// ❌ Avoid - callback hell
function fetchData(callback) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => callback(null, data))
    .catch((error) => callback(error));
}
```

### Higher-Order Functions

```javascript
// ✅ Good - functional patterns
const activeItems = items.filter((item) => item.active);
const names = items.map((item) => item.name);
const total = items.reduce((sum, item) => sum + item.value, 0);
const found = items.find((item) => item.id === targetId);

// ❌ Avoid - imperative loops
const activeItems = [];
for (let i = 0; i < items.length; i++) {
  if (items[i].active) {
    activeItems.push(items[i]);
  }
}
```

---

## Module Structure

### Self-Contained Widget Pattern

```javascript
// ✅ Good - IIFE (Immediately Invoked Function Expression)
(function () {
  "use strict";

  // Widget-scoped variables
  const WIDGET_VERSION = "2.0.0";
  const CACHE_KEY = "widget-cache-v2";

  // Widget-scoped functions
  const init = () => {
    // Initialization logic
  };

  const fetchData = async () => {
    // Data fetching logic
  };

  const render = (data) => {
    // Rendering logic
  };

  // Start widget
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
```

### Namespace Pattern

```javascript
// ✅ Good - single global namespace
window.EventPortfolio = {
  version: "2.0.0",
  config: {},

  init: function () {
    // Initialization
  },

  refresh: function () {
    // Refresh logic
  },

  getMetrics: function () {
    return this.metrics;
  },
};

// Initialize
EventPortfolio.init();
```

---

## Common Utilities

### DOM Utilities

```javascript
// Query selectors
const $ = (selector, context = document) => {
  try {
    return context.querySelector(selector);
  } catch (e) {
    console.warn(`Invalid selector: ${selector}`);
    return null;
  }
};

const $$ = (selector, context = document) => {
  try {
    return Array.from(context.querySelectorAll(selector));
  } catch (e) {
    console.warn(`Invalid selector: ${selector}`);
    return [];
  }
};

// Text content
const setText = (element, text) => {
  const el = typeof element === "string" ? $(element) : element;
  if (el) el.textContent = String(text);
};

// Class manipulation
const toggleClass = (element, className, force) => {
  const el = typeof element === "string" ? $(element) : element;
  if (el) el.classList.toggle(className, force);
};
```

### Storage Utilities

```javascript
// Get from localStorage
const getStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Storage read failed for ${key}:`, e);
    return defaultValue;
  }
};

// Set in localStorage
const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`Storage write failed for ${key}:`, e);
    return false;
  }
};
```

### Fetch Utilities

```javascript
// Fetch with retries
const fetchJSON = async (
  url,
  { retries = 3, retryDelay = 1000, timeout = 10000 } = {}
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};
```

### Debounce & Throttle

```javascript
// Debounce - delay execution
const debounce = (func, wait = 300) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle - limit frequency
const throttle = (func, limit = 300) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
```

---

## Widget Self-Containment

### Requirements

1. **All code inline** - No external script files
2. **Namespaced** - Avoid global pollution
3. **Versioned** - Include version attribute
4. **Error handling** - Graceful degradation
5. **No dependencies** - Self-contained libraries

### Complete Widget Template

```html
<div
  class="mcc-event-portfolio"
  data-widget-version="2.0.0"
  data-theme="system"
>
  <style>
    /* All CSS inline here */
    .mcc-event-portfolio {
      /* Styles */
    }
  </style>

  <!-- Widget HTML -->
  <div class="mcc-event-portfolio__grid" id="eventGrid"></div>

  <script>
    (function () {
      "use strict";

      // Constants
      const VERSION = "2.0.0";
      const CACHE_KEY = "events-cache-v2";
      const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

      // DOM Elements
      const grid = document.getElementById("eventGrid");

      // Utilities (inline from widget-utils.js)
      const $ = (sel) => document.querySelector(sel);
      const $$ = (sel) => Array.from(document.querySelectorAll(sel));

      const getStorage = (key, def = null) => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : def;
        } catch {
          return def;
        }
      };

      const setStorage = (key, val) => {
        try {
          localStorage.setItem(key, JSON.stringify(val));
          return true;
        } catch {
          return false;
        }
      };

      // Data fetching
      const fetchData = async () => {
        const cached = getStorage(CACHE_KEY);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          return cached.data;
        }

        try {
          const response = await fetch("https://api.example.com/data");
          const data = await response.json();
          setStorage(CACHE_KEY, { data, timestamp: Date.now() });
          return data;
        } catch (error) {
          console.error("Fetch failed:", error);
          return cached?.data || [];
        }
      };

      // Rendering
      const render = (data) => {
        if (!grid) return;

        const html = data
          .map(
            (item) => `
        <div class="mcc-event-card">
          <img src="${item.image}" alt="${item.title}">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
      `
          )
          .join("");

        grid.innerHTML = html;
      };

      // Initialization
      const init = async () => {
        try {
          const data = await fetchData();
          render(data);
        } catch (error) {
          console.error("Widget initialization failed:", error);
        }
      };

      // Start
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
      } else {
        init();
      }
    })();
  </script>
</div>
```

---

## Migration Guide

### Step 1: Replace `var` with `const`/`let`

```javascript
// Before
var API_URL = "https://api.example.com";
var items = [];
var counter = 0;

// After
const API_URL = "https://api.example.com";
let items = [];
let counter = 0;
```

### Step 2: Use Strict Equality

```javascript
// Before
if (value == 0) {
}
if (str != "") {
}
if (obj == null) {
}

// After
if (value === 0) {
}
if (str !== "") {
}
if (obj === null) {
}
```

### Step 3: Modernize Functions

```javascript
// Before
function double(x) {
  return x * 2;
}

var greet = function (name) {
  return "Hello, " + name;
};

// After
const double = (x) => x * 2;

const greet = (name) => `Hello, ${name}`;
```

### Step 4: Use Async/Await

```javascript
// Before
function fetchData() {
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
}

// After
const fetchData = async () => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
```

### Step 5: Use Array Methods

```javascript
// Before
var active = [];
for (var i = 0; i < items.length; i++) {
  if (items[i].active) {
    active.push(items[i]);
  }
}

// After
const active = items.filter((item) => item.active);
```

### Step 6: Use Template Literals

```javascript
// Before
var message = "Hello, " + name + "! You have " + count + " messages.";

// After
const message = `Hello, ${name}! You have ${count} messages.`;
```

---

## Error Handling Best Practices

### Try-Catch Blocks

```javascript
// ✅ Good - specific error handling
const fetchData = async () => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    return null; // Graceful degradation
  }
};
```

### Validation

```javascript
// ✅ Good - input validation
const processData = (data) => {
  if (!data || !Array.isArray(data)) {
    console.warn("Invalid data format");
    return [];
  }

  return data.filter((item) => item && item.id);
};
```

---

## Performance Considerations

### Avoid Unnecessary DOM Queries

```javascript
// ❌ Avoid - repeated queries
for (let i = 0; i < 100; i++) {
  document.querySelector(".container").appendChild(element);
}

// ✅ Good - cache reference
const container = document.querySelector(".container");
for (let i = 0; i < 100; i++) {
  container.appendChild(element);
}
```

### Batch DOM Updates

```javascript
// ❌ Avoid - multiple reflows
items.forEach((item) => {
  const el = document.createElement("div");
  el.textContent = item.name;
  container.appendChild(el);
});

// ✅ Good - single reflow
const fragment = document.createDocumentFragment();
items.forEach((item) => {
  const el = document.createElement("div");
  el.textContent = item.name;
  fragment.appendChild(el);
});
container.appendChild(fragment);
```

---

## Resources

- **Shared Utilities**: `/src/widgets/_shared/widget-utils.js`
- **CSS Architecture**: `/docs/standards/css-architecture.md`
- **Widget Standards**: `/docs/standards/widget-standards.md`
- **MDN JavaScript Guide**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide

---

_Last updated: December 2, 2025_
