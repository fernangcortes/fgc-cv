import { useState, useMemo } from 'react';
import { searchMatch } from '../utils/search';
import {
  EXPERIENCE,
  PORTFOLIO_GROUPS,
  SKILLS,
  COURSES,
  EDUCATION,
  AUDIOVISUAL_CONFIG,
} from '../constants';

/**
 * Hook that manages search state and returns filtered versions of all data collections.
 */
export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const hasSearch = searchQuery.trim().length > 0;

  const filteredExperience = EXPERIENCE.filter((exp) =>
    searchMatch(exp, searchQuery),
  );

  const filteredPortfolio = PORTFOLIO_GROUPS.map((g) => ({
    ...g,
    projects: g.projects.filter((p) => searchMatch(p, searchQuery)),
  })).filter((g) => searchMatch(g.category, searchQuery) || g.projects.length > 0);

  const filteredAudiovisual = useMemo(() => {
    return AUDIOVISUAL_CONFIG.map((category) => ({
      ...category,
      filteredData: category.data.filter((item) => searchMatch(item, searchQuery)),
    })).filter((cat) => cat.filteredData.length > 0);
  }, [searchQuery]);

  const audiovisualHasSearch = filteredAudiovisual.length > 0;

  const filteredEducation = EDUCATION.filter((e) => searchMatch(e, searchQuery));

  const filteredSkills = SKILLS.map((g) => ({
    ...g,
    skills: g.skills.filter((s) => searchMatch(s, searchQuery)),
  })).filter((g) => searchMatch(g.category, searchQuery) || g.skills.length > 0);

  const filteredCourses = COURSES.filter((c) => searchMatch(c, searchQuery));

  return {
    searchQuery,
    setSearchQuery,
    hasSearch,
    filteredExperience,
    filteredPortfolio,
    filteredAudiovisual,
    audiovisualHasSearch,
    filteredEducation,
    filteredSkills,
    filteredCourses,
  };
}
