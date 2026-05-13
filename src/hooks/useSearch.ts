import { useState, useMemo } from 'react';
import { isMatch } from '../utils/search';
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
    isMatch(exp, searchQuery),
  );

  const filteredPortfolio = PORTFOLIO_GROUPS.map((g) => ({
    ...g,
    projects: g.projects.filter((p) => isMatch(p, searchQuery)),
  })).filter((g) => isMatch(g.category, searchQuery) || g.projects.length > 0);

  const filteredAudiovisual = useMemo(() => {
    return AUDIOVISUAL_CONFIG.map((category) => ({
      ...category,
      filteredData: category.data.filter((item) => isMatch(item, searchQuery)),
    })).filter((cat) => cat.filteredData.length > 0);
  }, [searchQuery]);

  const audiovisualHasSearch = filteredAudiovisual.length > 0;

  const filteredEducation = EDUCATION.filter((e) => isMatch(e, searchQuery));

  const filteredSkills = SKILLS.map((g) => ({
    ...g,
    skills: g.skills.filter((s) => isMatch(s, searchQuery)),
  })).filter((g) => isMatch(g.category, searchQuery) || g.skills.length > 0);

  const filteredCourses = COURSES.filter((c) => isMatch(c, searchQuery));

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
