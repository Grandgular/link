import { DOCUMENT } from '@angular/common';
import { inject, Injectable, RendererFactory2 } from '@angular/core';

/**
 * Represents attributes for an HTML `<link>` element.
 * @see [HTML meta tag](https://developer.mozilla.org/docs/Web/HTML/Element/link)
 */
export type LinkDefinition = {
  charset?: string;
  crossorigin?: string;
  href?: string;
  hreflang?: string;
  media?: string;
  rel?: string;
  rev?: string;
  sizes?: string;
  target?: string;
  type?: string;
  as?: string;
  fetchpriority?: string;
  imagesrcset?: string;
  imagesizes?: string;
  referrerpolicy?: string;
} & {
  [prop: string]: string;
};

/**
 * Service for managing HTML `<link>` elements in document head.
 * Provides methods to add, update, query and remove link elements.
 *
 * @see [HTML meta tag](https://developer.mozilla.org/docs/Web/HTML/Element/link)
 * @see {@link Link}
 *
 * @example
 * // Add canonical <link>
 * link.addTag({ rel: 'canonical', href: 'https://example.com' });
 *
 * // Update existing <link>
 * link.updateTag({ rel: 'canonical', href: 'https://new-url.com' });
 *
 * // Remove link by attribute selector
 * link.removeTag('rel="canonical"');
 */
@Injectable({ providedIn: 'root' })
export class Link {
  readonly #document = inject(DOCUMENT);
  readonly #renderer = inject(RendererFactory2).createRenderer(null, null);

  /**
   * Adds a new link element or returns existing one if found.
   * @param tag - Link attributes definition
   * @param forceCreation - If true, creates new link even if matching exists
   * @returns The created or existing link element, or null if invalid input
   */
  addTag(tag: LinkDefinition, forceCreation = false): HTMLLinkElement | null {
    if (!tag) return null;
    return this._getOrCreateElement(tag, forceCreation);
  }

  /**
   * Adds multiple link elements.
   * @param tags - Array of link definitions
   * @param forceCreation - If true, creates new links even if matching exist
   * @returns Array of created or existing link elements
   */
  addTags(tags: LinkDefinition[], forceCreation = false): HTMLLinkElement[] {
    if (!tags) return [];
    return tags.reduce((result: HTMLLinkElement[], tag: LinkDefinition) => {
      if (tag) result.push(this._getOrCreateElement(tag, forceCreation));
      return result;
    }, []);
  }

  /**
   * Finds a link element matching the attribute selector.
   * @param attrSelector - Attribute selector (e.g. "rel='canonical'")
   * @returns Matching link element or null if not found
   */
  getTag(attrSelector: string): HTMLLinkElement | null {
    if (!attrSelector) return null;
    return this.#document.querySelector(`link[${attrSelector}]`) || null;
  }

  /**
   * Finds all link elements matching the attribute selector.
   * @param attrSelector - Attribute selector (e.g. "rel='stylesheet'")
   * @returns Array of matching link elements (empty array if none found)
   */
  getTags(attrSelector: string): HTMLLinkElement[] {
    if (!attrSelector) return [];
    const list = this.#document.querySelectorAll(`link[${attrSelector}]`);
    return Array.from(list).filter(
      (el): el is HTMLLinkElement => el.tagName === 'LINK'
    );
  }

  /**
   * Updates existing link element or creates new one if not found.
   * @param tag - New link attributes
   * @param selector - Optional custom selector to find existing link
   * @returns Updated or newly created link element, or null if invalid input
   */
  updateTag(tag: LinkDefinition, selector?: string): HTMLLinkElement | null {
    if (!tag) return null;
    selector = selector || this._parseSelector(tag);
    const link = this.getTag(selector);
    if (link) return this._setLinkElementAttributes(tag, link);
    return this._getOrCreateElement(tag, true);
  }

  /**
   * Removes link element matching the attribute selector.
   * @param attrSelector - Attribute selector (e.g. "rel='canonical'")
   */
  removeTag(attrSelector: string): void {
    const tag = this.getTag(attrSelector);
    if (tag) this.removeTagElement(tag);
  }

  /**
   * Removes specific link element from DOM.
   * @param link - The link element to remove
   */
  removeTagElement(link: HTMLLinkElement): void {
    if (link?.parentNode) this.#renderer.removeChild(link.parentNode, link);
  }

  private _getOrCreateElement(
    linkDef: LinkDefinition,
    forceCreation = false
  ): HTMLLinkElement {
    if (!forceCreation) {
      const selector = this._parseSelector(linkDef);
      const elem = this.getTags(selector).find((elem) =>
        this._containsAttributes(linkDef, elem)
      );
      if (elem) return elem;
    }

    const element = this.#renderer.createElement('link') as HTMLLinkElement;
    this._setLinkElementAttributes(linkDef, element);

    const head = this.#document.head;
    if (head) {
      this.#renderer.appendChild(head, element);
    }
    return element;
  }

  private _setLinkElementAttributes(
    tag: LinkDefinition,
    el: HTMLLinkElement
  ): HTMLLinkElement {
    for (const [key, value] of Object.entries(tag)) {
      if (value != null) {
        this.#renderer.setAttribute(el, key, String(value));
      }
    }
    return el;
  }

  private _parseSelector(tag: LinkDefinition): string {
    if (tag.rel) return `rel="${tag.rel}"`;
    if (tag.href) return `href="${tag.href}"`;
    return '';
  }

  private _containsAttributes(
    tag: LinkDefinition,
    elem: HTMLLinkElement
  ): boolean {
    return Object.keys(tag).every((key) => elem.getAttribute(key) === tag[key]);
  }
}
