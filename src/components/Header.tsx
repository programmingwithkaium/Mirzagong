import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Bell,
  Bookmark,
  Menu,
  Home,
  Youtube,
  Share2,
  Globe,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  MapPin,
  GraduationCap,
  HeartPulse,
  Code2,
} from 'lucide-react';
import type { Article, Category, PortalPublicView, SiteSettings } from '../types/news.ts';
import { NewsMirzaganjLogo } from './NewsMirzaganjLogo.tsx';
import {
  getEffectiveMenuConfig,
  MIRZAGANJ_WARDS,
  toBengaliDigits,
} from '../utils/newsLogic.ts';

interface HeaderProps {
  settings: SiteSettings;
  categories: Category[];
  breakingArticles: Article[];
  activeView: PortalPublicView;
  activeCategory: string;
  searchQuery: string;
  bookmarkedCount: number;
  onSelectHome: () => void;
  onSelectCategory: (slug: string) => void;
  onSelectArchive: (initialQuery?: string) => void;
  onSelectAdmin: () => void;
  onSearchChange: (query: string) => void;
  onSelectArticle: (slug: string) => void;
  onOpenSeoModal: () => void;
  onOpenSavedModal: () => void;
}

type ActiveDropdownMenu = string | null;

export const Header: React.FC<HeaderProps> = ({
  settings,
  categories,
  breakingArticles,
  activeView,
  activeCategory,
  searchQuery,
  bookmarkedCount,
  onSelectHome,
  onSelectCategory,
  onSelectArchive,
  onSelectAdmin,
  onSearchChange,
  onSelectArticle,
  onOpenSeoModal,
  onOpenSavedModal,
}) => {
  const menuConfig = getEffectiveMenuConfig(settings);
  const unionItems = menuConfig.unionItems;
  const educationItems = menuConfig.educationItems;
  const healthItems = menuConfig.healthItems;
  const visibleMainNavItems = menuConfig.mainNavItems.filter((m) => m.visible);

  // Side drawer state (opens from the left side smoothly)
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  // Exclusive section state inside the side drawer (only one open at a time)
  const [drawerSection, setDrawerSection] = useState<ActiveDropdownMenu>('union');
  const [drawerUnionSlug, setDrawerUnionSlug] = useState<string | null>(null);
  const [drawerEduSlug, setDrawerEduSlug] = useState<string | null>('edu-college-girls');

  // Exclusive hover dropdown state on main navbar: only ONE dropdown open at a time
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdownMenu>(null);
  // Nested Union -> 1-9 Ward submenu stays hidden until a specific union is hovered
  const [hoveredUnionSlug, setHoveredUnionSlug] = useState<string | null>(null);
  // Nested Education -> College submenu (e.g. কলেজ (বালিকা) -> সুবিদখালী মহিলা ডিগ্রি কলেজ)
  const [hoveredEduSlug, setHoveredEduSlug] = useState<string | null>(null);

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const navBarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Close desktop dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navBarRef.current && !navBarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setHoveredUnionSlug(null);
        setHoveredEduSlug(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close side drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSideDrawerOpen(false);
        setActiveDropdown(null);
        setHoveredUnionSlug(null);
        setHoveredEduSlug(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
    onSelectArchive(localSearch);
  };

  const handleSelectNavCategory = (slug: string) => {
    onSelectCategory(slug);
    setActiveDropdown(null);
    setHoveredUnionSlug(null);
    setHoveredEduSlug(null);
    setSideDrawerOpen(false);
  };

  const handleSelectUnionOrWard = (unionSlug: string, wardId?: string) => {
    const targetSlug = wardId ? `${unionSlug}:${wardId}` : unionSlug;
    onSelectCategory(targetSlug);
    setActiveDropdown(null);
    setHoveredUnionSlug(null);
    setHoveredEduSlug(null);
    setSideDrawerOpen(false);
  };

  const isUnionActive =
    activeView === 'category' &&
    (activeCategory === 'mirzaganj' || activeCategory.startsWith('union-'));

  const isEducationActive =
    activeView === 'category' &&
    (activeCategory === 'education' ||
      activeCategory === 'college' ||
      activeCategory === 'school' ||
      activeCategory.startsWith('edu-'));

  const isHealthActive =
    activeView === 'category' &&
    (activeCategory === 'health' || activeCategory.startsWith('health-'));

  const developerPhoto =
    settings.developerPhotoUrl || '/assets/aistudio/____6f31a55b.png';
  const developerName = settings.developerNameBn || 'মোঃ আঃ কাইয়ূম';
  const developerFbUrl =
    settings.developerFacebookUrl || 'https://www.facebook.com/freelancerkaium143/';
  const adminPhoto =
    settings.adminPhotoUrl ||
    '/assets/aistudio/c86a50b4-d4d1-4994-b557-8e1f3319ba81_e3e38474.jfif';

  return (
    <div className="bg-white border-b border-stone-200 relative z-40">
      {/* Row 1: Top Masthead (Left Side-Drawer Trigger | Center Official Logo | Right Bell, Saved, Developer Tag & Login) */}
      <header className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between gap-4">
        {/* Left: Side Menu Button (≡) & SEO Info */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setSideDrawerOpen(true)}
            aria-expanded={sideDrawerOpen}
            aria-label="সাইড মেনু খুলুন"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-stone-900 text-white hover:bg-red-600 transition-all duration-200 shadow-xs cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs sm:text-sm font-bold">মেনু</span>
          </button>

          <button
            type="button"
            onClick={onOpenSeoModal}
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-stone-700 bg-stone-100 hover:bg-red-50 hover:text-red-700 border border-stone-200 rounded-md transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
            <span>ডেমো সংস্করণ · এসইও তথ্য</span>
          </button>
        </div>

        {/* Center: Official News Mirzaganj Circular Emblem Logo */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectHome();
          }}
          className="flex flex-col items-center group focus-visible:outline-2 focus-visible:outline-red-600"
        >
          <NewsMirzaganjLogo size="lg" />
          <span className="sr-only">{settings.portalNameBn}</span>
        </a>

        {/* Right: Notification Bell + Saved + Login */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <button
            type="button"
            onClick={() => handleSelectNavCategory('trending')}
            aria-label="ট্রেন্ডিং সংবাদ বিজ্ঞপ্তি"
            title="এখন ট্রেন্ডিং সংবাদ"
            className="relative p-2 text-stone-800 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white" />
          </button>

          <button
            type="button"
            onClick={onOpenSavedModal}
            aria-label="সংরক্ষিত সংবাদ"
            title="সংরক্ষিত সংবাদ"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            <Bookmark className="w-4 h-4 text-red-600" />
            <span>({toBengaliDigits(bookmarkedCount)})</span>
          </button>

          <button
            type="button"
            onClick={onSelectAdmin}
            className="px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold text-stone-900 bg-white border-2 border-stone-900 rounded-md hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
          >
            পাবলিক / অ্যাডমিন
          </button>
        </div>
      </header>

      {/* Row 2: Main Navigation Bar with Professional Look, Hover Colors & Exclusive Single-Open Dropdowns */}
      <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white border-t border-b border-stone-800 shadow-md">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-4">
          {/* Left Date */}
          <div className="text-xs sm:text-[13px] font-semibold text-stone-300 whitespace-nowrap">
            {settings.editionDateBn}
          </div>

          {/* Center Navigation: Dynamically driven by menuConfig.mainNavItems (Admin controllable) */}
          <nav
            ref={navBarRef}
            aria-label="প্রধান বিভাগসমূহ, ইউনিয়ন, শিক্ষা ও স্বাস্থ্য মেনু"
            onMouseLeave={() => {
              setActiveDropdown(null);
              setHoveredUnionSlug(null);
              setHoveredEduSlug(null);
            }}
            className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm sm:text-[15px] font-bold"
          >
            {/* Red Home Icon Button */}
            <button
              type="button"
              onClick={() => {
                setActiveDropdown(null);
                onSelectHome();
              }}
              aria-label="প্রচ্ছদ (হোমপেজ)"
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150 shrink-0 mr-1 ${
                activeView === 'home' && activeCategory === 'all'
                  ? 'bg-red-600 text-white ring-2 ring-red-400/50'
                  : 'bg-red-600 text-white hover:bg-red-500'
              }`}
            >
              <Home className="w-4 h-4" />
            </button>

            {visibleMainNavItems.map((navItem) => {
              if (navItem.dropdownType === 'union') {
                return (
                  <div
                    key={navItem.id}
                    className="relative"
                    onMouseEnter={() => {
                      setActiveDropdown('union');
                      setHoveredEduSlug(null);
                    }}
                    onMouseLeave={() => {
                      setActiveDropdown(null);
                      setHoveredUnionSlug(null);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectNavCategory(navItem.slug)}
                      aria-expanded={activeDropdown === 'union'}
                      aria-haspopup="true"
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md transition-all duration-150 whitespace-nowrap ${
                        isUnionActive || activeDropdown === 'union'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-stone-100 hover:bg-red-600/90 hover:text-white'
                      }`}
                    >
                      <span>{navItem.labelBn}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === 'union' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {activeDropdown === 'union' && (
                      <div
                        onMouseLeave={() => setHoveredUnionSlug(null)}
                        className="absolute left-0 top-full pt-1.5 z-50 flex items-start"
                      >
                        {/* Level 1 Box: Unions of Mirzaganj */}
                        <div className="w-52 bg-white text-stone-900 border border-stone-200 border-t-4 border-t-red-600 rounded-b-lg shadow-2xl py-1.5 overflow-hidden">
                          <div className="px-3.5 py-2 text-[11px] font-bold text-stone-500 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                            <span>মির্জাগঞ্জের ইউনিয়ন</span>
                            <span className="text-red-600">ওয়ার্ড ১-৯</span>
                          </div>
                          <ul role="menu" aria-label="মির্জাগঞ্জ উপজেলার ইউনিয়নসমূহ">
                            {unionItems.map((union) => {
                              const isHovered = hoveredUnionSlug === union.slug;
                              return (
                                <li key={union.slug} role="none">
                                  <div
                                    onMouseEnter={() => setHoveredUnionSlug(union.slug)}
                                    className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-bold cursor-pointer transition-all duration-150 border-b border-stone-100 last:border-b-0 ${
                                      isHovered
                                        ? 'bg-red-600 text-white pl-4'
                                        : 'text-stone-800 hover:bg-red-50 hover:text-red-600'
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => handleSelectUnionOrWard(union.slug)}
                                      className="text-left flex-1 font-bold"
                                    >
                                      {union.nameBn}
                                    </button>
                                    <ChevronRight
                                      className={`w-4 h-4 shrink-0 transition-transform ${
                                        isHovered ? 'text-white translate-x-0.5' : 'text-stone-400'
                                      }`}
                                    />
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* Level 2 Nested Box: ONLY shown when a specific Union is hovered */}
                        {hoveredUnionSlug &&
                          (() => {
                            const activeUnion = unionItems.find(
                              (u) => u.slug === hoveredUnionSlug
                            );
                            if (!activeUnion) return null;
                            return (
                              <div className="w-52 bg-white text-stone-900 border border-stone-200 border-t-4 border-t-stone-900 rounded-b-lg shadow-2xl py-1.5 ml-1">
                                <div className="px-3.5 py-2 text-xs font-bold text-red-700 border-b border-stone-200 bg-red-50/70">
                                  {activeUnion.nameBn} ইউনিয়ন (ওয়ার্ডসমূহ)
                                </div>
                                <ul
                                  role="menu"
                                  aria-label={`${activeUnion.nameBn} ইউনিয়নের ১নং থেকে ৯নং ওয়ার্ড`}
                                >
                                  <li role="none">
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => handleSelectUnionOrWard(activeUnion.slug)}
                                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-stone-900 bg-stone-50 hover:bg-red-600 hover:text-white border-b border-stone-200 transition-colors"
                                    >
                                      সকল ওয়ার্ড ({activeUnion.nameBn})
                                    </button>
                                  </li>
                                  {MIRZAGANJ_WARDS.map((ward) => (
                                    <li key={ward.id} role="none">
                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() =>
                                          handleSelectUnionOrWard(activeUnion.slug, ward.id)
                                        }
                                        className="w-full text-left px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-800 hover:bg-red-600 hover:text-white hover:pl-5 transition-all duration-150 flex items-center justify-between border-b border-stone-100 last:border-b-0"
                                      >
                                        <span>{ward.labelBn}</span>
                                        <ChevronRight className="w-3.5 h-3.5 opacity-75" />
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })()}
                      </div>
                    )}
                  </div>
                );
              }

              if (navItem.dropdownType === 'education') {
                return (
                  <div
                    key={navItem.id}
                    className="relative"
                    onMouseEnter={() => {
                      setActiveDropdown('education');
                      setHoveredUnionSlug(null);
                    }}
                    onMouseLeave={() => {
                      setActiveDropdown(null);
                      setHoveredEduSlug(null);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectNavCategory(navItem.slug)}
                      aria-expanded={activeDropdown === 'education'}
                      aria-haspopup="true"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-150 whitespace-nowrap ${
                        isEducationActive || activeDropdown === 'education'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-stone-100 hover:bg-red-600/90 hover:text-white'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-red-400 group-hover:text-white shrink-0" />
                      <span>{navItem.labelBn}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === 'education' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {activeDropdown === 'education' && (
                      <div
                        onMouseLeave={() => setHoveredEduSlug(null)}
                        className="absolute left-0 top-full pt-1.5 z-50 flex items-start"
                      >
                        <div className="w-64 bg-white text-stone-900 border border-stone-200 border-t-4 border-t-red-600 rounded-b-lg shadow-2xl py-1.5 overflow-hidden">
                          <div className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50/70 border-b border-stone-200 flex items-center justify-between">
                            <span>শিক্ষা সংক্রান্ত বিভাগসমূহ</span>
                            <GraduationCap className="w-4 h-4 text-red-600" />
                          </div>
                          <ul role="menu" aria-label="শিক্ষা সংক্রান্ত প্রতিষ্ঠান ও বিভাগ">
                            {educationItems.map((item) => {
                              const isHovered = hoveredEduSlug === item.slug;
                              const hasSubItems = Boolean(
                                item.subItems && item.subItems.length > 0
                              );
                              return (
                                <li key={item.slug} role="none">
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onMouseEnter={() => setHoveredEduSlug(item.slug)}
                                    onClick={() => handleSelectNavCategory(item.slug)}
                                    className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-between border-b border-stone-100 last:border-b-0 ${
                                      activeCategory === item.slug || isHovered
                                        ? 'bg-red-600 text-white pl-5'
                                        : 'text-stone-800 hover:bg-red-600 hover:text-white hover:pl-5'
                                    }`}
                                  >
                                    <span>{item.labelBn}</span>
                                    <span className="flex items-center gap-1">
                                      {hasSubItems && (
                                        <span
                                          className={`text-[10px] px-1.5 py-0.2 rounded ${
                                            activeCategory === item.slug || isHovered
                                              ? 'bg-white/20 text-white'
                                              : 'bg-red-50 text-red-700'
                                          }`}
                                        >
                                          তালিকা
                                        </span>
                                      )}
                                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-75" />
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* Level 2 Nested Flyout for Education Sub-items (e.g., কলেজ (বালিকা) -> সুবিদখালী মহিলা ডিগ্রি কলেজ) */}
                        {hoveredEduSlug &&
                          (() => {
                            const activeEdu = educationItems.find(
                              (e) => e.slug === hoveredEduSlug
                            );
                            if (
                              !activeEdu ||
                              !activeEdu.subItems ||
                              activeEdu.subItems.length === 0
                            ) {
                              return null;
                            }
                            return (
                              <div className="w-64 bg-white text-stone-900 border border-stone-200 border-t-4 border-t-stone-900 rounded-b-lg shadow-2xl py-1.5 ml-1">
                                <div className="px-3.5 py-2 text-xs font-bold text-red-700 border-b border-stone-200 bg-red-50/70">
                                  {activeEdu.labelBn} — প্রতিষ্ঠান তালিকা
                                </div>
                                <ul
                                  role="menu"
                                  aria-label={`${activeEdu.labelBn} এর অন্তর্ভুক্ত প্রতিষ্ঠান`}
                                >
                                  {activeEdu.subItems.map((sub) => (
                                    <li key={sub.slug} role="none">
                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => handleSelectNavCategory(sub.slug)}
                                        className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-bold text-stone-800 hover:bg-red-600 hover:text-white hover:pl-5 transition-all duration-150 flex items-center justify-between border-b border-stone-100 last:border-b-0"
                                      >
                                        <span>{sub.labelBn}</span>
                                        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-75" />
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })()}
                      </div>
                    )}
                  </div>
                );
              }

              if (navItem.dropdownType === 'health') {
                return (
                  <div
                    key={navItem.id}
                    className="relative"
                    onMouseEnter={() => {
                      setActiveDropdown('health');
                      setHoveredUnionSlug(null);
                      setHoveredEduSlug(null);
                    }}
                    onMouseLeave={() => {
                      setActiveDropdown(null);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectNavCategory(navItem.slug)}
                      aria-expanded={activeDropdown === 'health'}
                      aria-haspopup="true"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-150 whitespace-nowrap ${
                        isHealthActive || activeDropdown === 'health'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-stone-100 hover:bg-red-600/90 hover:text-white'
                      }`}
                    >
                      <HeartPulse className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{navItem.labelBn}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === 'health' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {activeDropdown === 'health' && (
                      <div className="absolute left-0 top-full pt-1.5 z-50">
                        <div className="w-72 bg-white text-stone-900 border border-stone-200 border-t-4 border-t-emerald-600 rounded-b-lg shadow-2xl py-1.5 overflow-hidden">
                          <div className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50/80 border-b border-stone-200 flex items-center justify-between">
                            <span>স্বাস্থ্য সংক্রান্ত সেবা ও তথ্য</span>
                            <HeartPulse className="w-4 h-4 text-emerald-600" />
                          </div>
                          <ul role="menu" aria-label="স্বাস্থ্য সংক্রান্ত সেবা ও কেন্দ্রসমূহ">
                            {healthItems.map((item) => (
                              <li key={item.slug} role="none">
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => handleSelectNavCategory(item.slug)}
                                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-150 flex items-center justify-between border-b border-stone-100 last:border-b-0 ${
                                    activeCategory === item.slug
                                      ? 'bg-emerald-700 text-white pl-5'
                                      : 'text-stone-800 hover:bg-emerald-600 hover:text-white hover:pl-5'
                                  }`}
                                >
                                  <span>{item.labelBn}</span>
                                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-75" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (navItem.subItems && navItem.subItems.length > 0) {
                return (
                  <div
                    key={navItem.id}
                    className="relative"
                    onMouseEnter={() => {
                      setActiveDropdown(navItem.id);
                      setHoveredUnionSlug(null);
                      setHoveredEduSlug(null);
                    }}
                    onMouseLeave={() => {
                      setActiveDropdown(null);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectNavCategory(navItem.slug)}
                      aria-expanded={activeDropdown === navItem.id}
                      aria-haspopup="true"
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md transition-all duration-150 whitespace-nowrap ${
                        (activeView === 'category' && activeCategory === navItem.slug) ||
                        activeDropdown === navItem.id
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-stone-100 hover:bg-red-600/90 hover:text-white'
                      }`}
                    >
                      <span>{navItem.labelBn}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === navItem.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {activeDropdown === navItem.id && (
                      <div className="absolute left-0 top-full pt-1.5 z-50">
                        <div className="w-60 bg-white text-stone-900 border border-stone-200 border-t-4 border-t-red-600 rounded-b-lg shadow-2xl py-1.5 overflow-hidden">
                          <ul role="menu" aria-label={`${navItem.labelBn} সাব-মেনু`}>
                            {navItem.subItems.map((sub) => (
                              <li key={sub.slug} role="none">
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => handleSelectNavCategory(sub.slug)}
                                  className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-bold text-stone-800 hover:bg-red-600 hover:text-white hover:pl-5 transition-all duration-150 flex items-center justify-between border-b border-stone-100 last:border-b-0"
                                >
                                  <span>{sub.labelBn || sub.nameBn}</span>
                                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-75" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={navItem.id}
                  type="button"
                  onMouseEnter={() => {
                    setActiveDropdown(null);
                    setHoveredUnionSlug(null);
                    setHoveredEduSlug(null);
                  }}
                  onClick={() => handleSelectNavCategory(navItem.slug)}
                  className={`px-3 py-1.5 rounded-md transition-all duration-150 whitespace-nowrap ${
                    activeView === 'category' && activeCategory === navItem.slug
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-stone-100 hover:bg-red-600/90 hover:text-white'
                  }`}
                >
                  {navItem.labelBn}
                </button>
              );
            })}
          </nav>

          {/* Right Circular Social & Media Icons */}
          <div className="flex items-center gap-2">
            <a
              href={developerFbUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ডেভেলপার ফেসবুক প্রোফাইল"
              title={`ফেসবুক: ${developerName}`}
              className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[11px] font-bold hover:scale-105 transition-transform"
            >
              f
            </a>
            <button
              type="button"
              onClick={() => handleSelectNavCategory('international')}
              aria-label="আন্তর্জাতিক ও বিশ্ব সংবাদ"
              title="আন্তর্জাতিক সংবাদ"
              className="w-6 h-6 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenSavedModal}
              aria-label="সংরক্ষিত সংবাদ তালিকা"
              title="সংরক্ষিত সংবাদ"
              className="w-6 h-6 rounded-full bg-[#E11D48] text-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Share2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleSelectNavCategory('video')}
              aria-label="ভিডিও সংবাদ"
              title="ভিডিও সংবাদ"
              className="w-6 h-6 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Youtube className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Left Side-Opening Slide-Over Drawer Menu (সাইডে সুন্দর করে খুলবে) */}
      {sideDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="নিউজ মির্জাগঞ্জ সাইড নেভিগেশন মেনু"
          className="fixed inset-0 z-50 flex"
        >
          {/* Backdrop overlay */}
          <div
            onClick={() => setSideDrawerOpen(false)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-[1px] transition-opacity"
          />

          {/* Slide-over panel on the LEFT side */}
          <aside className="relative z-10 w-[330px] sm:w-[390px] max-w-[90vw] bg-white h-full shadow-2xl border-r-4 border-red-600 flex flex-col justify-between overflow-hidden">
            {/* Drawer Header */}
            <div className="px-5 py-4 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-full shrink-0">
                  <NewsMirzaganjLogo size="sm" />
                </div>
                <div>
                  <div className="text-base font-bold text-white leading-tight">
                    {settings.portalNameBn}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    মির্জাগঞ্জ ও উপকূলের নির্ভরযোগ্য সংবাদ
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSideDrawerOpen(false)}
                aria-label="সাইড মেনু বন্ধ করুন"
                className="p-1.5 rounded-md bg-stone-800 text-stone-200 hover:bg-red-600 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {/* Quick Top Links */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectHome();
                    setSideDrawerOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <Home className="w-4 h-4 shrink-0" />
                  <span>প্রচ্ছদ (হোম)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectNavCategory('trending')}
                  className="flex items-center justify-center px-3 py-2 text-xs font-bold rounded-md bg-stone-900 text-white hover:bg-red-600 transition-colors"
                >
                  সর্বশেষ ট্রেন্ডিং
                </button>
              </div>

              {/* Exclusive Accordion 1: ইউনিয়ন ও ১নং-৯নং ওয়ার্ড */}
              <div className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50/60">
                <button
                  type="button"
                  onClick={() =>
                    setDrawerSection((prev) => (prev === 'union' ? null : 'union'))
                  }
                  className={`w-full px-3.5 py-2.5 text-sm font-bold flex items-center justify-between transition-colors ${
                    drawerSection === 'union'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-stone-900 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>ইউনিয়ন ও ওয়ার্ড (১নং-৯নং)</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      drawerSection === 'union' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {drawerSection === 'union' && (
                  <div className="p-2.5 space-y-1.5 bg-white border-t border-stone-200">
                    <div className="text-[11px] font-semibold text-stone-500 px-1">
                      ইউনিয়ন নির্বাচন করলে ১নং-৯নং ওয়ার্ড খুলবে:
                    </div>
                    {unionItems.map((union) => {
                      const isUnionOpen = drawerUnionSlug === union.slug;
                      return (
                        <div
                          key={union.slug}
                          className="border border-stone-200 rounded-md overflow-hidden"
                        >
                          <div
                            onMouseEnter={() => setDrawerUnionSlug(union.slug)}
                            onClick={() =>
                              setDrawerUnionSlug((prev) =>
                                prev === union.slug ? null : union.slug
                              )
                            }
                            className={`px-3 py-2 text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-colors ${
                              isUnionOpen
                                ? 'bg-stone-900 text-white'
                                : 'bg-stone-50 text-stone-900 hover:bg-red-50 hover:text-red-600'
                            }`}
                          >
                            <span>{union.nameBn}</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectUnionOrWard(union.slug);
                                }}
                                className={`text-[11px] underline ${
                                  isUnionOpen ? 'text-red-300' : 'text-red-600'
                                }`}
                              >
                                সব খবর
                              </button>
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform ${
                                  isUnionOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </div>

                          {isUnionOpen && (
                            <div className="p-2 bg-stone-50 border-t border-stone-200 grid grid-cols-3 gap-1.5">
                              {MIRZAGANJ_WARDS.map((ward) => (
                                <button
                                  key={ward.id}
                                  type="button"
                                  onClick={() =>
                                    handleSelectUnionOrWard(union.slug, ward.id)
                                  }
                                  className="px-2 py-1.5 text-[11px] font-bold text-stone-800 bg-white border border-stone-300 rounded hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors text-center"
                                >
                                  {ward.labelBn}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Exclusive Accordion 2: শিক্ষা সংক্রান্ত (with nested কলেজ (বালিকা) -> সুবিদখালী মহিলা ডিগ্রি কলেজ) */}
              <div className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50/60">
                <button
                  type="button"
                  onClick={() =>
                    setDrawerSection((prev) =>
                      prev === 'education' ? null : 'education'
                    )
                  }
                  className={`w-full px-3.5 py-2.5 text-sm font-bold flex items-center justify-between transition-colors ${
                    drawerSection === 'education'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-stone-900 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span>শিক্ষা সংক্রান্ত (স্কুল, মাদ্রাসা ও কলেজ)</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      drawerSection === 'education' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {drawerSection === 'education' && (
                  <div className="p-2 bg-white border-t border-stone-200 space-y-1">
                    {educationItems.map((item) => {
                      const hasSub = Boolean(item.subItems && item.subItems.length > 0);
                      const isEduOpen = drawerEduSlug === item.slug;
                      return (
                        <div key={item.slug} className="space-y-1">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSelectNavCategory(item.slug)}
                              className="flex-1 text-left px-3 py-2 text-xs sm:text-sm font-bold text-stone-800 rounded hover:bg-red-600 hover:text-white transition-colors flex items-center justify-between"
                            >
                              <span>{item.labelBn}</span>
                              {!hasSub && <ChevronRight className="w-3.5 h-3.5 opacity-75" />}
                            </button>
                            {hasSub && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDrawerEduSlug((prev) =>
                                    prev === item.slug ? null : item.slug
                                  )
                                }
                                className="px-2 py-2 text-[11px] font-bold bg-red-50 text-red-700 rounded hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1"
                              >
                                <span>কলেজ তালিকা</span>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform ${
                                    isEduOpen ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                          {hasSub && isEduOpen && (
                            <div className="pl-3 pr-1 py-1.5 bg-red-50/50 border-l-2 border-red-600 rounded-r space-y-1">
                              {item.subItems!.map((sub) => (
                                <button
                                  key={sub.slug}
                                  type="button"
                                  onClick={() => handleSelectNavCategory(sub.slug)}
                                  className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-red-900 bg-white border border-red-200 rounded hover:bg-red-600 hover:text-white transition-colors flex items-center justify-between"
                                >
                                  <span>{sub.labelBn}</span>
                                  <ChevronRight className="w-3 h-3 shrink-0" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Exclusive Accordion 3: স্বাস্থ্য সংক্রান্ত */}
              <div className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50/60">
                <button
                  type="button"
                  onClick={() =>
                    setDrawerSection((prev) => (prev === 'health' ? null : 'health'))
                  }
                  className={`w-full px-3.5 py-2.5 text-sm font-bold flex items-center justify-between transition-colors ${
                    drawerSection === 'health'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-stone-900 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 shrink-0" />
                    <span>স্বাস্থ্য সংক্রান্ত সেবা ও কেন্দ্র</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      drawerSection === 'health' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {drawerSection === 'health' && (
                  <div className="p-2 bg-white border-t border-stone-200 space-y-1">
                    {healthItems.map((item) => (
                      <button
                        key={item.slug}
                        type="button"
                        onClick={() => handleSelectNavCategory(item.slug)}
                        className="w-full text-left px-3 py-2 text-xs sm:text-sm font-bold text-stone-800 rounded hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span>{item.labelBn}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-75" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Other Categories Grid */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 px-1">
                  সকল বিভাগ ও মেনু
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectNavCategory(cat.slug)}
                      className="px-3 py-2 text-xs font-bold text-left rounded-md bg-stone-50 border border-stone-200 text-stone-800 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors truncate"
                    >
                      {cat.nameBn}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectArchive();
                      setSideDrawerOpen(false);
                    }}
                    className="px-3 py-2 text-xs font-bold text-left rounded-md bg-stone-50 border border-stone-200 text-stone-800 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                  >
                    আর্কাইভ অনুসন্ধান
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer with Admin Button, Admin Photo & Developer Attribution + Facebook Link */}
            <div className="p-4 bg-stone-950 text-white border-t border-stone-800 space-y-3">
              <button
                type="button"
                onClick={() => {
                  onSelectAdmin();
                  setSideDrawerOpen(false);
                }}
                className="w-full py-2 px-4 text-xs font-bold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <img
                  src={adminPhoto}
                  alt={settings.editorNameBn}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-white"
                />
                <span>অ্যাডমিন প্যানেল (/admin) ও মেনু কন্ট্রোল</span>
              </button>
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2 text-xs text-stone-300">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={developerPhoto}
                    alt={developerName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1 font-bold text-amber-400 truncate">
                      <Code2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="truncate">ডেভেলপার: {developerName}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      নিউজ মির্জাগঞ্জ
                    </div>
                  </div>
                </div>
                <a
                  href={developerFbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-[#1877F2] hover:bg-blue-700 text-white text-[11px] font-bold shrink-0 transition-colors"
                >
                  Facebook ID
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Row 3: "প্রতিদিনের খবর" Centered Title + Breaking News Ticker & Red Search Bar */}
      <section
        aria-label="প্রতিদিনের খবর, ব্রেকিং নিউজ ও অনুসন্ধান"
        className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-5 pb-4"
      >
        <div className="text-center mb-5">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            প্রতিদিনের খবর
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left 8 Cols: Red "ব্রেকিং নিউজ" Label + Auto-Scrolling Continuous Marquee Ticker */}
          <div className="lg:col-span-8 flex items-stretch border border-stone-300 bg-white overflow-hidden">
            <div className="bg-red-600 text-white px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center whitespace-nowrap shrink-0 z-10 shadow-xs">
              ব্রেকিং নিউজ
            </div>
            <div className="relative flex-1 flex items-center overflow-hidden py-2 bg-white">
              {breakingArticles.length > 0 ? (
                <div className="animate-breaking-marquee items-center">
                  {[0, 1].map((dupIndex) => (
                    <div
                      key={dupIndex}
                      aria-hidden={dupIndex === 1 ? 'true' : undefined}
                      className="flex items-center gap-8 pr-8 whitespace-nowrap"
                    >
                      {breakingArticles.map((item) => (
                        <button
                          key={`${dupIndex}-${item.id}`}
                          type="button"
                          tabIndex={dupIndex === 1 ? -1 : 0}
                          onClick={() => onSelectArticle(item.slug)}
                          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-800 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                          <span>{item.title}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="px-4 text-xs text-stone-500">
                  এই মুহূর্তে কোনো ব্রেকিং সংবাদ নেই।
                </span>
              )}
            </div>
          </div>

          {/* Right 4 Cols: Search Input + Solid Red Search Icon Button */}
          <form
            onSubmit={handleSearchSubmit}
            className="lg:col-span-4 flex items-stretch border border-stone-300 bg-white"
          >
            <label htmlFor="portal-search-input" className="sr-only">
              সংবাদ অনুসন্ধান করুন
            </label>
            <input
              id="portal-search-input"
              type="search"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                onSearchChange(e.target.value);
              }}
              placeholder="খুঁজুন (মির্জাগঞ্জ, সুবিদখালী, পায়রা)..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                }}
                aria-label="অনুসন্ধান মুছুন"
                className="px-2 text-stone-400 hover:text-stone-700 flex items-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              aria-label="খুঁজুন"
              className="bg-red-600 hover:bg-red-700 text-white px-4 flex items-center justify-center transition-colors shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
