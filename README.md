# @grandgular/link

[//]: # ([![npm version]&#40;https://img.shields.io/npm/v/@grandgular/link&#41;]&#40;https://www.npmjs.com/package/@grandgular/link&#41;)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Angular service for managing HTML `<link>` elements in the document head. Provides a type-safe API to dynamically add, update, query, and remove link elements.

## Features

- 🛠️ Full control over `<link>` elements
- 🧩 Supports all standard and custom link attributes
- 🔍 Query existing links with CSS selectors
- ♻️ Smart update system (finds and updates existing links)
- 🏷️ Type-safe API with `LinkDefinition` interface
- ⚡ Lightweight (~2KB gzipped)
- 🅰️ Angular 16+ compatible

## Installation

```bash
npm install @grandgular/link
```

## Usage

### Basic Setup

Import and inject the Link service in your component or service:

```typescript
import { Component, inject } from '@angular/core';
import { Link } from '@grandgular/link';

@Component({
  selector: 'app-root',
  template: `...`
})
export class AppComponent {
  link = inject(Link);
  // or 
  // constructor(private link: Link) {}
}
```

## API Examples

### Add a canonical link

```typescript
this.link.addTag({
  rel: 'canonical',
  href: 'https://example.com/page'
});
```

### Add multiple links

```typescript
this.link.addTags([
  { rel: 'preconnect', href: 'https://api.example.com' },
  { rel: 'stylesheet', href: '/styles.css' }
]);
```

### Update existing link

```typescript
this.link.updateTag({
  rel: 'canonical',
  href: 'https://example.com/new-url'
});
```

### Get link element

```typescript
const canonical = this.link.getTag('rel="canonical"');
```

### Remove link

```typescript
this.link.removeTag('rel="canonical"');
```

## Advanced Usage

### Custom attributes

```typescript
this.link.addTag({
    rel: 'preload',
    href: '/font.woff2',
    as: 'font',
    type: 'font/woff2',
    crossorigin: 'anonymous'
});
```

### Force creation (duplicate links)

```typescript
this.link.addTag(
  { rel: 'stylesheet', href: '/theme.css' },
  true // force creation even if exists
);
```

### Custom selector for updates

```typescript
this.link.updateTag(
  { href: 'https://new-cdn.com/style.css' },
  'href="https://old-cdn.com/style.css"'
);
```

## API Reference

### LinkDefinition

Type representing all possible <link> attributes including:
- Standard attributes: rel, href, crossorigin, type, etc.
- Custom attributes via index signature
- Modern attributes: fetchpriority, imagesrcset, referrerpolicy

### Methods

| Method | Description |
|--------|-------------|
| `addTag(tag: LinkDefinition, forceCreation?: boolean)` | Adds a new link element or returns existing one if found. When `forceCreation` is true, always creates new element. |
| `addTags(tags: LinkDefinition[], forceCreation?: boolean)` | Adds multiple link elements. Returns array of created/existing elements. |
| `getTag(attrSelector: string)` | Returns first link element matching the attribute selector (e.g. `'rel="canonical"'`) or null if not found. |
| `getTags(attrSelector: string)` | Returns all link elements matching the attribute selector as an array (empty array if none found). |
| `updateTag(tag: LinkDefinition, selector?: string)` | Updates existing link (found by selector or auto-detected from tag) or creates new one if not found. |
| `removeTag(attrSelector: string)` | Removes link element matching the attribute selector. |
| `removeTagElement(link: HTMLLinkElement)` | Removes specific link element from DOM. |


## License

MIT © [Grandgular](https://github.com/grandgular)
