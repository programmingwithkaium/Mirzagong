import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, Camera, MapPin, Play, Volume2 } from 'lucide-react';
import type { Advertisement, Article, Author } from '../types/news.ts';
import {
  CompactHorizontalCard,
  HeroSideFeedCard,
  LeadStoryCard,
  NumberedRankItem,
  ResponsiveAdSlot,
  StandardNewsCard,
  TrendingFeatureCard,
  VideoNewsCard,
} from './NewsCards.tsx';
import { EditorialImage } from './EditorialImage.tsx';
import { SubidkhaliCollegeSpotlight } from './SubidkhaliCollegeSpotlight.tsx';
import { sortArticles, toBengaliDigits } from '../utils/newsLogic.ts';

interface HomePageProps {
  articles: Article[];
  authorsMap: Record<string, Author>;
  advertisements: Advertisement[];
  bookmarkedIds: string[];
  onToggleBookmark: (articleId: string) => void;
  onSelectArticle: (slug: string) => void;
  onSelectCategory: (categorySlug: string) => void;
  onSelectAuthor: (authorSlug: string) => void;
  onInspectAdPolicy: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  articles,
  authorsMap,
  advertisements,
  bookmarkedIds,
  onToggleBookmark,
  onSelectArticle,
  onSelectCategory,
  onSelectAuthor,
  onInspectAdPolicy,
}) => {
  const [sidebarTab, setSidebarTab] = useState<'latest' | 'popular'>('latest');
  const [spotFilter, setSpotFilter] = useState<
    'all' | 'payra' | 'college_school' | 'landmarks' | 'subidkhali'
  >('all');

  const videoArticles = articles.filter((a) => a.isVideo);
  const [selectedVideo, setSelectedVideo] = useState<Article>(
    videoArticles[0] ?? articles[0]
  );
  const [isPlayingDemoVideo, setIsPlayingDemoVideo] = useState(false);

  const leadArticle = articles.find((a) => a.isLeadStory) ?? articles[0];

  // Right-side 3 stacked hero feed stories matching the reference layout
  const heroSideArticles = articles
    .filter((a) => a.id !== leadArticle?.id)
    .slice(0, 3);

  // Trending News ("ট্রেন্ডিং নিউজ") 2-column feature row matching the reference layout
  const trendingArticles = articles.filter(
    (a) =>
      a.id !== leadArticle?.id &&
      !heroSideArticles.some((hs) => hs.id === a.id) &&
      (a.isTrending || a.isFeatured)
  );
  const topTwoTrending =
    trendingArticles.length >= 2
      ? trendingArticles.slice(0, 2)
      : articles.filter((a) => a.id !== leadArticle?.id).slice(0, 2);

  const rankedSidebarArticles = sortArticles(articles, sidebarTab).slice(0, 6);

  const mirzaganjPhotoFeatureArticles = articles.filter((a) => {
    if (spotFilter === 'payra') {
      return a.visualTheme === 'payra_river' || a.tags.includes('পায়রা-নদী');
    }
    if (spotFilter === 'college_school') {
      return (
        a.visualTheme === 'subidkhali_college' ||
        a.visualTheme === 'pilot_school' ||
        a.categorySlug === 'education'
      );
    }
    if (spotFilter === 'landmarks') {
      return (
        a.visualTheme === 'mirzaganj_shrine_mosque' ||
        a.visualTheme === 'mirzaganj_tourism' ||
        a.categorySlug === 'culture'
      );
    }
    if (spotFilter === 'subidkhali') {
      return a.visualTheme === 'subidkhali_bazar' || a.tags.includes('সুবিদখালী-সদর');
    }
    return (
      a.visualTheme === 'payra_river' ||
      a.visualTheme === 'subidkhali_college' ||
      a.visualTheme === 'pilot_school' ||
      a.visualTheme === 'mirzaganj_shrine_mosque' ||
      a.visualTheme === 'subidkhali_bazar' ||
      a.visualTheme === 'mirzaganj_tourism'
    );
  });

  const mirzaganjAndNationalArticles = articles.filter(
    (a) =>
      a.categorySlug === 'mirzaganj' ||
      a.categorySlug === 'national' ||
      a.categorySlug === 'politics'
  );
  const economyArticles = articles.filter((a) => a.categorySlug === 'economy');
  const techArticles = articles.filter((a) => a.categorySlug === 'technology');
  const sportsCultureArticles = articles.filter(
    (a) =>
      a.categorySlug === 'sports' ||
      a.categorySlug === 'culture' ||
      a.categorySlug === 'international'
  );
  const opinionArticles = articles.filter(
    (a) => a.isOpinion || a.categorySlug === 'opinion'
  );

  const leaderboardAd = advertisements.find((a) => a.slotId === 'header-leaderboard');
  const sidebarAd = advertisements.find((a) => a.slotId === 'sidebar-rectangle');
  const midPageAd = advertisements.find((a) => a.slotId === 'mid-page-banner');

  if (!leadArticle) return null;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-4 pb-12 space-y-12">
      {/* 1. Primary Hero News Feed (Left 7 Cols Lead Story with Overlapping Card + Right 5 Cols 3 Stacked Feed Cards) */}
      <section aria-label="প্রতিদিনের প্রধান সংবাদ ফিড">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left 7 Columns: Large Featured Story with Overlapping Red-Bottom-Border Card */}
          <div className="lg:col-span-7">
            <LeadStoryCard
              article={leadArticle}
              author={authorsMap[leadArticle.authorId]}
              onSelectArticle={onSelectArticle}
              onSelectAuthor={onSelectAuthor}
              isBookmarked={bookmarkedIds.includes(leadArticle.id)}
              onToggleBookmark={onToggleBookmark}
            />
          </div>

          {/* Right 5 Columns: 3 Stacked Horizontal News Cards with Red Circular Arrow Buttons */}
          <div className="lg:col-span-5 divide-y divide-stone-200 space-y-4">
            {heroSideArticles.map((article, idx) => (
              <div key={article.id} className={idx > 0 ? 'pt-4' : ''}>
                <HeroSideFeedCard
                  article={article}
                  author={authorsMap[article.authorId]}
                  onSelectArticle={onSelectArticle}
                  onSelectAuthor={onSelectAuthor}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. "ট্রেন্ডিং নিউজ" (Trending News 2-Column Large Feature Section matching reference image) */}
      <section aria-label="ট্রেন্ডিং নিউজ">
        <div className="flex items-center justify-between pb-2.5 mb-6 border-b border-stone-200">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600">
            ট্রেন্ডিং নিউজ
          </h2>
          <button
            type="button"
            onClick={() => onSelectCategory('trending')}
            className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-red-600 transition-colors"
          >
            <span>সকল ট্রেন্ডিং খবর</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {topTwoTrending.map((article) => (
            <TrendingFeatureCard
              key={article.id}
              article={article}
              author={authorsMap[article.authorId]}
              onSelectArticle={onSelectArticle}
              onSelectAuthor={onSelectAuthor}
            />
          ))}
        </div>
      </section>

      {/* 3. মির্জাগঞ্জ, পায়রা, সুবিদখালী কলেজ, পাইলট স্কুল ও দর্শনীয় স্থান — ছবিসহ বিশেষ গ্যালারি */}
      <section
        aria-label="মির্জাগঞ্জ, পায়রা, সুবিদখালী কলেজ, পাইলট স্কুল ও দর্শনীয় স্থান ছবিসহ গ্যালারি"
        className="bg-stone-50/80 border border-stone-200 p-5 sm:p-7"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 mb-6 border-b border-stone-300">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 mb-1">
              <Camera className="w-3.5 h-3.5" />
              <span>মির্জাগঞ্জ স্পেশাল ফটো জার্নালিজম ফিড</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              মির্জাগঞ্জ, পায়রা নদী, সুবিদখালী কলেজ, পাইলট স্কুল ও দর্শনীয় স্থান
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              মজিদবাড়িয়া শাহী মসজিদ, হযরত ইয়ার উদ্দিন খলিফা (রহ.) মাজার শরীফ, সুবিদখালী সরকারি কলেজ, রইচ উদ্দিন পাইলট উচ্চ বিদ্যালয় ও পায়রা নদীর ছবিসহ প্রতিবেদন
            </p>
          </div>

          <div
            role="tablist"
            aria-label="মির্জাগঞ্জ ফটো ফিল্টার"
            className="flex flex-wrap items-center gap-1.5"
          >
            {[
              { id: 'all' as const, label: 'সব ছবি (৬)' },
              { id: 'payra' as const, label: 'পায়রা নদী' },
              { id: 'college_school' as const, label: 'সুবিদখালী কলেজ ও পাইলট স্কুল' },
              { id: 'landmarks' as const, label: 'দর্শনীয় স্থান' },
              { id: 'subidkhali' as const, label: 'সুবিদখালী সদর' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={spotFilter === tab.id}
                onClick={() => setSpotFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  spotFilter === tab.id
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mirzaganjPhotoFeatureArticles.slice(0, 6).map((item) => {
            const itemAuthor = authorsMap[item.authorId];
            return (
              <article
                key={item.id}
                className="group bg-white border border-stone-200 p-4 flex flex-col justify-between hover:border-stone-400 transition-colors"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => onSelectArticle(item.slug)}
                    className="w-full text-left block focus-visible:outline-2 focus-visible:outline-red-600"
                  >
                    <div className="relative mb-3">
                      <EditorialImage
                        theme={item.visualTheme}
                        imageUrl={item.imageUrl}
                        alt={item.seoMeta.ogImageAlt}
                        aspectRatio="16:9"
                        locationBadgeBn={item.locationBn}
                      />
                      <span className="absolute top-2.5 left-2.5 z-10 bg-white text-stone-900 px-2.5 py-0.5 text-[11px] font-bold shadow-xs">
                        {item.categoryNameBn}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 mb-1.5">
                      <span>
                        {itemAuthor ? itemAuthor.nameBn : 'এইচ এম কাইয়ুম ইসলাম'} - ১ ঘণ্টা আগে
                      </span>
                      {item.galleryImages && item.galleryImages.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                          <Camera className="w-3 h-3" />
                          <span>{toBengaliDigits(item.galleryImages.length)}টি ছবি</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-red-600 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs text-stone-600 leading-relaxed line-clamp-2">
                      নিউজ মির্জাগঞ্জ ডেস্ক // {item.summary}
                    </p>
                  </button>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-stone-500 truncate">
                    <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                    <span className="truncate">{item.locationBn}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectArticle(item.slug)}
                    aria-label="ছবিসহ বিস্তারিত পড়ুন"
                    className="w-7 h-7 rounded-full bg-red-600 group-hover:bg-red-700 text-white flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3B. সুবিদখালী সরকারি কলেজ — প্রাতিষ্ঠানিক প্রোফাইল, গুরুত্বপূর্ণ তথ্যাদি ও বাস্তব আলোকচিত্র গ্যালারি */}
      <SubidkhaliCollegeSpotlight onSelectArticle={onSelectArticle} />

      {/* 4. Leaderboard Responsive Advertisement Placeholder */}
      {leaderboardAd && (
        <ResponsiveAdSlot
          ad={leaderboardAd}
          onInspectAdPolicy={onInspectAdPolicy}
        />
      )}

      {/* 5. মির্জাগঞ্জ জনপদ ও সারাদেশ + সর্বাধিক পঠিত সাইডবার */}
      <section aria-label="মির্জাগঞ্জ জনপদ ও সারাদেশের সংবাদ">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 mb-6 border-b border-stone-200">
              <h2 className="text-xl sm:text-2xl font-bold text-red-600">
                মির্জাগঞ্জ জনপদ ও সারাদেশ
              </h2>
              <button
                type="button"
                onClick={() => onSelectCategory('mirzaganj')}
                className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-red-600"
              >
                <span>সব সংবাদ দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {mirzaganjAndNationalArticles.slice(0, 4).map((article) => (
                <StandardNewsCard
                  key={article.id}
                  article={article}
                  author={authorsMap[article.authorId]}
                  onSelectArticle={onSelectArticle}
                  onSelectAuthor={onSelectAuthor}
                  isBookmarked={bookmarkedIds.includes(article.id)}
                  onToggleBookmark={onToggleBookmark}
                />
              ))}
            </div>
          </div>

          {/* Right 4 Columns: Latest / Most Read Tabs + Sidebar Ad */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-stone-50/80 border border-stone-200 p-5">
              <div
                role="tablist"
                aria-label="সর্বশেষ ও সর্বাধিক পঠিত সংবাদ তালিকা"
                className="grid grid-cols-2 gap-1 p-1 bg-stone-200/80 mb-5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={sidebarTab === 'latest'}
                  onClick={() => setSidebarTab('latest')}
                  className={`py-2 px-3 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    sidebarTab === 'latest'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  সর্বশেষ সংবাদ
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={sidebarTab === 'popular'}
                  onClick={() => setSidebarTab('popular')}
                  className={`py-2 px-3 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    sidebarTab === 'popular'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  সর্বাধিক পঠিত
                </button>
              </div>

              <ol className="divide-y divide-stone-200">
                {rankedSidebarArticles.map((art, index) => (
                  <NumberedRankItem
                    key={art.id}
                    rank={index + 1}
                    article={art}
                    onSelectArticle={onSelectArticle}
                    showViews={sidebarTab === 'popular'}
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
      </section>

      {/* 6. অর্থনীতি ও প্রযুক্তি (Economy & Technology Two-Column Split) */}
      <section aria-label="অর্থনীতি ও প্রযুক্তি বিভাগ">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <div className="flex items-center justify-between pb-2.5 mb-6 border-b border-stone-200">
              <h2 className="text-xl font-bold text-red-600">অর্থনীতি ও বাজারদর</h2>
              <button
                type="button"
                onClick={() => onSelectCategory('economy')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-red-600"
              >
                <span>সব দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {economyArticles[0] && (
              <div className="space-y-5">
                <StandardNewsCard
                  article={economyArticles[0]}
                  author={authorsMap[economyArticles[0].authorId]}
                  onSelectArticle={onSelectArticle}
                  onSelectAuthor={onSelectAuthor}
                  isBookmarked={bookmarkedIds.includes(economyArticles[0].id)}
                  onToggleBookmark={onToggleBookmark}
                />
                <div className="space-y-3">
                  {economyArticles.slice(1).map((art) => (
                    <CompactHorizontalCard
                      key={art.id}
                      article={art}
                      onSelectArticle={onSelectArticle}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-6">
            <div className="flex items-center justify-between pb-2.5 mb-6 border-b border-stone-200">
              <h2 className="text-xl font-bold text-red-600">প্রযুক্তি ও ফ্রিল্যান্সিং</h2>
              <button
                type="button"
                onClick={() => onSelectCategory('technology')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-red-600"
              >
                <span>সব দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {techArticles[0] && (
              <div className="space-y-5">
                <StandardNewsCard
                  article={techArticles[0]}
                  author={authorsMap[techArticles[0].authorId]}
                  onSelectArticle={onSelectArticle}
                  onSelectAuthor={onSelectAuthor}
                  isBookmarked={bookmarkedIds.includes(techArticles[0].id)}
                  onToggleBookmark={onToggleBookmark}
                />
                <div className="space-y-3">
                  {techArticles.slice(1).map((art) => (
                    <CompactHorizontalCard
                      key={art.id}
                      article={art}
                      onSelectArticle={onSelectArticle}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. ভিডিও সংবাদ (Video News Broadcast Theater) */}
      {selectedVideo && (
        <section
          aria-label="ভিডিও সংবাদ গ্যালারি"
          className="bg-stone-950 text-stone-100 p-6 sm:p-8 border border-stone-800"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-400 mb-1">
                <span className="font-semibold text-red-400">মাল্টিমিডিয়া ডেস্ক</span>
                <span aria-hidden="true">·</span>
                <span>কাল্পনিক ডেমো ভিডিও প্রতিবেদন</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                ভিডিও সংবাদ ও প্রামাণ্যচিত্র
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onSelectCategory('video')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-200 bg-stone-900 border border-stone-700 hover:bg-stone-800 transition-colors"
            >
              <span>সকল ভিডিও প্রতিবেদন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-stone-900 border border-stone-800 p-4 sm:p-5">
              <EditorialImage
                theme={selectedVideo.visualTheme}
                alt={selectedVideo.seoMeta.ogImageAlt}
                aspectRatio="16:9"
                isVideo={!isPlayingDemoVideo}
                videoDurationBn={selectedVideo.videoDurationBn}
                className="mb-4"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <span className="font-semibold text-red-400">
                    {selectedVideo.categoryNameBn}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    ব্যাপ্তি: {selectedVideo.videoDurationBn ?? '০৪:৩০'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlayingDemoVideo((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    {isPlayingDemoVideo ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>ডেমো ট্রান্সক্রিপ্ট চালু আছে</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>ডেমো প্রিভিউ চালান</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectArticle(selectedVideo.slug)}
                    className="px-3 py-1.5 text-xs font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 transition-colors"
                  >
                    মূল নিবন্ধ পড়ুন
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white leading-snug">
                {selectedVideo.title}
              </h3>
              <p className="mt-2 text-sm text-stone-300 leading-relaxed">
                {selectedVideo.summary}
              </p>

              {isPlayingDemoVideo && (
                <div className="mt-4 p-3.5 bg-stone-950 border border-stone-800 text-xs text-stone-300 leading-relaxed">
                  <div className="font-semibold text-red-400 mb-1">
                    ডেমো অডিও/ভিডিও স্ক্রিপ্ট ও সারাংশ:
                  </div>
                  <p>
                    {selectedVideo.videoTranscriptBn ??
                      'এই ডেমো ভিডিও প্রতিবেদনে মাঠপর্যায়ের চিত্র ও বিশেষজ্ঞ বিশ্লেষণের একটি কাল্পনিক খসড়া উপস্থাপন করা হয়েছে।'}
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {videoArticles.slice(0, 3).map((vid) => (
                <VideoNewsCard
                  key={vid.id}
                  article={vid}
                  isActive={selectedVideo.id === vid.id}
                  onSelectVideo={(v) => {
                    setSelectedVideo(v);
                    setIsPlayingDemoVideo(true);
                  }}
                  onOpenFullArticle={onSelectArticle}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. খেলাধুলা, সংস্কৃতি ও মতামত */}
      <section aria-label="খেলাধুলা, সংস্কৃতি ও মতামত">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-200">
              <h2 className="text-xl font-bold text-red-600">
                খেলাধুলা, ঐতিহ্য ও বিশ্ব পরিক্রমা
              </h2>
              <span className="text-xs text-stone-500">ডেমো ফিচার সমগ্র</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {sportsCultureArticles.slice(0, 3).map((art) => (
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

            {midPageAd && (
              <ResponsiveAdSlot
                ad={midPageAd}
                onInspectAdPolicy={onInspectAdPolicy}
              />
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="flex items-center justify-between pb-2.5 mb-6 border-b border-stone-200">
              <h2 className="text-xl font-bold text-red-600">মতামত ও বিশ্লেষণ</h2>
              <button
                type="button"
                onClick={() => onSelectCategory('opinion')}
                className="text-xs font-semibold text-stone-700 hover:text-red-600"
              >
                সকল কলাম
              </button>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-5 space-y-5">
              {opinionArticles.map((op) => {
                const opAuthor = authorsMap[op.authorId];
                return (
                  <article key={op.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {opAuthor ? opAuthor.avatarInitials : 'কলাম'}
                      </div>
                      <div className="text-xs">
                        {opAuthor ? (
                          <button
                            type="button"
                            onClick={() => onSelectAuthor(opAuthor.slug)}
                            className="font-bold text-stone-900 hover:text-red-600 underline underline-offset-4 text-left"
                          >
                            {opAuthor.nameBn}
                          </button>
                        ) : (
                          <div className="font-bold text-stone-900">
                            সম্পাদকীয় কলামিস্ট
                          </div>
                        )}
                        <div className="text-stone-500">
                          {opAuthor ? opAuthor.roleBn : 'বিশেষ বিশ্লেষক (ডেমো)'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectArticle(op.slug)}
                      className="text-left block group"
                    >
                      <h3 className="text-lg font-bold text-stone-900 group-hover:text-red-600 transition-colors leading-snug">
                        {op.title}
                      </h3>
                      <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                        {op.summary}
                      </p>
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
