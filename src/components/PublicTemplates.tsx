import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  SearchX,
  Send,
  UserCheck,
} from 'lucide-react';
import type {
  Advertisement,
  Article,
  Author,
  Category,
  ContactMessage,
  PortalPublicView,
  SiteSettings,
  Tag,
} from '../types/news.ts';
import {
  LeadStoryCard,
  NumberedRankItem,
  ResponsiveAdSlot,
  StandardNewsCard,
} from './NewsCards.tsx';
import { SubidkhaliCollegeSpotlight } from './SubidkhaliCollegeSpotlight.tsx';
import {
  filterArticles,
  formatBengaliNumber,
  getEffectiveMenuConfig,
  MIRZAGANJ_EDUCATION_ITEMS,
  MIRZAGANJ_HEALTH_ITEMS,
  MIRZAGANJ_UNIONS,
  MIRZAGANJ_WARDS,
  resolveCategoryMeta,
  sortArticles,
  toBengaliDigits,
  validateContactForm,
} from '../utils/newsLogic.ts';

/* ============================================================================
   1. DEDICATED CATEGORY LISTING PAGE TEMPLATE
   ============================================================================ */
interface CategoryPageTemplateProps {
  categorySlug: string;
  categories: Category[];
  articles: Article[];
  authorsMap: Record<string, Author>;
  settings?: SiteSettings;
  sidebarAd?: Advertisement;
  bookmarkedIds: string[];
  onToggleBookmark: (articleId: string) => void;
  onSelectCategory: (slug: string) => void;
  onSelectArticle: (slug: string) => void;
  onSelectAuthor: (authorSlug: string) => void;
  onBackHome: () => void;
  onInspectAdPolicy: () => void;
}

