import { formatDate } from '../lib/dates';

const applicationDeadline = '2026-12-15';

export const siteConfig = {
  name: 'SPARK Community Hub',
  shortName: 'SPARK',
  description:
    'A community-led forum and resource hub for responsible research translation, practical AI skills, and cross-sector collaboration.',
  contactEmail: 'xincwei@umich.edu',
  githubUrl: 'https://github.com/XinCalWEI/spark-schmidt-ais-community-hub',
  status: 'preview' as const,
  lastUpdated: '2026-11-09',
};

export const forumFacts = {
  title: 'SPARK Forum',
  subtitle: 'A Retreat for Responsible Research Translation and Cross-Sector Collaboration',
  status: 'planning' as const,
  dateLabel: 'March 8–12, 2027',
  scheduleNote: 'March 7: participant check-in only. March 8–12: main program.',
  dateIso: '2027-03-08',
  locationLabel: 'Ann Arbor, Michigan',
  applicationStatus: 'open' as const,
  applicationStatusLabel: 'Open — apply now',
  applicationDeadline,
  applicationDeadlineLabel: formatDate(new Date(applicationDeadline), { month: 'long' }),
  applicationUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdDVU6HTpwYwOiAV17agLwG-95dQOKpl6_pewkhxAQT-P-rDg/viewform?usp=dialog',
};

export const affiliationNote =
  'SPARK is a community-led initiative organized by current and alumni Schmidt AI in Science Fellows. It is not an official Schmidt Sciences website.';

export const fundingProgram =
  'Schmidt Sciences AI in Science Fellowship Community Initiatives Fund';

export const fundingAcknowledgement =
  `The SPARK Forum is supported by the ${fundingProgram}.`;

export const websiteCreator = {
  name: 'Dr. Xin Wei',
  affiliation: 'MIDAS, University of Michigan',
  profileUrl: 'https://xincalwei.github.io/',
};
