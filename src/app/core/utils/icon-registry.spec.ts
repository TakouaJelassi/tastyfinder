import { describe, expect, it } from 'vitest';
import { ICONS, IconName } from '../../shared/components/icon/icon-registry';

describe('icon registry', () => {
  it('provides non-empty SVG markup for every registered name', () => {
    for (const [name, markup] of Object.entries(ICONS)) {
      expect(markup, `icon "${name}" should have markup`).toBeTruthy();
      expect(markup).toContain('<');
    }
  });

  it('exposes the expected core icons', () => {
    const required: IconName[] = ['home', 'heart', 'cart', 'calendar', 'search', 'close'];
    for (const name of required) {
      expect(ICONS[name]).toBeTruthy();
    }
  });
});