export const CategoryPageTemplate: React.FC<CategoryPageTemplateProps> = ({
  categorySlug,
  categories,
  articles,
  authorsMap,
  settings,
  sidebarAd,
  bookmarkedIds,
  onToggleBookmark,
  onSelectCategory,
  onSelectArticle,
  onSelectAuthor,
  onBackHome,
  onInspectAdPolicy,
}) => {
  const [sortMode, setSortMode] = useState<'latest' | 'popular'>('latest');
  const [visibleCount, setVisibleCount] = useState(6);

  const menuConfig = getEffectiveMenuConfig(settings);
  const resolvedMeta = resolveCategoryMeta(categorySlug, categories, settings);
  const categoryTitleBn = resolvedMeta.titleBn;
  const categoryDescBn = resolvedMeta.descriptionBn;
  const activeUnion = resolvedMeta.unionInfo;
  const activeWard = resolvedMeta.wardInfo;

  const isUnionOrMirzaganjView =
    categorySlug === 'mirzaganj' || categorySlug.startsWith('union-');

  const isEducationView =
    categorySlug === 'education' ||
    categorySlug === 'college' ||
    categorySlug === 'school' ||
    categorySlug.startsWith('edu-');

  const isHealthView =
    categorySlug === 'health' || categorySlug.startsWith('health-');

  const activeEduParent = menuConfig.educationItems.find(
    (item) => categorySlug === item.slug || categorySlug.startsWith(`${item.slug}:`)
  );

  const currentUnionSlug =
    activeUnion?.slug ??
    (categorySlug === 'mirzaganj' ? menuConfig.unionItems[0]?.slug ?? MIRZAGANJ_UNIONS[0].slug : '');

  const categoryArticles = sortArticles(
    filterArticles(articles, { categorySlug, onlyPublished: true }),
    sortMode
  );

  const showSubidkhaliSpotlight =
    categoryArticles.length > 0 &&
    (categorySlug === 'education' ||
      categorySlug === 'college' ||
      categorySlug === 'edu-college-coed' ||
      categorySlug === 'edu-college-coed:subidkhali-govt-college');

  const categoryLead = categoryArticles[0];
  const remainingArticles = categoryArticles.slice(1, visibleCount + 1);
  const mostReadInCategory = sortArticles(categoryArticles, 'popular').slice(0, 5);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Category Header */}
      <div className="pb-6 border-b-2 border-stone-900 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mb-2">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1 font-medium text-stone-900 hover:text-red-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>প্রচ্ছদ</span>
            </button>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-red-700">
              {activeUnion ? activeUnion.fullNameBn : 'বিভাগীয় পাতা'}
            </span>
            {activeWard && (
              <>
                <span aria-hidden="true">/</span>
                <span className="font-bold text-stone-900">{activeWard.labelBn}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>মোট {toBengaliDigits(categoryArticles.length)}টি ডেমো প্রতিবেদন</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900">
            {categoryTitleBn}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {categoryDescBn}
          </p>
        </div>

        {/* Sort Switcher */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <div className="inline-flex items-center p-0.5 bg-stone-100 rounded border border-stone-200">
            <button
              type="button"
              onClick={() => setSortMode('latest')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                sortMode === 'latest'
                  ? 'bg-red-700 text-white'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              সর্বশেষ ক্রম
            </button>
            <button
              type="button"
              onClick={() => setSortMode('popular')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                sortMode === 'popular'
                  ? 'bg-red-700 text-white'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              সর্বাধিক পঠিত
            </button>
          </div>
        </div>
      </div>

      {/* Union & 1-9 Ward Interactive Bar when browsing Unions */}
      {isUnionOrMirzaganjView && (
        <div className="bg-stone-50 border border-stone-200 p-4 sm:p-5 space-y-4">
          <div>
            <div className="text-xs font-bold text-stone-500 mb-2">
              মির্জাগঞ্জ উপজেলার ইউনিয়ন নির্বাচন করুন:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {menuConfig.unionItems.map((u) => {
                const isSelectedUnion = currentUnionSlug === u.slug;
                return (
                  <button
                    key={u.slug}
                    type="button"
                    onClick={() => onSelectCategory(u.slug)}
                    className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded transition-colors ${
                      isSelectedUnion
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-white text-stone-800 border border-stone-300 hover:border-red-600 hover:text-red-600'
                    }`}
                  >
                    {u.nameBn}
                  </button>
                );
              })}
            </div>
          </div>

          {currentUnionSlug && (
            <div className="pt-3 border-t border-stone-200">
              <div className="text-xs font-bold text-stone-600 mb-2">
                {menuConfig.unionItems.find((u) => u.slug === currentUnionSlug)?.fullNameBn} — ওয়ার্ড ভিত্তিক সংবাদ (১নং থেকে ৯নং ওয়ার্ড):
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectCategory(currentUnionSlug)}
                  className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                    !activeWard
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-900'
                  }`}
                >
                  সকল ওয়ার্ড
                </button>
                {MIRZAGANJ_WARDS.map((w) => {
                  const isSelectedWard = activeWard?.id === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => onSelectCategory(`${currentUnionSlug}:${w.id}`)}
                      className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                        isSelectedWard
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-stone-800 border border-stone-300 hover:border-red-600 hover:text-red-600'
                      }`}
                    >
                      {w.labelBn}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Sub-Category Bar when browsing শিক্ষা সংক্রান্ত */}
      {isEducationView && (
        <div className="bg-stone-50 border border-stone-200 p-4 sm:p-5 rounded-lg space-y-3">
          <div className="text-xs font-bold text-red-700">
            শিক্ষা সংক্রান্ত সকল প্রতিষ্ঠান ও বিভাগ (নির্বাচন করুন):
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectCategory('education')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-colors ${
                categorySlug === 'education'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-800 border border-stone-300 hover:border-red-600 hover:text-red-600'
              }`}
            >
              সকল শিক্ষা সংবাদ
            </button>
            {menuConfig.educationItems.map((item) => {
              const isSelected =
                categorySlug === item.slug || categorySlug.startsWith(`${item.slug}:`);
              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => onSelectCategory(item.slug)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white text-stone-800 border border-stone-300 hover:border-red-600 hover:text-red-600'
                  }`}
                >
                  {item.labelBn}
                  {item.subItems && item.subItems.length > 0
                    ? ` (${toBengaliDigits(item.subItems.length)})`
                    : ''}
                </button>
              );
            })}
          </div>

          {/* Nested College/School Submenu Strip (e.g., কলেজ বালিকা -> সুবিদখালী মহিলা ডিগ্রি কলেজ (মহিলা কলেজ)) */}
          {activeEduParent && activeEduParent.subItems && activeEduParent.subItems.length > 0 && (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-lg flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-blue-900 mr-1">
                {activeEduParent.labelBn}-এর অধীনস্থ প্রতিষ্ঠানসমূহ:
              </span>
              <button
                type="button"
                onClick={() => onSelectCategory(activeEduParent.slug)}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                  categorySlug === activeEduParent.slug
                    ? 'bg-blue-700 text-white'
                    : 'bg-white text-stone-800 border border-blue-200 hover:border-blue-600'
                }`}
              >
                সকল ({activeEduParent.labelBn})
              </button>
              {activeEduParent.subItems.map((sub) => (
                <button
                  key={sub.slug}
                  type="button"
                  onClick={() => onSelectCategory(sub.slug)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded transition-colors ${
                    categorySlug === sub.slug
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white text-stone-900 border border-blue-300 hover:border-red-600 hover:text-red-700'
                  }`}
                >
                  {sub.labelBn}
                </button>
              ))}
            </div>
          )}

          {showSubidkhaliSpotlight && (
            <div className="pt-3">
              <SubidkhaliCollegeSpotlight onSelectArticle={onSelectArticle} />
            </div>
          )}
        </div>
      )}

      {/* Interactive Sub-Category Bar when browsing স্বাস্থ্য সংক্রান্ত */}
      {isHealthView && (
        <div className="bg-emerald-50/50 border border-emerald-200 p-4 sm:p-5 rounded-lg space-y-3">
          <div className="text-xs font-bold text-emerald-800">
            স্বাস্থ্য সংক্রান্ত সেবা ও কেন্দ্রসমূহ (নির্বাচন করুন):
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectCategory('health')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-colors ${
                categorySlug === 'health'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-800 border border-stone-300 hover:border-emerald-600 hover:text-emerald-700'
              }`}
            >
              সকল স্বাস্থ্য সংবাদ
            </button>
            {menuConfig.healthItems.map((item) => {
              const isSelected = categorySlug === item.slug;
              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => onSelectCategory(item.slug)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-stone-800 border border-stone-300 hover:border-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  {item.labelBn}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {categoryArticles.length === 0 ? (
        <div
          data-testid="empty-category-news"
          className="py-16 px-6 text-center bg-red-50/40 border-2 border-dashed border-red-200 rounded-xl max-w-xl mx-auto shadow-xs"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <SearchX className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-red-600">
            কোনো খবর নেই!
          </h2>
          <p className="text-sm text-stone-700 font-medium mt-2">
            &ldquo;{categoryTitleBn}&rdquo; বিভাগে বর্তমানে কোনো প্রকাশিত সংবাদ নেই।
          </p>
          <p className="text-xs text-stone-500 mt-1">
            আপনি অ্যাডমিন ড্যাশবোর্ড (/admin) থেকে এই বিভাগে নতুন সংবাদ যুক্ত করতে পারেন।
          </p>
          <button
            type="button"
            onClick={onBackHome}
            className="mt-5 px-5 py-2.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-xs"
          >
            মূল প্রচ্ছদে ফিরে যান
          </button>
        </div>
      ) : (
        <>
          {/* Category Lead Story + Category Popular Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              {categoryLead && (
                <LeadStoryCard
                  article={categoryLead}
                  author={authorsMap[categoryLead.authorId]}
                  onSelectArticle={onSelectArticle}
                  onSelectAuthor={onSelectAuthor}
                  isBookmarked={bookmarkedIds.includes(categoryLead.id)}
                  onToggleBookmark={onToggleBookmark}
                />
              )}
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-stone-50 border border-stone-200 p-5">
                <h2 className="text-base font-bold text-stone-900 pb-2.5 mb-4 border-b border-stone-200">
                  এই বিভাগে সর্বাধিক পঠিত
                </h2>
                <ol className="divide-y divide-stone-200">
                  {mostReadInCategory.map((art, idx) => (
                    <NumberedRankItem
                      key={art.id}
                      rank={idx + 1}
                      article={art}
                      onSelectArticle={onSelectArticle}
                      showViews={true}
                    />
                  ))}
                </ol>
              </div>

              {sidebarAd && (
                <ResponsiveAdSlot
                  ad={sidebarAd}
                  onInspectAdPolicy={onInspectAdPolicy}
                />
              )}
            </aside>
          </div>

          {/* Sub-grid of Category Stories */}
          {remainingArticles.length > 0 && (
            <section aria-label="বিভাগের অন্যান্য সংবাদ">
              <h2 className="text-lg font-bold text-stone-900 pb-2.5 mb-6 border-b border-stone-200">
                {categoryTitleBn} বিভাগের আরও প্রতিবেদন
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {remainingArticles.map((art) => (
                  <StandardNewsCard
                    key={art.id}
                    article={art}
                    author={authorsMap[art.authorId]}
                    onSelectArticle={onSelectArticle}
                    onSelectAuthor={onSelectAuthor}
                    isBookmarked={bookmarkedIds.includes(art.id)}
                    onToggleBookmark={onToggleBookmark}
                  />
                ))}
              </div>

              {/* Load More Pagination */}
              {categoryArticles.length > visibleCount + 1 && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="px-5 py-2.5 text-xs font-semibold text-stone-900 bg-stone-100 border border-stone-300 rounded hover:bg-stone-200 transition-colors"
                  >
                    আরও প্রতিবেদন দেখুন ({toBengaliDigits(categoryArticles.length - (visibleCount + 1))}টি বাকি)
                  </button>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* Other Categories Strip */}
      <section
        aria-label="অন্যান্য বিভাগসমূহ"
        className="pt-6 border-t border-stone-200 flex flex-wrap items-center gap-2"
      >
        <span className="text-xs font-semibold text-stone-600 mr-2">অন্যান্য বিভাগ দেখুন:</span>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.slug)}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
              categorySlug === cat.slug
                ? 'bg-red-700 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {cat.nameBn}
          </button>
        ))}
      </section>
    </div>
  );
};

/* ============================================================================
   2. DEDICATED REPORTER / AUTHOR PROFILE PAGE TEMPLATE
   ============================================================================ */
interface AuthorProfileTemplateProps {
  authorSlug: string;
  authors: Author[];
  articles: Article[];
  bookmarkedIds: string[];
  onToggleBookmark: (articleId: string) => void;
  onSelectAuthor: (slug: string) => void;
  onSelectArticle: (slug: string) => void;
  onBackHome: () => void;
}

export const AuthorProfileTemplate: React.FC<AuthorProfileTemplateProps> = ({
  authorSlug,
  authors,
  articles,
  bookmarkedIds,
  onToggleBookmark,
  onSelectAuthor,
  onSelectArticle,
  onBackHome,
}) => {
  const activeAuthor =
    authors.find((a) => a.slug === authorSlug) ?? authors[0];

  const authoredArticles = sortArticles(
    filterArticles(articles, {
      authorId: activeAuthor?.id,
      onlyPublished: true,
    }),
    'latest'
  );

  const totalViews = authoredArticles.reduce((sum, a) => sum + a.viewCount, 0);

  if (!activeAuthor) return null;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Breadcrumb & Reporter Directory Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1 font-medium text-stone-900 hover:text-red-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>প্রচ্ছদ</span>
          </button>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-red-700">প্রতিবেদক প্রোফাইল (ডেমো)</span>
          <span aria-hidden="true">/</span>
          <span>{activeAuthor.nameBn}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-stone-500 mr-1">সকল প্রতিবেদক:</span>
          {authors.map((rep) => (
            <button
              key={rep.id}
              type="button"
              onClick={() => onSelectAuthor(rep.slug)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                rep.id === activeAuthor.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {rep.nameBn}
            </button>
          ))}
        </div>
      </div>

      {/* Reporter Profile Header Card */}
      <section
        aria-label="প্রতিবেদক পরিচিতি কার্ড"
        className="bg-stone-50 border border-stone-200 p-6 sm:p-8 rounded"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {activeAuthor.avatarUrl ? (
              <img
                src={activeAuthor.avatarUrl}
                alt={activeAuthor.nameBn}
                className="w-20 h-20 rounded-full object-cover border-2 border-red-600 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-700 text-white flex items-center justify-center text-2xl font-bold shrink-0">
                {activeAuthor.avatarInitials}
              </div>
            )}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="font-semibold text-red-700">{activeAuthor.roleBn}</span>
                <span aria-hidden="true">·</span>
                <span>ডেমো প্রোফাইল</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
                {activeAuthor.nameBn}{' '}
                <span className="text-base font-normal text-stone-500">
                  ({activeAuthor.nameEn})
                </span>
              </h1>
              <p className="text-sm text-stone-700 max-w-2xl leading-relaxed">
                {activeAuthor.bioBn}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-600">
                <span className="inline-flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-red-700" />
                  <span>বিট: {activeAuthor.beatBn}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  <span>কর্মক্ষেত্র: {activeAuthor.locationBn}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-stone-500" />
                  <span>{activeAuthor.email}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col gap-4 border-t md:border-t-0 md:border-l border-stone-200 pt-4 md:pt-0 md:pl-6 shrink-0">
            <div>
              <div className="text-xs text-stone-500">প্রকাশিত ডেমো প্রতিবেদন</div>
              <div className="text-2xl font-bold text-stone-900 tabular-nums">
                {toBengaliDigits(authoredArticles.length)}টি
              </div>
            </div>
            <div>
              <div className="text-xs text-stone-500">মোট পাঠসংখ্যা (ডেমো)</div>
              <div className="text-xl font-bold text-red-700 tabular-nums">
                {formatBengaliNumber(totalViews)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authored Articles Grid */}
      <section aria-label="প্রতিবেদকের প্রকাশিত সংবাদসমূহ">
        <div className="flex items-center justify-between pb-3 mb-6 border-b-2 border-stone-900">
          <h2 className="text-xl font-bold text-stone-900">
            {activeAuthor.nameBn}-এর প্রকাশিত ডেমো প্রতিবেদনসমূহ
          </h2>
          <span className="text-xs text-stone-500 tabular-nums">
            মোট {toBengaliDigits(authoredArticles.length)}টি নিবন্ধ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {authoredArticles.map((art) => (
            <StandardNewsCard
              key={art.id}
              article={art}
              author={activeAuthor}
              onSelectArticle={onSelectArticle}
              isBookmarked={bookmarkedIds.includes(art.id)}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
   3. DEDICATED SEARCH RESULTS & POPULAR/LATEST ARCHIVE PAGE TEMPLATE
   ============================================================================ */
interface SearchAndArchiveTemplateProps {
  articles: Article[];
  categories: Category[];
  tags: Tag[];
  authorsMap: Record<string, Author>;
  searchQuery: string;
  selectedCategory: string;
  selectedTag: string;
  bookmarkedIds: string[];
  onSearchChange: (q: string) => void;
  onCategoryFilterChange: (cat: string) => void;
  onTagFilterChange: (tag: string) => void;
  onToggleBookmark: (articleId: string) => void;
  onSelectArticle: (slug: string) => void;
  onSelectAuthor: (authorSlug: string) => void;
  onBackHome: () => void;
}

export const SearchAndArchiveTemplate: React.FC<SearchAndArchiveTemplateProps> = ({
  articles,
  categories,
  tags,
  authorsMap,
  searchQuery,
  selectedCategory,
  selectedTag,
  bookmarkedIds,
  onSearchChange,
  onCategoryFilterChange,
  onTagFilterChange,
  onToggleBookmark,
  onSelectArticle,
  onSelectAuthor,
  onBackHome,
}) => {
  const [sortMode, setSortMode] = useState<'latest' | 'popular'>('latest');
  const [onlyTrending, setOnlyTrending] = useState(false);

  const filtered = sortArticles(
    filterArticles(articles, {
      categorySlug: selectedCategory,
      tag: selectedTag || undefined,
      searchQuery,
      onlyPublished: true,
      onlyTrending,
    }),
    sortMode
  );

  const handleResetAll = () => {
    onSearchChange('');
    onCategoryFilterChange('all');
    onTagFilterChange('');
    setOnlyTrending(false);
    setSortMode('latest');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pb-5 border-b-2 border-stone-900 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-600 mb-1.5">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1 font-medium text-stone-900 hover:text-red-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>প্রচ্ছদ</span>
            </button>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-red-700">অনুসন্ধান ও সংবাদ আর্কাইভ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            সর্বশেষ, জনপ্রিয় ও উন্নত সংবাদ অনুসন্ধান
          </h1>
        </div>

        <span className="text-xs font-medium text-stone-600 tabular-nums">
          ফলাফল: {toBengaliDigits(filtered.length)}টি ডেমো প্রতিবেদন
        </span>
      </div>

      {/* Advanced Filter Controls Box */}
      <section
        aria-label="উন্নত অনুসন্ধান ফিল্টার"
        className="p-5 bg-stone-50 border border-stone-200 rounded space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label
              htmlFor="archive-keyword-input"
              className="block text-xs font-semibold text-stone-700 mb-1"
            >
              শিরোনাম, স্থান বা মূলশব্দ অনুসন্ধান
            </label>
            <div className="relative">
              <input
                id="archive-keyword-input"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="যেমন: মির্জাগঞ্জ, পায়রা নদী, সুবিদখালী, আমন..."
                className="w-full pl-3 pr-9 py-2 text-xs bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-red-700"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-3">
            <label
              htmlFor="archive-category-select"
              className="block text-xs font-semibold text-stone-700 mb-1"
            >
              সংবাদ বিভাগ
            </label>
            <select
              id="archive-category-select"
              value={selectedCategory}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-red-700"
            >
              <option value="all">সকল বিভাগ</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.nameBn}
                </option>
              ))}
              <option value="video">ভিডিও সংবাদ</option>
            </select>
          </div>

          <div className="md:col-span-4 flex flex-col justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center p-0.5 bg-white rounded border border-stone-300">
                <button
                  type="button"
                  onClick={() => setSortMode('latest')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    sortMode === 'latest'
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  সর্বশেষ
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode('popular')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    sortMode === 'popular'
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  জনপ্রিয়
                </button>
              </div>

              <button
                type="button"
                onClick={() => setOnlyTrending((prev) => !prev)}
                className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                  onlyTrending
                    ? 'bg-red-700 text-white border-red-700'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                শুধু ট্রেন্ডিং
              </button>

              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tag Filter Bar */}
        <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-stone-600 mr-1">আলোচিত ট্যাগ:</span>
          <button
            type="button"
            onClick={() => onTagFilterChange('')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              !selectedTag
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            সব ট্যাগ
          </button>
          {tags.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                onTagFilterChange(selectedTag === t.nameBn ? '' : t.nameBn)
              }
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                selectedTag === t.nameBn
                  ? 'bg-red-700 text-white font-medium'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              #{t.nameBn}
            </button>
          ))}
        </div>
      </section>

      {/* Results Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 px-4 text-center bg-stone-50 border border-stone-200 rounded max-w-xl mx-auto">
          <SearchX className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-stone-900">
            আপনার অনুসন্ধানে কোনো ডেমো প্রতিবেদন পাওয়া যায়নি
          </h2>
          <p className="text-sm text-stone-600 mt-1.5">
            ভিন্ন শব্দ নির্বাচন করুন অথবা সকল ফিল্টার রিসেট করে সম্পূর্ণ আর্কাইভ দেখুন।
          </p>
          <button
            type="button"
            onClick={handleResetAll}
            className="mt-5 px-4 py-2 text-xs font-medium bg-red-700 text-white rounded hover:bg-red-800 transition-colors"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((art) => (
            <StandardNewsCard
              key={art.id}
              article={art}
              author={authorsMap[art.authorId]}
              onSelectArticle={onSelectArticle}
              onSelectAuthor={onSelectAuthor}
              isBookmarked={bookmarkedIds.includes(art.id)}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   4. STATIC & INTERACTIVE INSTITUTIONAL PAGES (About, Contact, Policies, Terms)
   ============================================================================ */
interface StaticPagesTemplateProps {
  view: Extract<
    PortalPublicView,
    'about' | 'contact' | 'editorial-policy' | 'privacy-policy' | 'terms'
  >;
  settings: SiteSettings;
  authors: Author[];
  onSwitchView: (view: PortalPublicView) => void;
  onSelectAuthor: (slug: string) => void;
  onSubmitContactMessage: (msg: Omit<ContactMessage, 'id' | 'submittedAtBn' | 'status'>) => void;
}

export const StaticPagesTemplate: React.FC<StaticPagesTemplateProps> = ({
  view,
  settings,
  authors,
  onSwitchView,
  onSelectAuthor,
  onSubmitContactMessage,
}) => {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<ContactMessage['category']>('news_tip');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateContactForm({
      senderName,
      senderEmail,
      subject,
      message,
    });
    if (!validation.valid) {
      setErrors(validation.errors as Record<string, string>);
      setSubmittedSuccess(false);
      return;
    }

    setErrors({});
    onSubmitContactMessage({
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim(),
      subject: subject.trim(),
      category,
      message: message.trim(),
    });
    setSenderName('');
    setSenderEmail('');
    setSubject('');
    setMessage('');
    setSubmittedSuccess(true);
  };

  const navItems: { id: StaticPagesTemplateProps['view']; labelBn: string }[] = [
    { id: 'about', labelBn: 'আমাদের সম্পর্কে' },
    { id: 'contact', labelBn: 'যোগাযোগ ও সংবাদ পাঠান' },
    { id: 'editorial-policy', labelBn: 'সম্পাদকীয় নীতিমালা' },
    { id: 'privacy-policy', labelBn: 'গোপনীয়তা নীতি' },
    { id: 'terms', labelBn: 'ব্যবহারের শর্তাবলি' },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <div className="pb-4 mb-6 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onSwitchView('home')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-900 hover:text-red-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>প্রচ্ছদে ফিরে যান</span>
        </button>

        {/* Sub-navigation across institutional pages */}
        <div className="flex flex-wrap items-center gap-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSubmittedSuccess(false);
                onSwitchView(item.id);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                view === item.id
                  ? 'bg-red-700 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {item.labelBn}
            </button>
          ))}
        </div>
      </div>

      {view === 'about' && (
        <div className="space-y-10">
          <div className="max-w-3xl space-y-4">
            <div className="text-xs font-semibold text-red-700">
              পোর্টাল পরিচিতি · ডেমো সংস্করণ
            </div>
            <h1 className="text-3xl font-bold text-stone-900">
              {settings.portalNameBn} ({settings.portalNameEn}) সম্পর্কে
            </h1>
            <p className="text-base text-stone-700 leading-relaxed">
              <strong>নিউজ মির্জাগঞ্জ (News Mirzaganj)</strong> পটুয়াখালী জেলার মির্জাগঞ্জ উপজেলার ৬টি ইউনিয়ন (মাধবখালী, মির্জাগঞ্জ, আমড়াগাছিয়া, দেউলী সুবিদখালী, কাকড়াবুনিয়া ও মজিদবাড়িয়া), উপকূলীয় জনপদ এবং সমগ্র বাংলাদেশের ট্রেন্ডিং ও জনগুরুত্বপূর্ণ সংবাদের একটি আধুনিক ডিজিটাল সংবাদ পোর্টাল প্রোটোটাইপ।
            </p>
            <p className="text-sm text-stone-600 leading-relaxed">
              পাঠকের কাছে বিভ্রান্তিমুক্ত তথ্য পৌঁছাতে এই ডেমো সংস্করণে ব্যবহৃত সকল নমুনা প্রতিবেদন স্পষ্টভাবে <strong>&ldquo;কাল্পনিক ডেমো প্রতিবেদন&rdquo;</strong> হিসেবে চিহ্নিত করা হয়েছে।
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Developer Card */}
              <div className="p-4 bg-stone-900 text-white rounded-xl border-l-4 border-amber-500 flex items-center gap-4">
                <img
                  src={settings.developerPhotoUrl || '/assets/aistudio/____6f31a55b.png'}
                  alt={settings.developerNameBn || 'মোঃ আঃ কাইয়ূম'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shrink-0 bg-stone-800"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-amber-400">
                    {settings.developerRoleBn || 'পোর্টাল ডেভেলপার ও কারিগরি নির্মাতা'}
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5 truncate">
                    {settings.developerNameBn || 'মোঃ আঃ কাইয়ূম'}
                  </div>
                  <a
                    href={settings.developerFacebookUrl || 'https://www.facebook.com/freelancerkaium143/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-[11px] font-bold text-white transition-colors"
                  >
                    <span>ফেসবুক আইডি: freelancerkaium143</span>
                  </a>
                </div>
              </div>

              {/* Main Admin / Editor Card */}
              <div className="p-4 bg-stone-900 text-white rounded-xl border-l-4 border-emerald-500 flex items-center gap-4">
                <img
                  src={
                    settings.adminPhotoUrl ||
                    '/assets/aistudio/c86a50b4-d4d1-4994-b557-8e1f3319ba81_e3e38474.jfif'
                  }
                  alt={settings.editorNameBn}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400 shrink-0 bg-stone-800"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-emerald-400">
                    প্রধান অ্যাডমিন ও ভারপ্রাপ্ত সম্পাদক
                  </div>
                  <div className="text-lg font-bold text-white mt-0.5 truncate">
                    {settings.editorNameBn}
                  </div>
                  <div className="text-xs text-stone-300 mt-1">
                    {settings.editorialEmail}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section aria-label="বার্তা কক্ষ ও প্রতিবেদক দল">
            <h2 className="text-xl font-bold text-stone-900 pb-3 mb-6 border-b-2 border-stone-900">
              আমাদের ডেমো বার্তা কক্ষ ও প্রতিবেদকবৃন্দ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {authors.map((rep) => (
                <div
                  key={rep.id}
                  className="p-5 bg-stone-50 border border-stone-200 rounded flex flex-col justify-between"
                >
                  <div>
                    {rep.avatarUrl ? (
                      <img
                        src={rep.avatarUrl}
                        alt={rep.nameBn}
                        className="w-12 h-12 rounded-full object-cover border-2 border-red-600 mb-3"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center text-sm font-bold mb-3">
                        {rep.avatarInitials}
                      </div>
                    )}
                    <h3 className="text-base font-bold text-stone-900">{rep.nameBn}</h3>
                    <p className="text-xs text-red-700 font-medium mt-0.5">{rep.roleBn}</p>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed line-clamp-3">
                      {rep.bioBn}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectAuthor(rep.slug)}
                    className="mt-4 pt-3 border-t border-stone-200 text-xs font-semibold text-stone-900 hover:text-red-700 text-left"
                  >
                    প্রোফাইল ও প্রতিবেদন দেখুন →
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {view === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="text-xs font-semibold text-red-700 mb-1">
                বার্তা কক্ষ যোগাযোগ
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
                যোগাযোগ করুন বা স্থানীয় সংবাদের তথ্য দিন
              </h1>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                মির্জাগঞ্জ উপজেলার যেকোনো ইউনিয়নের জনদুর্ভোগ, উন্নয়ন, কৃষি বা শিক্ষার খবর, সংশোধনী অথবা বিজ্ঞাপনের জন্য নিচের ফরমে বার্তা পাঠান। আপনার বার্তাটি সরাসরি অ্যাডমিন প্যানেলের (/admin) ইনবক্সে জমা হবে।
              </p>
            </div>

            <div className="p-5 bg-stone-50 border border-stone-200 rounded space-y-3 text-xs sm:text-sm text-stone-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-red-700 shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-stone-900">কার্যালয় (ডেমো):</div>
                  <div>{settings.officeAddressBn}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-red-700 shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-stone-900">বার্তা ও সম্পাদকীয় ইমেইল:</div>
                  <div>{settings.editorialEmail}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-red-700 shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-stone-900">বার্তা কক্ষ টেলিফোন:</div>
                  <div>{settings.newsroomPhoneBn}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleContactSubmit}
              noValidate
              className="p-6 bg-stone-50 border border-stone-200 rounded space-y-4"
            >
              <h2 className="text-lg font-bold text-stone-900 pb-2 border-b border-stone-200">
                পাঠক বার্তা ও সংবাদ টিপস ফরম
              </h2>

              {submittedSuccess && (
                <div
                  role="status"
                  className="p-3.5 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-950 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    আপনার বার্তাটি সফলভাবে বার্তা কক্ষের ইনবক্সে জমা হয়েছে! অ্যাডমিন ড্যাশবোর্ড (/admin) থেকে এটি পর্যালোচনা করা যাবে।
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold text-stone-800 mb-1"
                  >
                    আপনার নাম *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="যেমন: মো. রফিকুল ইসলাম"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-red-700"
                  />
                  {errors.senderName && (
                    <p className="text-xs text-red-700 mt-1">{errors.senderName}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold text-stone-800 mb-1"
                  >
                    ইমেইল ঠিকানা *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-red-700"
                  />
                  {errors.senderEmail && (
                    <p className="text-xs text-red-700 mt-1">{errors.senderEmail}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-category"
                    className="block text-xs font-semibold text-stone-800 mb-1"
                  >
                    বার্তার ধরন
                  </label>
                  <select
                    id="contact-category"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as ContactMessage['category'])
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-red-700"
                  >
                    <option value="news_tip">স্থানীয় সংবাদের তথ্য (News Tip)</option>
                    <option value="correction">তথ্য সংশোধনী অনুরোধ</option>
                    <option value="advertising">বিজ্ঞাপন সংক্রান্ত</option>
                    <option value="general">সাধারণ মতামত</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-semibold text-stone-800 mb-1"
                  >
                    বিষয় / শিরোনাম *
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="সংক্ষেপে বার্তার বিষয় লিখুন..."
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-red-700"
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-700 mt-1">{errors.subject}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold text-stone-800 mb-1"
                >
                  বিস্তারিত বার্তা * (অন্তত ১০ অক্ষর)
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="আপনার এলাকার ঘটনা বা মতামতের বিস্তারিত লিখুন..."
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-red-700"
                />
                {errors.message && (
                  <p className="text-xs text-red-700 mt-1">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-red-700 text-white rounded hover:bg-red-800 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>বার্তা পাঠান</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {view === 'editorial-policy' && (
        <div className="max-w-3xl space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            সম্পাদকীয় নীতিমালা — {settings.portalNameBn}
          </h1>
          <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
            <p>
              <strong>১. বস্তুনিষ্ঠতা ও তথ্য যাচাই:</strong> নিউজ মির্জাগঞ্জ যেকোনো সংবাদ প্রকাশের পূর্বে অন্তত দুটি স্বতন্ত্র সূত্র থেকে তথ্য যাচাই করার নীতি অনুসরণ করে। ডেমো পরিবেশে সকল নমুনা প্রতিবেদন স্পষ্টভাবে কাল্পনিক ডেমো হিসেবে চিহ্নিত রাখা হয়েছে।
            </p>
            <p>
              <strong>২. সংশোধনী নীতি:</strong> প্রকাশিত কোনো প্রতিবেদনে অনিচ্ছাকৃত তথ্যগত ত্রুটি পরিলক্ষিত হলে তাৎক্ষণিক সংশোধনী নোটসহ হালনাগাদ করা হয়।
            </p>
            <p>
              <strong>৩. বিজ্ঞাপন ও সম্পাদকীয় স্বাধীনতা:</strong> বিজ্ঞাপন বা স্পনসরড কন্টেন্ট সর্বদা সাধারণ সংবাদ থেকে আলাদাভাবে &ldquo;বিজ্ঞাপন স্থান&rdquo; লেবেলসহ প্রদর্শিত হয়।
            </p>
          </div>
        </div>
      )}

      {view === 'privacy-policy' && (
        <div className="max-w-3xl space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            গোপনীয়তা নীতি (Privacy Policy) — {settings.portalNameBn}
          </h1>
          <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
            <p>
              <strong>১. পাঠকের ডেটা সুরক্ষা:</strong> নিউজ মির্জাগঞ্জ পাঠকের ব্যক্তিগত গোপনীয়তাকে সর্বোচ্চ সম্মান করে। সংরক্ষিত সংবাদ তালিকা (Bookmarks) কেবল আপনার ব্রাউজারের লোকাল স্টোরেজে সংরক্ষিত থাকে।
            </p>
            <p>
              <strong>২. যোগাযোগ ফরমের তথ্য:</strong> যোগাযোগ পাতার মাধ্যমে প্রেরিত নাম ও ইমেইল কেবল পাঠকের বার্তার উত্তর প্রদান বা সংবাদ যাচাইয়ের কাজে ব্যবহৃত হয়।
            </p>
          </div>
        </div>
      )}

      {view === 'terms' && (
        <div className="max-w-3xl space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            ব্যবহারের শর্তাবলি (Terms of Use) — {settings.portalNameBn}
          </h1>
          <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
            <p>
              <strong>১. ডেমো সংস্করণ ঘোষণা:</strong> এই ওয়েব অ্যাপ্লিকেশনটির সকল প্রতিবেদন ইউআই ও কারিগরি প্রদর্শনের জন্য নির্মিত কাল্পনিক নমুনা। কোনো ডেমো নিবন্ধকে বাস্তব সংবাদ হিসেবে উদ্ধৃত করা যাবে না।
            </p>
            <p>
              <strong>২. মেধাস্বত্ব ও উদ্ধৃতি:</strong> পোর্টালের নকশা, কোড কাঠামো এবং মৌলিক বিশ্লেষণ নিউজ মির্জাগঞ্জ কর্তৃপক্ষের সংরক্ষিত।
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
