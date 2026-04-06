import { describe, it, expect } from 'vitest';
import { generateId, findDuplicates } from './portfolio-ids';

describe('generateId', () => {
  it('generates basic IDs from titles', () => {
    expect(generateId('Star Viper')).toBe('star-viper');
    expect(generateId('Funky Lamp')).toBe('funky-lamp');
  });

  it('handles special characters', () => {
    expect(generateId('Band Name!')).toBe('band-name');
    expect(generateId('Name & Another')).toBe('name-another');
    expect(generateId('Multiple   Spaces')).toBe('multiple-spaces');
  });

  it('adds suffix for uniqueness', () => {
    expect(generateId('Funky Lamp', '2025-09-01')).toBe('funky-lamp-2025-09-01');
    expect(generateId('Star Viper', '2025-12-01')).toBe('star-viper-2025-12-01');
  });

  it('handles empty suffix', () => {
    expect(generateId('Title', '')).toBe('title');
    expect(generateId('Title', undefined)).toBe('title');
  });

  it('handles mixed case', () => {
    expect(generateId('UPPER CASE')).toBe('upper-case');
    expect(generateId('MiXeD CaSe')).toBe('mixed-case');
  });
});

describe('findDuplicates', () => {
  it('finds duplicate IDs', () => {
    const items = [
      { id: 'a', name: 'First' },
      { id: 'b', name: 'Second' },
      { id: 'a', name: 'Third' },
    ];
    const dups = findDuplicates(items);
    expect(dups.has('a')).toBe(true);
    expect(dups.get('a')).toHaveLength(2);
    expect(dups.has('b')).toBe(false);
  });

  it('returns empty when no duplicates', () => {
    const items = [
      { id: 'a', name: 'First' },
      { id: 'b', name: 'Second' },
    ];
    const dups = findDuplicates(items);
    expect(dups.size).toBe(0);
  });
});
