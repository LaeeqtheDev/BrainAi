require('dotenv').config();
const { db } = require('../src/config/firebase');

const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  lastUpdated: 'April 2026',
  sections: [
    {
      heading: 'Your Privacy Matters',
      body: 'No judgment. Your data stays secure and private. We use encryption to protect your conversations and journal entries.',
    },
    {
      heading: 'Data We Collect',
      body: 'We collect: mood logs, AI chat history, journal entries, and wellness activity usage. We never collect data you do not knowingly enter.',
    },
    {
      heading: 'How We Protect Your Data',
      body: 'All data is stored on Google Firestore with encryption in transit and at rest. We never share your information with third parties. Conversations stay between you and the AI companion.',
    },
    {
      heading: 'Your Rights',
      body: 'You can export all your data at any time from Settings → Data & Storage. You can permanently delete your account and all associated data with one tap.',
    },
    {
      heading: 'AI & Analytics',
      body: 'Anonymous usage analytics help us improve the app. You can disable this from Settings → Privacy & Security. AI conversations use Groq for processing — no message is stored by Groq once a response is generated.',
    },
    {
      heading: 'Contact',
      body: 'Questions? Email support@stillwater.app',
    },
  ],
};

const HELP_SUPPORT = {
  title: 'Help & Support',
  faqs: [
    {
      question: 'How does the AI chatbot work?',
      answer: 'Our AI uses advanced language understanding to detect your emotions and provide warm, personalized support. It references your recent moods and journal entries to give context-aware replies.',
    },
    {
      question: 'Is my data private?',
      answer: 'Yes. Everything is encrypted and stored securely. We never share your information.',
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes — go to Settings → Data & Storage → Export My Data. You will get a JSON file with everything.',
    },
    {
      question: 'What if I am in crisis?',
      answer: 'The chatbot detects crisis language and shows emergency resources immediately. In Pakistan, you can call Umang at 0311-7786264 or emergency services at 1122.',
    },
    {
      question: 'How do I delete my account?',
      answer: 'Settings → Data & Storage → Delete Account. This is permanent and removes all your data.',
    },
  ],
  contact: {
    email: 'support@stillwater.app',
    whatsapp: '+923000000000',
    university: 'University of Lahore',
    department: 'Department of CS & IT',
  },
};

(async () => {
  try {
    await db.collection('appContent').doc('privacyPolicy').set(PRIVACY_POLICY);
    await db.collection('appContent').doc('helpSupport').set(HELP_SUPPORT);
    console.log('✓ App content seeded');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();