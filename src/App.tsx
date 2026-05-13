import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Mail,
  Phone,
  ExternalLink,
  Github,
  Terminal,
  Camera,
  Clapperboard,
  GraduationCap,
  Cpu,
  Printer,
  BookOpen,
  Award,
  User,
  Code,
  Moon,
  Sun,
  Compass,
} from "lucide-react";
import {
  PERSONAL_INFO,
  EXPERIENCE,
  PORTFOLIO_GROUPS,
  SKILLS,
  COURSES,
  EDUCATION,
  PRODUCTIONS,
  AUDIOVISUAL_CONFIG,
} from "./constants";
import { ExperienceItem, ProjectEntry, ProjectGroup, FilmEntry, EducationEntry, CourseEntry, SkillCategory, ProductionCategory } from './types';
import SkillBadge from "./components/SkillBadge";
import Section from "./components/Section";
import ExperienceCard from "./components/ExperienceCard";
import SkillsChart from "./components/SkillsChart";
import ProductionsTabs from "./components/ProductionsTabs";
import DevOrganizer from "./components/DevOrganizer";
import AudiovisualSection from "./components/AudiovisualSection";
import AIPitchAgent from "./components/AIPitchAgent";
import { GuidedTour } from "./components/GuidedTour";
import { WorkItem, Category } from "./types";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./lib/firebase";
import { isMatch } from "./utils/search";

type TabId =
  | "visao-geral"
  | "experiencia"
  | "audiovisual"
  | "laboratorio"
  | "formacao"
  | "dev";

