import { describe, expect, it } from 'vitest';
import { hasConfirmedSchedule, transitionRequiresConfirmedSchedule } from './schedule';

describe('schedule rules', () => {
  describe('hasConfirmedSchedule', () => {
    it('is false when there is no schedule', () => {
      expect(hasConfirmedSchedule(null)).toBe(false);
      expect(hasConfirmedSchedule(undefined)).toBe(false);
    });

    it('is false when the schedule is pending', () => {
      expect(
        hasConfirmedSchedule({ deliveryDate: '2026-03-01', window: 'MORNING', confirmed: false }),
      ).toBe(false);
    });

    it('is true when the schedule is confirmed', () => {
      expect(
        hasConfirmedSchedule({ deliveryDate: '2026-03-01', window: 'MORNING', confirmed: true }),
      ).toBe(true);
    });
  });

  describe('transitionRequiresConfirmedSchedule', () => {
    it('requires confirmation when entering SCHEDULED', () => {
      expect(transitionRequiresConfirmedSchedule('PLANNED', 'SCHEDULED')).toBe(true);
    });

    it('requires confirmation when leaving SCHEDULED', () => {
      expect(transitionRequiresConfirmedSchedule('SCHEDULED', 'IN_TRANSIT')).toBe(true);
    });

    it('does not require confirmation for earlier transitions', () => {
      expect(transitionRequiresConfirmedSchedule('CREATED', 'PLANNED')).toBe(false);
    });
  });
});
