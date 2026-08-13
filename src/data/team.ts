import type { ImageMetadata } from 'astro';
import xinWeiPhoto from '../assets/team/xin-wei.jpg';
import shanshanLiuPhoto from '../assets/team/shanshan-liu.jpeg';
import paigeBowlingPhoto from '../assets/team/paige-bowling.jpg';
import christinSalleyPhoto from '../assets/team/christin-salley.jpeg';
import nathanFoxPhoto from '../assets/team/nathan-fox.jpg';
import eliotMillerPhoto from '../assets/team/eliot-miller.jpeg';

export interface TeamMember {
  name: string;
  initials: string;
  role: string;
  affiliation: string;
  focus: string;
  profileUrl: string;
  photo: ImageMetadata;
  photoPosition: string;
}

/** Organizing team named in the funded SPARK proposal. */
export const organizingTeam: TeamMember[] = [
  {
    name: 'Xin Wei',
    initials: 'XW',
    role: 'Forum lead and lead content organizer',
    affiliation: 'Schmidt AI in Science Fellow · University of Michigan',
    focus: 'AI for geohazards, responsible research translation, and cross-sector collaboration.',
    profileUrl: 'https://midas.umich.edu/directory/xin-wei/',
    photo: xinWeiPhoto,
    photoPosition: 'center',
  },
  {
    name: 'Shanshan Liu',
    initials: 'SL',
    role: 'Content development and logistics',
    affiliation: 'Schmidt AI in Science Fellow · University of Michigan',
    focus: 'AI in transportation engineering, event organization, and cross-sector collaboration.',
    profileUrl: 'https://css.umich.edu/people/post-docs-associates/shanshan-liu',
    photo: shanshanLiuPhoto,
    photoPosition: 'center',
  },
  {
    name: 'Paige Bowling',
    initials: 'PB',
    role: 'Logistics and participant experience',
    affiliation: 'Schmidt AI in Science Fellow · University of Michigan',
    focus: 'Scientific software and method development, event planning, and retreat activities.',
    profileUrl: 'https://lsa.umich.edu/chem/people/post-doctoral-fellows/pbowling.html',
    photo: paigeBowlingPhoto,
    photoPosition: 'top',
  },
  {
    name: 'Christin Salley',
    initials: 'CS',
    role: 'Alumni engagement and workshop design',
    affiliation: 'Schmidt AI in Science Alum · Research Assistant Professor, Virginia Tech',
    focus: 'AI ethics and governance, mentorship, and facilitation of multi-stakeholder convenings.',
    profileUrl: 'https://pitechlab.isce.vt.edu/meet-the-pitech-team/christin-salley-bio.html',
    photo: christinSalleyPhoto,
    photoPosition: 'top',
  },
  {
    name: 'Nathan Fox',
    initials: 'NF',
    role: 'Organizing team member',
    affiliation: 'Schmidt AI in Science Alum · MIDAS AI Scientist, University of Michigan',
    focus: 'AI in science community programming and conference and workshop organization.',
    profileUrl: 'https://midas.umich.edu/directory/nathan-fox/',
    photo: nathanFoxPhoto,
    photoPosition: 'top',
  },
  {
    name: 'Eliot Miller',
    initials: 'EM',
    role: 'Collaborative projects and community activities',
    affiliation: 'Schmidt AI in Science Alum · BirdsPlus Index Manager, American Bird Conservancy',
    focus: 'AI for biodiversity monitoring, conservation decision support, and community-building.',
    profileUrl: 'https://abcbirds.org/staff/eliot-miller/',
    photo: eliotMillerPhoto,
    photoPosition: 'center',
  },
];