interface TabDefinition {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDefinition[] = [
  {
    id: "visao-geral",
    label: "Visão Geral & Skills",
    icon: <User className="w-3.5 h-3.5" />,
  },
  {
    id: "experiencia",
    label: "Experiência & Produção",
    icon: <Camera className="w-3.5 h-3.5" />,
  },
  {
    id: "audiovisual",
    label: "Audiovisual",
    icon: <Clapperboard className="w-3.5 h-3.5" />,
  },
  {
    id: "laboratorio",
    label: "Laboratório & Dev",
    icon: <Code className="w-3.5 h-3.5" />,
  },
  {
    id: "formacao",
    label: "Formação",
    icon: <GraduationCap className="w-3.5 h-3.5" />,
  },
  {
    id: "dev",
    label: "Dev Organizer",
    icon: <Terminal className="w-3.5 h-3.5" />,
  },
];

// Search utilities imported from ./utils/search

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showPrintHint, setShowPrintHint] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    return (sessionStorage.getItem("activeTab") as TabId) || "visao-geral";
  });

  useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);
  const [audiovisualSubTab, setAudiovisualSubTab] = useState("todos");
  const [audiovisualSortMode, setAudiovisualSortMode] = useState<
    "all" | "recent" | "old" | "type" | "role"
  >("all");
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [runTour, setRunTour] = useState(false);

  const [dbWorks, setDbWorks] = useState<WorkItem[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  useEffect(() => {
    const unsubWorks = onSnapshot(collection(db, "works"), (snap) =>
      setDbWorks(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as WorkItem)),
    );
    const unsubCats = onSnapshot(collection(db, "categories"), (snap) =>
      setDbCategories(
        snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Category),
      ),
    );
    return () => {
      unsubWorks();
      unsubCats();
    };
  }, []);

  const filteredExperience = EXPERIENCE.filter((exp) =>
    isMatch(exp, searchQuery),
  );
  const filteredPortfolio = PORTFOLIO_GROUPS.map((g) => ({
    ...g,
    projects: g.projects.filter((p) => isMatch(p, searchQuery)),
  })).filter((g) => isMatch(g.category, searchQuery) || g.projects.length > 0);
  
  const filteredAudiovisual = useMemo(() => {
    return AUDIOVISUAL_CONFIG.map(category => ({
      ...category,
      filteredData: category.data.filter(item => isMatch(item, searchQuery))
    })).filter(cat => cat.filteredData.length > 0);
  }, [searchQuery]);

  const audiovisualHasSearch = filteredAudiovisual.length > 0;

  const filteredEducation = EDUCATION.filter((e) => isMatch(e, searchQuery));
  const filteredSkills = SKILLS.map((g) => ({
    ...g,
    skills: g.skills.filter((s) => isMatch(s, searchQuery)),
  })).filter((g) => isMatch(g.category, searchQuery) || g.skills.length > 0);
  const filteredCourses = COURSES.filter((c) => isMatch(c, searchQuery));

  const worksInResume = dbWorks.filter((w) => w.inResume);
  const dbUniqueCategories = Array.from(
    new Set(
      worksInResume.flatMap((w) =>
        w.category ? w.category.split(",").map((c) => c.trim()).filter(Boolean) : []
      )
    )
  ).sort();

  const dbUniqueGroups = Array.from(
    new Set(
      worksInResume.flatMap((w) =>
        w.group ? w.group.split(",").map((g) => g.trim()).filter(Boolean) : []
      )
    )
  ).sort();

  const hasSearch = searchQuery.trim().length > 0;

  const handlePrint = () => {
    window.print();
    setShowPrintHint(true);
    setTimeout(() => setShowPrintHint(false), 4000);
  };

  return (
    <div className="min-h-screen relative bg-[#faf9f6] dark:bg-[#050505] text-stone-600 dark:text-zinc-300 selection:bg-stone-200 dark:bg-zinc-700 dark:selection:bg-emerald-900/40 selection:text-stone-900 dark:text-white dark:selection:text-emerald-200 print:bg-white print:text-black">
      <GuidedTour run={runTour} onFinish={() => setRunTour(false)} />
      <div className="fixed inset-0 pointer-events-none bg-grid opacity-[0.03] dark:opacity-[0.05] z-0 print:hidden"></div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 print:py-0 print:px-0 print:max-w-full">
        {/* Header Section */}
        <header className="mb-10 print:mb-8">
          <div className="border border-stone-200 dark:border-white/10 bg-white dark:bg-zinc-900/80 p-8 md:p-12 backdrop-blur-sm relative shadow-sm rounded-xl print:border-0 print:bg-transparent print:p-0 print:shadow-none print:rounded-none">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-stone-400 via-stone-600 to-stone-400 opacity-20 print:hidden rounded-t-xl"></div>

            <div className="flex flex-col md:flex-row justify-between gap-8 print:block">
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 dark:text-white tracking-tighter mb-4 uppercase print:text-4xl leading-tight">
                  {PERSONAL_INFO.name}
                </h1>

                <div className="flex flex-wrap gap-2 md:gap-4 mb-5 text-[17px] leading-[17px] font-mono text-stone-500 dark:text-zinc-400 print:mb-4 print:text-stone-800 dark:text-zinc-100">
                  {PERSONAL_INFO.roles.map((role, idx) => (
                    <React.Fragment key={idx}>
                      <span
                        className={`${idx === 0 ? "text-stone-800 dark:text-zinc-100 font-bold" : ""} mt-0 py-0`}
                      >
                        {role}
                      </span>
                      {idx < PERSONAL_INFO.roles.length - 1 && (
                        <span className="text-stone-300 hidden md:inline print:inline print:text-stone-400 dark:text-zinc-500 py-0">
                          |
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm font-medium text-stone-600 dark:text-zinc-300 print:text-xs">
                  <a
                    href={`mailto:${PERSONAL_INFO.email}`}
                    className="flex items-center gap-2 hover:text-stone-900 dark:hover:text-white transition-colors group"
                  >
                    <Mail className="w-4 h-4 text-stone-400 dark:text-zinc-500 group-hover:text-stone-800 dark:hover:text-zinc-100 print:w-3 print:h-3 print:text-black" />
                    {PERSONAL_INFO.email}
                  </a>
                  <a
                    href={`https://wa.me/5562981899522`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-stone-900 dark:hover:text-white transition-colors group"
                  >
                    <Phone className="w-4 h-4 text-stone-400 dark:text-zinc-500 group-hover:text-stone-800 dark:hover:text-zinc-100 print:w-3 print:h-3 print:text-black" />
                    {PERSONAL_INFO.phone}
                  </a>
                </div>
              </div>

              {/* Action Buttons - Hidden on Print */}
              <div className="flex flex-wrap gap-3 shrink-0 print:hidden mt-4 md:mt-0 relative z-50 pointer-events-auto items-start">
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setRunTour(false);
                      setTimeout(() => setRunTour(true), 10);
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-stone-900 dark:bg-zinc-950 text-white hover:bg-black transition-colors shadow-sm cursor-pointer select-none active:bg-stone-800 dark:bg-zinc-200 rounded-lg dark:border dark:border-white/5"
                    aria-label="Tour Guiado"
                  >
                    <Compass className="w-5 h-5 text-emerald-400" />
                  </button>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 dark:bg-zinc-200 dark:bg-zinc-800 text-white dark:text-zinc-200 border dark:border-white/10 text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    Tour Guiado
                  </div>
                </div>

                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="w-10 h-10 flex items-center justify-center bg-stone-900 dark:bg-zinc-950 text-white hover:bg-black transition-colors shadow-sm cursor-pointer select-none active:bg-stone-800 dark:bg-zinc-200 rounded-lg dark:border dark:border-white/5"
                    aria-label="Alternar Tema Escuro"
                  >
                    {isDarkMode ? <Sun className="w-5 h-5 text-zinc-300" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 dark:bg-zinc-200 dark:bg-zinc-800 text-white dark:text-zinc-200 border dark:border-white/10 text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    Tema
                  </div>
                </div>

                <div className="relative group">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePrint();
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-stone-900 dark:bg-zinc-950 text-white hover:bg-black transition-colors shadow-sm cursor-pointer select-none active:bg-stone-800 dark:bg-zinc-200 rounded-lg"
                    aria-label="Imprimir / PDF"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 dark:bg-zinc-200 text-white dark:text-zinc-900 text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    Imprimir / PDF
                  </div>
                  {showPrintHint && (
                    <div className="absolute top-full mt-2 right-0 bg-red-50 border border-red-100 text-red-600 text-[10px] md:text-xs p-2 rounded shadow-sm text-right whitespace-nowrap z-[60] animate-in fade-in zoom-in duration-300">
                      Se não abrir, use <strong>Ctrl + P</strong>
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <a
                    href={PERSONAL_INFO.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center border border-stone-200 dark:border-white/10 text-stone-600 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 hover:text-stone-900 dark:hover:text-white transition-colors bg-white dark:bg-zinc-900/60 backdrop-blur-md shadow-sm rounded-lg"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 dark:bg-zinc-200 text-white dark:text-zinc-900 text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    GitHub
                  </div>
                </div>

                {PERSONAL_INFO.links.certificates && (
                  <div className="relative group">
                    <a
                      href={PERSONAL_INFO.links.certificates}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center border border-stone-200 dark:border-white/10 text-stone-600 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800/50 hover:text-stone-900 dark:hover:text-white transition-colors bg-white dark:bg-zinc-900/60 backdrop-blur-md shadow-sm rounded-lg"
                      aria-label="Certificados"
                    >
                      <Award className="w-5 h-5" />
                    </a>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 dark:bg-zinc-200 text-white dark:text-zinc-900 text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                      Certificados
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden print:block mt-6 text-xs font-mono text-stone-600 dark:text-zinc-300 border-t border-stone-200 dark:border-white/10 pt-4">
                <div className="flex flex-col gap-1">
                  <a
                    href={PERSONAL_INFO.links.github}
                    className="flex items-center gap-2 text-stone-900 dark:text-white no-underline"
                  >
                    <span className="font-bold">GitHub:</span>{" "}
                    {PERSONAL_INFO.links.github}
                  </a>

                  {PERSONAL_INFO.links.certificates && (
                    <a
                      href={PERSONAL_INFO.links.certificates}
                      className="flex items-center gap-2 text-stone-900 dark:text-white no-underline"
                    >
                      <span className="font-bold">Certificados:</span>{" "}
                      {PERSONAL_INFO.links.certificates}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 relative max-w-xl mx-auto print:hidden tour-step-search">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por competência, empresa, projeto..."
                className="w-full bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-stone-600 dark:text-zinc-300 placeholder:text-stone-400 dark:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>
            {hasSearch && (
              <p className="text-xs text-center text-emerald-600 mt-2">
                Filtrando o currículo completo por "{searchQuery}". As abas
                foram desativadas temporariamente.
              </p>
            )}
          </div>
        </header>

        {/* Tabs Navigation */}
        {!hasSearch && (
          <div className="mb-10 print:hidden overflow-x-auto pb-4 hide-scrollbar tour-step-tabs">
            <div className="flex items-center gap-1 md:gap-2 min-w-max border-b border-stone-200 dark:border-white/10 pb-px">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] leading-[12px] rounded-t-lg transition-all duration-200 relative ${
                    activeTab === tab.id
                      ? "text-stone-900 dark:text-white bg-white dark:bg-zinc-900/60 backdrop-blur-md border-t border-l border-r border-stone-200 dark:border-white/10 z-10 font-bold"
                      : "text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800/50 border-t border-l border-r border-transparent font-normal"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute -bottom-px left-0 w-full h-px bg-white dark:bg-zinc-900/60 backdrop-blur-md"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="bg-white dark:bg-zinc-900/60 backdrop-blur-md p-6 md:p-10 rounded-xl border border-stone-200 dark:border-white/10 shadow-sm print:border-0 print:shadow-none print:bg-transparent print:p-0">
          {/* Tab: Visão Geral */}
          {(!hasSearch
            ? activeTab === "visao-geral"
            : filteredSkills.length > 0) && (
            <div className="space-y-12 animate-in fade-in duration-500 print:block">
              {/* Summary */}
              {!hasSearch && (
                <div className="flex flex-col gap-3">
                  <p className="text-lg md:text-xl leading-relaxed text-stone-600 dark:text-zinc-300 font-light border-l-4 border-emerald-500/30 pl-6 italic print:text-base print:text-black">
                    "{PERSONAL_INFO.summary}"
                  </p>
                  
                  {isSummaryExpanded && PERSONAL_INFO.extendedSummary && (
                    <div className="mt-4 text-stone-600 dark:text-zinc-300 space-y-4 text-base md:text-lg pl-6 border-l-4 border-transparent animate-in slide-in-from-top-2 fade-in duration-300">
                      {PERSONAL_INFO.extendedSummary.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  {PERSONAL_INFO.extendedSummary && (
                    <button
                      onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                      className="text-emerald-600 dark:text-emerald-400 font-medium text-sm md:text-base hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors self-start ml-6 mt-2 print:hidden focus:outline-none"
                    >
                      {isSummaryExpanded ? "Mostrar menos" : "Saber mais..."}
                    </button>
                  )}
                </div>
              )}

              {/* Skills */}
              {filteredSkills.length > 0 && (
                <Section
                  title="Competências & Habilidades"
                  icon={<Cpu className="w-5 h-5" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 print:block print:space-y-6">
                    {!hasSearch && (
                      <div>
                        <SkillsChart isDarkMode={isDarkMode} />
                      </div>
                    )}
                    <div className={`space-y-8 print:space-y-4 ${hasSearch ? 'col-span-1 md:col-span-2' : ''}`}>
                      {filteredSkills.map((cat, idx) => (
                        <div key={idx} className="print:break-inside-avoid">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-500 mb-2 font-mono print:text-black">
                            {cat.category}
                          </h4>
                          {cat.description && (
                            <p className="text-sm text-stone-500 dark:text-zinc-400 mb-4 leading-relaxed print:text-black">
                              {cat.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {cat.skills.map((skill) => (
                              <SkillBadge key={skill.name} name={skill.name} tooltip={skill.tooltip} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* Tab: Experiência */}
          {(!hasSearch
            ? activeTab === "experiencia"
            : filteredExperience.length > 0) && (
            <div className="space-y-12 animate-in fade-in duration-500 print:block">
              <Section
                title="Experiência Profissional"
                icon={<Camera className="w-5 h-5" />}
              >
                <div className="flex flex-col">
                  {filteredExperience.map((item) => (
                    <ExperienceCard key={item.id} data={item} />
                  ))}
                </div>

                {!hasSearch && (
                  <div className="mt-16 print:mt-10 print:break-inside-avoid bg-stone-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-stone-100 dark:border-white/5">
                    <h3 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white border-b-2 border-stone-200 dark:border-white/10 pb-3 mb-4">
                      Detalhamento de Produções e Eventos
                    </h3>
                    <p className="text-stone-500 dark:text-zinc-400 mb-8 print:text-black">
                      Visão estruturada dos principais programas institucionais,
                      festivais e projetos de inovação dirigidos e operados
                      tecnicamente.
                    </p>
                    <ProductionsTabs />
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* Tab: Laboratório */}
          {(!hasSearch
            ? activeTab === "laboratorio"
            : filteredPortfolio.length > 0) && (
            <div className="animate-in fade-in duration-500 print:block">
              <Section
                title="Desenvolvimento Web & Laboratório"
                icon={<Terminal className="w-5 h-5" />}
              >
                <p className="text-stone-500 dark:text-zinc-400 mb-10 text-lg leading-relaxed max-w-3xl print:text-black">
                  Projetos de software, plataformas web, ferramentas de
                  automação e iniciativas P&D que integram audiovisual com
                  gestão e Inteligência Artificial.
                </p>

                <div className="space-y-16 print:space-y-10">
                  {filteredPortfolio.map((group, gIdx) => (
                    <div key={gIdx} className="print:break-inside-avoid">
                      <h3 className="text-2xl font-bold text-stone-800 dark:text-zinc-100 mb-6 flex items-center gap-3">
                        <div className="w-6 h-1 bg-emerald-500 rounded-full"></div>
                        {group.category}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
                        {group.projects.map((project, idx) => (
                          <div key={idx} className="flex h-full">
                            <a
                              href={project.url || "#"}
                              target={project.url ? "_blank" : undefined}
                              rel={
                                project.url ? "noopener noreferrer" : undefined
                              }
                              className={`group flex flex-col bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200 dark:border-white/10 rounded-xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 w-full print:border-stone-300 dark:border-zinc-600 print:shadow-none print:p-4 ${project.url ? "cursor-pointer no-underline block hover:-translate-y-1" : "cursor-default"}`}
                              onClick={(e) => {
                                if (!project.url) e.preventDefault();
                              }}
                            >
                              <div className="flex justify-between items-start mb-4 gap-2">
                                <h4 className="text-lg font-bold text-stone-900 dark:text-white group-hover:text-emerald-700 transition-colors print:text-black leading-tight">
                                  {project.name}
                                </h4>
                                {project.year && (
                                  <span className="shrink-0 text-xs font-mono text-stone-500 dark:text-zinc-400 border border-stone-100 dark:border-white/5 bg-stone-50 dark:bg-zinc-800/50 px-2 py-1 rounded-md print:border-stone-300 dark:border-zinc-600">
                                    {project.year}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-stone-600 dark:text-zinc-300 leading-relaxed flex-grow print:text-black mb-6">
                                {project.description}
                              </p>

                              <div className="mt-auto flex items-end justify-between w-full">
                                <div className="flex flex-wrap gap-2">
                                  {project.badges?.map((badge, bIdx) => (
                                    <span
                                      key={bIdx}
                                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                                        badge === "P&D"
                                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                                          : badge === "Live"
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            : badge === "IA"
                                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                                              : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 border border-stone-200 dark:border-white/10"
                                      }`}
                                    >
                                      {badge}
                                    </span>
                                  ))}
                                </div>
                                {project.url && (
                                  <ExternalLink className="w-4 h-4 text-stone-300 group-hover:text-emerald-500 transition-colors print:hidden shrink-0 ml-2" />
                                )}
                              </div>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* Tab: Formação */}
          {(!hasSearch
            ? activeTab === "formacao"
            : filteredEducation.length > 0 || filteredCourses.length > 0) && (
            <div className="space-y-16 animate-in fade-in duration-500 print:block">
              {/* Education */}
              {filteredEducation.length > 0 && (
                <Section
                  title="Formação Acadêmica"
                  icon={<GraduationCap className="w-5 h-5" />}
                >
                  <div className="flex flex-col">
                    {filteredEducation.map((edu, idx) => (
                      <div
                        key={idx}
                        className="relative pl-8 md:pl-0 pb-12 last:pb-0 group md:flex transition-all duration-300 print:block print:pb-6 print:pl-0"
                      >
                        {/* Mobile Timeline Line */}
                        <div className="absolute left-[3px] top-[14px] bottom-0 w-[2px] bg-stone-200 dark:bg-zinc-700 group-hover:bg-emerald-300/80 transition-colors duration-500 md:hidden group-last:bg-gradient-to-b group-last:from-stone-200 group-last:to-transparent group-hover:group-last:from-emerald-300 print:hidden"></div>
                        
                        {/* Mobile Dot */}
                        <div className="absolute -left-[2px] top-2 w-[12px] h-[12px] bg-white dark:bg-zinc-900/60 backdrop-blur-md border-2 border-stone-300 dark:border-zinc-600 rounded-full group-hover:border-emerald-500 group-hover:scale-125 transition-all duration-300 shadow-sm md:hidden z-10 print:hidden"></div>
                        
                        {/* Desktop Column: Period & Timeline Line */}
                        <div className="hidden md:block w-48 shrink-0 relative pr-10 text-right mt-1 print:hidden">
                          <div className="absolute right-0 top-[24px] bottom-[-3rem] w-[2px] bg-stone-200 dark:bg-zinc-700 group-hover:bg-emerald-300/80 transition-colors duration-500 group-last:bg-gradient-to-b group-last:from-stone-200 group-last:to-transparent group-hover:group-last:from-emerald-300"></div>
                          <div className="absolute -right-[5px] top-[9px] w-[12px] h-[12px] bg-white dark:bg-zinc-900/60 backdrop-blur-md border-2 border-stone-300 dark:border-zinc-600 rounded-full group-hover:border-emerald-500 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-all duration-300 z-10 ring-4 ring-white dark:ring-[#050505]"></div>
                          
                          <span className="inline-block font-mono text-sm text-stone-500 dark:text-zinc-400 font-medium bg-white dark:bg-zinc-900/60 backdrop-blur-md group-hover:bg-emerald-50/50 group-hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg shadow-sm border border-stone-200 dark:border-white/10 relative z-10">
                            {edu.period}
                          </span>
                        </div>

                        <div className="flex-1 md:pl-10">
                          {/* Mobile Period */}
                          <span className="inline-block md:hidden mb-2 mt-1 font-mono text-xs text-stone-500 dark:text-zinc-400 font-medium bg-white dark:bg-zinc-900/60 backdrop-blur-md group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors px-2 py-1 rounded shadow-sm border border-stone-200 dark:border-white/10 relative z-10 print:inline-block print:mb-2 print:mt-0 print:border-none print:shadow-none print:px-0 print:text-sm">
                            {edu.period}
                          </span>

                          <div className="bg-white/40 dark:bg-zinc-900/40 p-5 rounded-xl border border-stone-100/50 dark:border-zinc-800/50 hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-colors print:p-0 print:border-none print:bg-transparent">
                            {edu.url ? (
                              <a
                                href={edu.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-stone-900 dark:text-white font-bold text-lg hover:text-emerald-700 transition-colors cursor-pointer no-underline print:text-black mb-1"
                              >
                                {edu.degree}
                                <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity print:hidden" />
                              </a>
                            ) : (
                              <h3 className="text-stone-900 dark:text-white font-bold text-lg group-hover:text-emerald-700 transition-colors print:text-black mb-1">
                                {edu.degree}
                              </h3>
                            )}
                            <div className="text-stone-600 dark:text-zinc-300 font-medium text-base">
                              {edu.institution}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Courses */}
              {filteredCourses.length > 0 && (
                <Section
                  title="Cursos e Capacitações"
                  icon={<BookOpen className="w-5 h-5" />}
                >
                  {!hasSearch && (
                    <div className="mb-8 print:hidden">
                      <a
                        href={PERSONAL_INFO.links.certificates}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-zinc-200 bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-white/10 px-4 py-2 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-700 hover:text-stone-900 dark:hover:text-white transition-colors shadow-sm"
                      >
                        <Award className="w-4 h-4" />
                        Acessar pasta de Certificados
                      </a>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
                    {filteredCourses.map((course, idx) => (
                      <div
                        key={idx}
                        className="group bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-stone-200 dark:border-white/10 p-5 rounded-xl hover:border-emerald-200 hover:shadow-md transition-all print:shadow-none print:break-inside-avoid"
                      >
                        {course.url ? (
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-start text-stone-900 dark:text-white font-bold hover:text-emerald-700 transition-colors cursor-pointer print:text-black leading-tight mb-2 no-underline"
                          >
                            <span>{course.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 ml-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden shrink-0" />
                          </a>
                        ) : (
                          <h3 className="text-stone-900 dark:text-white font-bold print:text-black leading-tight mb-2">
                            {course.title}
                          </h3>
                        )}

                        <div className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-zinc-400 mb-3 bg-stone-50 dark:bg-zinc-800/50 py-1.5 px-2 rounded print:bg-transparent print:p-0">
                          <span className="font-medium text-stone-700 dark:text-zinc-200 truncate">
                            {course.institution}
                          </span>
                          {course.duration && (
                            <>
                              <span className="w-1 h-1 bg-stone-300 rounded-full shrink-0"></span>
                              <span className="shrink-0">
                                {course.duration}
                              </span>
                            </>
                          )}
                          {course.certificateUrl && (
                            <>
                              <span className="w-1 h-1 bg-stone-300 rounded-full shrink-0"></span>
                              <a
                                href={course.certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Ver certificado"
                                className="text-stone-400 dark:text-zinc-500 hover:text-emerald-600 transition-colors"
                              >
                                <Award className="w-4 h-4" />
                              </a>
                            </>
                          )}
                        </div>

                        {course.description && (
                          <p className="text-sm text-stone-600 dark:text-zinc-300 leading-relaxed print:text-black">
                            {course.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* Tab: Audiovisual */}
          {(!hasSearch
            ? activeTab === "audiovisual"
            : audiovisualHasSearch ||
              (dbWorks &&
                dbWorks.length > 0 &&
                dbWorks.some((w) => isMatch(w, searchQuery)))) && (
            <div className="space-y-6 animate-in fade-in duration-500 print:block">
              {worksInResume.length > 0 ? (
                <>
                  {!hasSearch && (
                    <div className="flex flex-col gap-3 mb-10 print:hidden border-b border-stone-200 dark:border-white/10 pb-4 tour-step-filters">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setAudiovisualSubTab("todos")}
                          className={`px-2.5 py-1.5 text-xs leading-3 rounded-lg transition-all ${audiovisualSubTab === "todos" ? "bg-stone-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-bold shadow-sm" : "bg-transparent text-stone-500 dark:text-zinc-400 font-normal hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white"}`}
                        >
                          Todos os Trabalhos
                        </button>
                        {dbUniqueCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setAudiovisualSubTab(cat)}
                            className={`px-2.5 py-1.5 text-xs leading-3 rounded-lg transition-all ${audiovisualSubTab === cat ? "bg-stone-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-bold shadow-sm" : "bg-transparent text-stone-500 dark:text-zinc-400 font-normal hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white"}`}
                          >
                            {cat}
                          </button>
                        ))}
                        {dbUniqueGroups.length > 0 && (
                          <div className="relative group text-left">
                            <button
                              className={`px-2.5 py-1.5 text-xs leading-3 rounded-lg transition-all focus:outline-none ${audiovisualSubTab.startsWith("group:") ? "bg-stone-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-bold shadow-sm" : "bg-transparent text-stone-500 dark:text-zinc-400 font-normal hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white"}`}
                            >
                              Grupos ▾
                            </button>
                            <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                              {dbUniqueGroups.map((grp) => (
                                <button
                                  key={grp}
                                  onClick={() => setAudiovisualSubTab(`group:${grp}`)}
                                  className={`block w-full text-left px-4 py-2 text-xs transition-colors hover:bg-stone-100 dark:hover:bg-zinc-700 ${audiovisualSubTab === `group:${grp}` ? "font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-zinc-700/50" : "text-stone-600 dark:text-zinc-300"}`}
                                >
                                  {grp}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="text-xs leading-3 text-stone-400 dark:text-zinc-500 font-normal mr-2 border-r border-stone-200 dark:border-white/10 pr-3">
                          Ordenar por:
                        </span>
                        <button
                          onClick={() => setAudiovisualSortMode("all")}
                          className={`px-2 py-1 text-[11px] leading-3 rounded-md transition-all ${audiovisualSortMode === "all" ? "bg-stone-200 dark:bg-zinc-700 text-stone-900 dark:text-white font-bold shadow-sm" : "bg-transparent text-stone-500 dark:text-zinc-400 font-normal hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white"}`}
                        >
                          Padrão
                        </button>
                        <button
                          onClick={() => setAudiovisualSortMode("recent")}
                          className={`px-2 py-1 text-[11px] leading-3 rounded-md transition-all ${audiovisualSortMode === "recent" ? "bg-stone-200 dark:bg-zinc-700 text-stone-900 dark:text-white font-bold shadow-sm" : "bg-transparent text-stone-500 dark:text-zinc-400 font-normal hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white"}`}
                        >
                          Mais Recentes
                        </button>
                        <button
                          onClick={() => setAudiovisualSortMode("old")}
                          className={`px-2 py-1 text-[11px] leading-3 rounded-md transition-all ${audiovisualSortMode === "old" ? "bg-stone-200 dark:bg-zinc-700 text-stone-900 dark:text-white font-bold shadow-sm" : "bg-transparent text-stone-500 dark:text-zinc-400 font-normal hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white"}`}
                        >
                          Antigos
                        </button>
                        <button
                          onClick={() => setAudiovisualSortMode("type")}
                          className={`px-2 py-1 text-[11px] leading-3 rounded-md transition-all ${audiovisualSortMode === "type" ? "bg-stone-200 dark:bg-zinc-700 text-stone-900 dark:text-white font-bold shadow-sm" : "bg-transparent text-stone-500 dark:text-zinc-400 font-normal hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white"}`}
                        >
                          Formato
                        </button>
                        <button
                          onClick={() => setAudiovisualSortMode("role")}
                          className={`px-2 py-1 text-[11px] leading-3 rounded-md transition-all ${audiovisualSortMode === "role" ? "bg-stone-200 dark:bg-zinc-700 text-stone-900 dark:text-white font-bold shadow-sm" : "bg-transparent text-stone-500 dark:text-zinc-400 font-normal hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white"}`}
                        >
                          Função
                        </button>
                      </div>
                    </div>
                  )}
                  {dbUniqueCategories.map((cat) => {
                    const items = worksInResume.filter(
                      (w) =>
                        w.category &&
                        w.category.split(',').map(c => c.trim()).includes(cat) &&
                        (hasSearch ? isMatch(w, searchQuery) : true)
                    );
                    if (items.length === 0) return null;
                    if (
                      !hasSearch &&
                      audiovisualSubTab !== "todos" &&
                      audiovisualSubTab !== cat
                    )
                      return null;
                    return (
                      <AudiovisualSection
                        key={cat}
                        title={cat}
                        items={items}
                        sortMode={audiovisualSortMode}
                      />
                    );
                  })}
                  {dbUniqueGroups.map((grp) => {
                    const items = worksInResume.filter(
                      (w) =>
                        w.group &&
                        w.group.split(',').map(g => g.trim()).includes(grp) &&
                        (hasSearch ? isMatch(w, searchQuery) : true)
                    );
                    if (items.length === 0) return null;
                    if (
                      !hasSearch &&
                      audiovisualSubTab !== `group:${grp}`
                    )
                      return null;
                    return (
                      <AudiovisualSection
                        key={`group:${grp}`}
                        title={grp}
                        items={items}
                        sortMode={audiovisualSortMode}
                        forceGroup={grp}
                      />
                    );
                  })}
                </>
              ) : (
                <>
                  {filteredAudiovisual.map((cat) => (
                    (hasSearch || audiovisualSubTab === "todos" || audiovisualSubTab === cat.id) && (
                      <AudiovisualSection
                        key={cat.title}
                        title={cat.title}
                        items={cat.filteredData}
                        sortMode={audiovisualSortMode}
                      />
                    )
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === "dev" && !hasSearch && <DevOrganizer />}
        </div>

        <footer className="mt-16 pt-8 text-center text-stone-400 dark:text-zinc-500 text-sm font-mono print:hidden">
          <p>
            © {new Date().getFullYear()} Fernando Gomes Côrtes. Desenvolvido com
            React, Tailwind & Vite.
          </p>
        </footer>
      </main>

      <AIPitchAgent 
        contextData={JSON.stringify({
          name: PERSONAL_INFO.name,
          summary: PERSONAL_INFO.summary,
          roles: PERSONAL_INFO.roles,
          experience: EXPERIENCE,
          portfolio: PORTFOLIO_GROUPS,
          skills: SKILLS,
          productions: PRODUCTIONS,
          courses: COURSES,
          education: EDUCATION,
          audiovisual: AUDIOVISUAL_CONFIG,
        })} 
        onSearch={setSearchQuery}
      />


    </div>
  );
};

export default App;
