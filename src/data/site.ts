export const siteConfig = {
  name: 'SPARK Community Hub',
  shortName: 'SPARK',
  description:
    'A community-led forum and resource hub for responsible research translation, practical AI skills, and cross-sector collaboration.',
  contactEmail: 'xincwei@umich.edu',
  githubUrl: 'https://github.com/XinCalWEI/spark-schmidt-ais-community-hub',
  status: 'preview' as const,
  lastUpdated: '2026-09-14',
};

export const forumFacts = {
  title: 'SPARK Forum',
  subtitle: 'A Retreat for Responsible Research Translation and Cross-Sector Collaboration',
  status: 'planning' as const,
  dateLabel: 'March 7–12, 2027 (tentative)',
  scheduleNote: 'March 7: participant check-in only. March 8–12: main program.',
  dateIso: null as string | null,
  locationLabel: 'Ann Arbor, Michigan',
  applicationStatus: 'not-open' as const,
  applicationStatusLabel: 'Not yet open — stay tuned.',
  applicationDeadline: null as string | null,
  applicationUrl: null as string | null,
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
  profileUrl: 'https://midas.umich.edu/directory/xin-wei/',
};
