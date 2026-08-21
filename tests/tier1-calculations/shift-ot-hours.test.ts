import { describe, it, expect } from 'vitest';
import { getShiftOtHours } from '../../src/App';

describe('Tier 1: Shift OT Hours Extraction Engine (getShiftOtHours)', () => {
  it('T1.1.1: Standard 8-hour shifts (M8, A8, N8) return exactly 0 OT hours', () => {
    expect(getShiftOtHours('M8')).toBe(0);
    expect(getShiftOtHours('A8')).toBe(0);
    expect(getShiftOtHours('N8')).toBe(0);
  });

  it('T1.1.2: 12-hour shifts (M12, A12, N12) return exactly 4 OT hours (12 - 8 = 4)', () => {
    expect(getShiftOtHours('M12')).toBe(4);
    expect(getShiftOtHours('A12')).toBe(4);
    expect(getShiftOtHours('N12')).toBe(4);
  });

  it('T1.1.3: 16-hour shifts (M16, N16) return exactly 8 OT hours (16 - 8 = 8)', () => {
    expect(getShiftOtHours('M16')).toBe(8);
    expect(getShiftOtHours('N16')).toBe(8);
  });

  it('T1.1.4: On-Duty shift (OND) explicitly returns exactly 8 OT hours', () => {
    expect(getShiftOtHours('OND')).toBe(8);
  });

  it('T1.1.5: Rest, anchor, and off codes (OFF, O, D) return exactly 0 OT hours', () => {
    expect(getShiftOtHours('OFF')).toBe(0);
    expect(getShiftOtHours('O')).toBe(0);
    expect(getShiftOtHours('D')).toBe(0);
  });

  it('T1.1.6: Custom dynamic number suffix shifts correctly compute Math.max(0, hours - 8)', () => {
    expect(getShiftOtHours('S10')).toBe(2);
    expect(getShiftOtHours('SHIFT14')).toBe(6);
    expect(getShiftOtHours('X4')).toBe(0); // 4-8 = -4 -> max(0, -4) = 0
    expect(getShiftOtHours('20')).toBe(12); // 20 - 8 = 12
  });

  it('T1.1.7: Invalid codes, empty strings, and nullish values safely return 0 OT hours', () => {
    expect(getShiftOtHours('')).toBe(0);
    expect(getShiftOtHours('UNKNOWN')).toBe(0);
    expect(getShiftOtHours('INVALID_CODE')).toBe(0);
    expect(getShiftOtHours('ABC')).toBe(0);
  });
});
