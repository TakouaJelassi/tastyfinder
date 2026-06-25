import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONS, IconName } from './icon-registry';

/**
 * Wiederverwendbares Icon: `<app-icon name="clock" />`.
 * Rendert ein zentral registriertes SVG (Feather/Lucide-Stil), statt die
 * SVG-Markup überall im Template zu duplizieren.
 */
@Component({
  selector: 'app-icon',
  imports: [],
  template: `<span
    class="app-icon"
    [style.width.px]="size()"
    [style.height.px]="size()"
    [innerHTML]="svg()"
  ></span>`,
  styles: [
    `
      .app-icon {
        display: inline-flex;
        flex-shrink: 0;
      }
      .app-icon ::ng-deep svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class Icon {
  private sanitizer = inject(DomSanitizer);

  name = input.required<IconName>();
  size = input(20);
  strokeWidth = input(2);
  filled = input(false);

  svg = computed<SafeHtml>(() => {
    const inner = ICONS[this.name()] ?? '';
    const fill = this.filled() ? 'currentColor' : 'none';
    const markup =
      `<svg viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" ` +
      `stroke-width="${this.strokeWidth()}" stroke-linecap="round" ` +
      `stroke-linejoin="round">${inner}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(markup);
  });
}
