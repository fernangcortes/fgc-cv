/**
 * Barrel file that re-exports all data constants from their domain-specific modules.
 * This preserves backward compatibility — all existing imports from './constants' continue to work.
 */
export { PERSONAL_INFO } from './data/personal';
export { EXPERIENCE } from './data/experience';
export { PORTFOLIO_GROUPS } from './data/portfolio';
export {
  FILMOGRAPHY, MUSIC_VIDEOS, DOCUMENTARIES,
  CINEMA_LONGA, CINEMA_CURTA,
  JORNALISMO_GRANDE_REPORTAGEM, JORNALISMO_REPORTAGEM, JORNALISMO_SERIE,
  INSTITUCIONAL, PROGRAMA_TV,
  TRANSMISSAO_EVENTOS, TRANSMISSAO_SHOWS, TRANSMISSAO_VIDEOAULAS,
  AUDIOVISUAL_CONFIG,
} from './data/audiovisual';
export { COURSES, EDUCATION, SKILLS, PRODUCTIONS } from './data/education';
