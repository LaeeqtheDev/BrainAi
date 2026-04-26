export const BREATHING_PATTERNS = [
    {
      key: 'box',
      name: 'Box Breathing',
      description: 'Equal counts in, hold, out, hold. Calms the nervous system.',
      cycle: [
        { phase: 'Breathe in', duration: 4000, scaleTo: 1.3 },
        { phase: 'Hold',       duration: 4000, scaleTo: 1.3 },
        { phase: 'Breathe out',duration: 4000, scaleTo: 0.7 },
        { phase: 'Hold',       duration: 4000, scaleTo: 0.7 },
      ],
    },
    {
      key: '478',
      name: '4-7-8 Calming',
      description: 'Inhale 4, hold 7, exhale 8. Eases anxiety quickly.',
      cycle: [
        { phase: 'Breathe in', duration: 4000, scaleTo: 1.3 },
        { phase: 'Hold',       duration: 7000, scaleTo: 1.3 },
        { phase: 'Breathe out',duration: 8000, scaleTo: 0.7 },
      ],
    },
    {
      key: 'simple',
      name: 'Simple 4-4',
      description: 'Inhale 4, exhale 4. A gentle reset.',
      cycle: [
        { phase: 'Breathe in', duration: 4000, scaleTo: 1.3 },
        { phase: 'Breathe out',duration: 4000, scaleTo: 0.7 },
      ],
    },
  ];