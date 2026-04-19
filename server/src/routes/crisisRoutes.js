const express = require('express');
const router = express.Router();

// GET /api/crisis/hotlines - Get crisis hotline numbers (Pakistan)
router.get('/hotlines', (req, res) => {
  const hotlines = [
    {
      name: 'Pakistan Mental Health Helpline',
      number: '0800-00-088',
      description: '24/7 free mental health support',
      language: 'Urdu, English',
    },
    {
      name: 'Umang Mental Health Helpline',
      number: '0311-7786264',
      description: 'Professional counseling support',
      language: 'Urdu, English',
    },
    {
      name: 'Rozan - Emotional Support Helpline',
      number: '0800-22444',
      description: 'Free psychological first aid',
      language: 'Urdu, English',
    },
    {
      name: 'Heart & Soul - Crisis Intervention',
      number: '042-35761999',
      description: 'Lahore-based mental health support',
      language: 'Urdu, English, Punjabi',
    },
  ];

  res.json({
    success: true,
    data: hotlines,
    emergency: {
      message: 'If you are in immediate danger, please call:',
      number: '1122',
      description: 'Pakistan Emergency Services',
    },
  });
});

// GET /api/crisis/resources - Professional help resources
router.get('/resources', (req, res) => {
  const resources = {
    therapists: [
      {
        name: 'Willing Ways Psychiatric Rehab',
        location: 'Lahore, Pakistan',
        phone: '042-35761999',
        services: ['Depression', 'Anxiety', 'PTSD', 'Addiction'],
      },
      {
        name: 'Fountain House',
        location: 'Lahore, Pakistan',
        phone: '042-35913943',
        services: ['Psychiatric care', 'Rehabilitation', 'Counseling'],
      },
    ],
    onlineSupport: [
      {
        name: 'PsychologistPK',
        website: 'https://psychologistpk.com',
        description: 'Online therapy sessions',
      },
      {
        name: 'Sehat Kahani',
        website: 'https://sehatkahani.com',
        description: 'Telemedicine & mental health',
      },
    ],
    selfHarmPrevention: {
      message: 'If you are having thoughts of self-harm:',
      steps: [
        'Call a helpline immediately',
        'Tell someone you trust',
        'Remove any means of harm',
        'Go to a safe place',
        'Reach out to a professional',
      ],
    },
  };

  res.json({
    success: true,
    data: resources,
  });
});

module.exports = router;