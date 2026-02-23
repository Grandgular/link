import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { Link, LinkDefinition } from './link';

describe('Link', () => {
  let service: Link;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Link);
    document = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    const links = Array.from(document.head.querySelectorAll('link'));
    links.forEach((link) => {
      if (link.hasAttribute('data-test')) {
        link.remove();
      }
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addTag', () => {
    it('should add link element to head with correct attributes', () => {
      const tag: LinkDefinition = {
        rel: 'canonical',
        href: 'https://example.com',
        'data-test': 'true',
      };

      const element = service.addTag(tag);

      expect(element).toBeTruthy();
      expect(element?.rel).toBe('canonical');
      expect(element?.href).toBe('https://example.com/');
      expect(element?.parentNode).toBe(document.head);
    });

    it('should return null for falsy input', () => {
      expect(service.addTag(null as any)).toBeNull();
      expect(service.addTag(undefined as any)).toBeNull();
    });

    it('should return existing element if match found (deduplication)', () => {
      const tag: LinkDefinition = {
        rel: 'canonical',
        href: 'https://example.com',
        'data-test': 'true',
      };

      const first = service.addTag(tag);
      const second = service.addTag(tag);

      expect(first).toBe(second);
      expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    });

    it('should create duplicate when forceCreation is true', () => {
      const tag: LinkDefinition = {
        rel: 'stylesheet',
        href: '/style.css',
        'data-test': 'true',
      };

      const first = service.addTag(tag);
      const second = service.addTag(tag, true);

      expect(first).not.toBe(second);
      expect(document.head.querySelectorAll('link[href="/style.css"]').length).toBe(2);
    });

    it('should support custom attributes', () => {
      const tag: LinkDefinition = {
        rel: 'preload',
        href: '/font.woff2',
        as: 'font',
        crossorigin: 'anonymous',
        'data-test': 'true',
      };

      const element = service.addTag(tag);

      expect(element?.getAttribute('as')).toBe('font');
      expect(element?.getAttribute('crossorigin')).toBe('anonymous');
    });
  });

  describe('addTags', () => {
    it('should add multiple link elements', () => {
      const tags: LinkDefinition[] = [
        { rel: 'preconnect', href: 'https://api.example.com', 'data-test': 'true' },
        { rel: 'dns-prefetch', href: 'https://cdn.example.com', 'data-test': 'true' },
      ];

      const elements = service.addTags(tags);

      expect(elements.length).toBe(2);
      expect(elements[0].rel).toBe('preconnect');
      expect(elements[1].rel).toBe('dns-prefetch');
    });

    it('should return empty array for falsy input', () => {
      expect(service.addTags(null as any)).toEqual([]);
      expect(service.addTags(undefined as any)).toEqual([]);
    });

    it('should skip falsy elements in array', () => {
      const tags: any[] = [
        { rel: 'canonical', href: 'https://example.com', 'data-test': 'true' },
        null,
        undefined,
        { rel: 'alternate', href: 'https://example.com/alt', 'data-test': 'true' },
      ];

      const elements = service.addTags(tags);

      expect(elements.length).toBe(2);
      expect(elements[0].rel).toBe('canonical');
      expect(elements[1].rel).toBe('alternate');
    });

    it('should respect forceCreation flag', () => {
      const tag: LinkDefinition = { rel: 'stylesheet', href: '/theme.css', 'data-test': 'true' };

      service.addTag(tag);
      const elements = service.addTags([tag, tag], true);

      expect(elements.length).toBe(2);
      expect(document.head.querySelectorAll('link[href="/theme.css"]').length).toBe(3);
    });
  });

  describe('getTag', () => {
    it('should find element by attribute selector', () => {
      const tag: LinkDefinition = {
        rel: 'canonical',
        href: 'https://example.com',
        'data-test': 'true',
      };
      service.addTag(tag);

      const element = service.getTag('rel="canonical"');

      expect(element).toBeTruthy();
      expect(element?.rel).toBe('canonical');
    });

    it('should return null for empty selector', () => {
      expect(service.getTag('')).toBeNull();
    });

    it('should return null if no match found', () => {
      expect(service.getTag('rel="nonexistent"')).toBeNull();
    });

    it('should find by href selector', () => {
      const tag: LinkDefinition = {
        rel: 'stylesheet',
        href: '/custom.css',
        'data-test': 'true',
      };
      service.addTag(tag);

      const element = service.getTag('href="/custom.css"');

      expect(element).toBeTruthy();
      expect(element?.href).toContain('/custom.css');
    });
  });

  describe('getTags', () => {
    it('should find all matching elements', () => {
      service.addTags([
        { rel: 'stylesheet', href: '/style1.css', 'data-test': 'true' },
        { rel: 'stylesheet', href: '/style2.css', 'data-test': 'true' },
        { rel: 'canonical', href: 'https://example.com', 'data-test': 'true' },
      ]);

      const stylesheets = service.getTags('data-test="true"][rel="stylesheet"');

      expect(stylesheets.length).toBe(2);
      expect(stylesheets.every((el) => el.rel === 'stylesheet')).toBe(true);
    });

    it('should return empty array for empty selector', () => {
      expect(service.getTags('')).toEqual([]);
    });

    it('should return empty array if no matches found', () => {
      expect(service.getTags('rel="nonexistent"')).toEqual([]);
    });

    it('should filter only LINK elements', () => {
      service.addTag({ rel: 'canonical', href: 'https://example.com', 'data-test': 'true' });

      const elements = service.getTags('data-test="true"');

      expect(elements.every((el) => el.tagName === 'LINK')).toBe(true);
    });
  });

  describe('updateTag', () => {
    it('should update attributes of existing element', () => {
      const original: LinkDefinition = {
        rel: 'canonical',
        href: 'https://example.com/old',
        'data-test': 'true',
      };
      service.addTag(original);

      const updated = service.updateTag({
        rel: 'canonical',
        href: 'https://example.com/new',
        'data-test': 'true',
      });

      expect(updated).toBeTruthy();
      expect(updated?.href).toBe('https://example.com/new');
      expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    });

    it('should create new element if no match found', () => {
      const element = service.updateTag({
        rel: 'alternate',
        href: 'https://example.com/alt',
        'data-test': 'true',
      });

      expect(element).toBeTruthy();
      expect(element?.rel).toBe('alternate');
      expect(element?.parentNode).toBe(document.head);
    });

    it('should return null for falsy input', () => {
      expect(service.updateTag(null as any)).toBeNull();
      expect(service.updateTag(undefined as any)).toBeNull();
    });

    it('should use custom selector when provided', () => {
      service.addTag({
        rel: 'stylesheet',
        href: 'https://cdn.example.com/old.css',
        'data-test': 'true',
      });

      const updated = service.updateTag(
        { href: 'https://cdn.example.com/new.css', 'data-test': 'true' },
        'href="https://cdn.example.com/old.css"'
      );

      expect(updated).toBeTruthy();
      expect(updated?.href).toBe('https://cdn.example.com/new.css');
    });

    it('should update multiple attributes', () => {
      service.addTag({
        rel: 'preload',
        href: '/old-font.woff2',
        as: 'font',
        'data-test': 'true',
      });

      const updated = service.updateTag({
        rel: 'preload',
        href: '/new-font.woff2',
        as: 'font',
        crossorigin: 'anonymous',
        'data-test': 'true',
      });

      expect(updated?.href).toContain('/new-font.woff2');
      expect(updated?.getAttribute('crossorigin')).toBe('anonymous');
    });
  });

  describe('removeTag', () => {
    it('should remove element from DOM', () => {
      service.addTag({
        rel: 'canonical',
        href: 'https://example.com',
        'data-test': 'true',
      });

      expect(document.head.querySelector('link[rel="canonical"]')).toBeTruthy();

      service.removeTag('rel="canonical"');

      expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    });

    it('should not throw if element not found', () => {
      expect(() => service.removeTag('rel="nonexistent"')).not.toThrow();
    });

    it('should remove correct element when multiple exist', () => {
      service.addTags([
        { rel: 'stylesheet', href: '/style1.css', 'data-test': 'true' },
        { rel: 'stylesheet', href: '/style2.css', 'data-test': 'true' },
      ]);

      service.removeTag('href="/style1.css"');

      expect(document.head.querySelector('link[href="/style1.css"]')).toBeNull();
      expect(document.head.querySelector('link[href="/style2.css"]')).toBeTruthy();
    });
  });

  describe('removeTagElement', () => {
    it('should remove specific element from DOM', () => {
      const element = service.addTag({
        rel: 'canonical',
        href: 'https://example.com',
        'data-test': 'true',
      });

      expect(element?.parentNode).toBe(document.head);

      service.removeTagElement(element!);

      expect(element?.parentNode).toBeNull();
    });

    it('should not throw for null input', () => {
      expect(() => service.removeTagElement(null as any)).not.toThrow();
      expect(() => service.removeTagElement(undefined as any)).not.toThrow();
    });

    it('should not throw for element without parentNode', () => {
      const element = document.createElement('link') as HTMLLinkElement;
      expect(() => service.removeTagElement(element)).not.toThrow();
    });

    it('should remove element even if not in head', () => {
      const element = service.addTag({
        rel: 'canonical',
        href: 'https://example.com',
        'data-test': 'true',
      });

      service.removeTagElement(element!);

      expect(document.head.contains(element)).toBe(false);
    });
  });
});
