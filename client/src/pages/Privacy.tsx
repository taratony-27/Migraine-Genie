import React from 'react';
import { Box, Container, Link, Typography } from '@mui/material';
import { SITE } from '../config/site';

// Keep this in step with what the app actually stores and sends. Last checked
// against the code on the date below; update both when anything changes.
const LAST_UPDATED = '5 October 2026';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box component="section" mb={4}>
    <Typography variant="h5" component="h2" fontWeight={700} color="primary.main" gutterBottom>
      {title}
    </Typography>
    {children}
  </Box>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.75 }}>
    {children}
  </Typography>
);

const Privacy: React.FC = () => (
  <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
    <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
      Privacy policy
    </Typography>
    <Typography variant="body2" color="text.secondary" mb={5}>
      Last updated {LAST_UPDATED}
    </Typography>

    <Section title="What we collect">
      <P>
        <strong>Your account:</strong> your name and email address, and, if you add them, your date of birth and
        gender.
      </P>
      <P>
        <strong>Your diary:</strong> what you log each day, such as migraine intensity and duration, symptoms, sleep,
        screen time, possible triggers, notes and medications. This is health information, so we only use it to run
        the app for you.
      </P>
      <P>
        We don&apos;t use advertising or analytics trackers, and we don&apos;t sell or share your information for
        marketing.
      </P>
    </Section>

    <Section title="Who handles it">
      <P>
        <strong>Sign-in</strong> is handled by Google Firebase Authentication, which stores your email address and
        password (or your Google sign-in).
      </P>
      <P>
        <strong>Your diary and profile</strong> are stored in our MongoDB database. The app is hosted on Render.
      </P>
      <P>
        <strong>AI features:</strong> when you use the AI assistant or the trigger forecast, your diary entries and
        messages are sent to OpenRouter, which passes them to the AI model that writes the answer. Only use these
        features if you&apos;re comfortable with that.
      </P>
      <P>
        <strong>Wellness videos</strong> are found with the YouTube Data API. Only the search words are sent, not your
        personal details.
      </P>
    </Section>

    <Section title="Not medical advice">
      <P>
        {SITE.name} helps you notice patterns. It doesn&apos;t diagnose or treat anything, and its forecasts and AI
        answers can be wrong. Talk to a doctor about your health, and get urgent care for sudden or unusual symptoms.
      </P>
    </Section>

    <Section title="Your choices">
      <P>
        You can edit your profile on the Account page at any time. Deleting your account there permanently removes your
        profile, your diary, your medications and your saved forecast, and deletes your sign-in.
      </P>
    </Section>

    <Section title="Contact">
      <P>
        Questions or requests: <Link href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</Link>.
      </P>
    </Section>
  </Container>
);

export default Privacy;
