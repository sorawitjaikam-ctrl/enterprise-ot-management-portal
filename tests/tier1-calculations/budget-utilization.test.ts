import { describe, it, expect } from 'vitest';

describe('Tier 1: Department Budget Utilization & Threshold Logic', () => {
  const DEFAULT_BUDGET_MAX = 150000;
  const DEFAULT_OT_RATE = 300;

  const calculateBudgetMetrics = (otHours: number, budgetMax = DEFAULT_BUDGET_MAX, otRate = DEFAULT_OT_RATE) => {
    const budgetUsed = otHours * otRate;
    const budgetUtilization = Math.min(100, Math.round((budgetUsed / budgetMax) * 100));
    const status: 'Warning' | 'On Track' = budgetUtilization > 95 ? 'Warning' : 'On Track';
    return { budgetUsed, budgetUtilization, status };
  };

  it('T1.4.1: Calculates budgetUsed accurately from OT hours and hourly rate', () => {
    const metrics = calculateBudgetMetrics(100);
    // 100 hrs * 300 THB/hr = 30,000 THB
    expect(metrics.budgetUsed).toBe(30000);
    expect(metrics.budgetUtilization).toBe(20);
    expect(metrics.status).toBe('On Track');
  });

  it('T1.4.2: Flags status as "Warning" when utilization exceeds 95%', () => {
    // 480 hrs * 300 = 144,000 THB -> (144000 / 150000) * 100 = 96%
    const metrics = calculateBudgetMetrics(480);
    expect(metrics.budgetUsed).toBe(144000);
    expect(metrics.budgetUtilization).toBe(96);
    expect(metrics.status).toBe('Warning');
  });

  it('T1.4.3: Caps budgetUtilization at 100% when budget is exceeded', () => {
    // 600 hrs * 300 = 180,000 THB (> 150,000 THB limit)
    const metrics = calculateBudgetMetrics(600);
    expect(metrics.budgetUsed).toBe(180000);
    expect(metrics.budgetUtilization).toBe(100);
    expect(metrics.status).toBe('Warning');
  });

  it('T1.4.4: Correctly handles 0 hours boundary with 0% utilization and "On Track"', () => {
    const metrics = calculateBudgetMetrics(0);
    expect(metrics.budgetUsed).toBe(0);
    expect(metrics.budgetUtilization).toBe(0);
    expect(metrics.status).toBe('On Track');
  });

  it('T1.4.5: Exact 95% boundary remains "On Track"', () => {
    // 475 hrs * 300 = 142,500 THB -> (142500 / 150000) * 100 = 95%
    const metrics = calculateBudgetMetrics(475);
    expect(metrics.budgetUsed).toBe(142500);
    expect(metrics.budgetUtilization).toBe(95);
    expect(metrics.status).toBe('On Track');
  });

  it('T1.4.6: Supports custom departmental budget ceilings and rates', () => {
    const customBudgetMax = 200000;
    const customOtRate = 250;
    // 400 hrs * 250 = 100,000 THB -> (100000 / 200000) * 100 = 50%
    const metrics = calculateBudgetMetrics(400, customBudgetMax, customOtRate);
    expect(metrics.budgetUsed).toBe(100000);
    expect(metrics.budgetUtilization).toBe(50);
    expect(metrics.status).toBe('On Track');
  });
});
