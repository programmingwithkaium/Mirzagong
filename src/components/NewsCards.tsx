import React from 'react';
import { ArrowUpRight, Bookmark, Play } from 'lucide-react';
import type { Advertisement, Article, Author } from '../types/news.ts';
import { EditorialImage } from './EditorialImage.tsx';
import { formatBengaliNumber, toBengaliDigits } from '../utils/newsLogic.ts';

interface BaseCardProps {
  article: Article;
  author?: Author;
  onSelectArticle: (slug: string) => void;
  onSelectCategory?: (categorySlug: string) => void;
  onSelectAuthor?: (authorSlug: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (articleId: string) => void;
}

/**
 * LeadStoryCard matching the reference "প্রতিদিনের খবর" left hero card:
 * - Large image with top-left white category badge
 * - Overlapping bottom white card with thick red bottom border (border-b-4 border-red-600)
 * - Author + timestamp metadata, bold Bengali headline, and circular red ArrowUpRight button
 */
export const LeadStoryCard: React.FC<BaseCardProps> = ({
  article,
  author,
  onSelectArticle,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const authorName = author ? author.nameBn : 'এইচ এম কাইয়ুম ইসলাম';

  return (
    <article className="group relative">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectArticle(article.slug)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectArticle(article.slug);
          }
        }}
        className="text-left w-full block cursor-pointer focus-visible:outline-2 focus-visible:outline-red-600"
      >
        {/* Hero Image Container */}
        <div className="relative overflow-hidden bg-stone-900">
          <EditorialImage
            theme={article.visualTheme}
            imageUrl={article.imageUrl}
            alt={article.seoMeta.ogImageAlt}
            aspectRatio="16:9"
            isVideo={article.isVideo}
            videoDurationBn={article.videoDurationBn}
            locationBadgeBn={article.locationBn}
            priority={true}
            className="w-full"
          />

          {/* Top-Left Crisp White Category Tag */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="bg-white text-stone-900 px-3.5 py-1 text-xs font-bold shadow-sm">
              {article.categoryNameBn}
            </span>
          </div>

          {onToggleBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(article.id);
              }}
              aria-label={
                isBookmarked
                  ? `"${article.title}" সংরক্ষণ তালিকা থেকে সরান`
                  : `"${article.title}" সংরক্ষণ করুন`
              }
              className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-sm transition-colors ${
                isBookmarked
                  ? 'bg-red-600 text-white'
                  : 'bg-white/90 text-stone-700 hover:bg-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Overlapping White Box with Thick Red Bottom Border & Red Circle Arrow */}
        <div className="relative z-10 -mt-12 sm:-mt-16 mx-3 sm:mx-6 bg-white p-4 sm:p-6 shadow-md border border-stone-100 border-b-4 border-b-red-600 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 mb-1.5">
              <span className="font-medium text-stone-600">{authorName}</span>
              <span aria-hidden="true">-</span>
              <span>১ ঘণ্টা আগে</span>
              <span aria-hidden="true">·</span>
              <span className="text-red-600 font-semibold">{article.locationBn}</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-stone-900 leading-snug group-hover:text-red-600 transition-colors">
              {article.title}
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
              নিউজ মির্জাগঞ্জ ডেস্ক // {article.summary}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-red-600 group-hover:bg-red-700 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105"
          >
            <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </span>
        </div>
      </div>
    </article>
  );
};

/**
 * HeroSideFeedCard matching the 3 stacked cards on the right side of the Hero in the reference design:
 * - Left thumbnail with top-left white category tag
 * - Right author + time, bold headline, "নিউজ মির্জাগঞ্জ ডেস্ক //" snippet, and bottom-right circular red ArrowUpRight button
 */
export const HeroSideFeedCard: React.FC<BaseCardProps> = ({
  article,
  author,
  onSelectArticle,
}) => {
  const authorName = author ? author.nameBn : 'এইচ এম কাইয়ুম ইসলাম';

  return (
    <article className="group bg-white">
      <button
        type="button"
        onClick={() => onSelectArticle(article.slug)}
        className="w-full text-left grid grid-cols-12 gap-4 items-stretch focus-visible:outline-2 focus-visible:outline-red-600"
      >
        {/* Left Thumbnail (5 cols) */}
        <div className="col-span-5 relative overflow-hidden bg-stone-900">
          <EditorialImage
            theme={article.visualTheme}
            imageUrl={article.imageUrl}
            alt={article.seoMeta.ogImageAlt}
            aspectRatio="4:3"
            isVideo={article.isVideo}
            compact={true}
            className="h-full w-full"
          />
          <span className="absolute top-2.5 left-2.5 z-10 bg-white text-stone-900 px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
            {article.categoryNameBn}
          </span>
        </div>

        {/* Right Details (7 cols) */}
        <div className="col-span-7 flex flex-col justify-between py-0.5">
          <div>
            <div className="text-[11px] text-stone-500 mb-1">
              <span>{authorName}</span>
              <span aria-hidden="true"> - </span>
              <span>১ ঘণ্টা আগে</span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
              {article.title}
            </h3>

            <p className="mt-1.5 text-xs text-stone-600 leading-relaxed line-clamp-2">
              নিউজ মির্জাগঞ্জ ডেস্ক // {article.summary}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] font-medium text-stone-500 truncate">
              {article.locationBn}
            </span>
            <span
              aria-hidden="true"
              className="w-7 h-7 rounded-full bg-red-600 group-hover:bg-red-700 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
            >
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </button>
    </article>
  );
};

/**
 * TrendingFeatureCard matching the 2-column "ট্রেন্ডিং নিউজ" cards in the reference image
 */
export const TrendingFeatureCard: React.FC<BaseCardProps> = ({
  article,
  author,
  onSelectArticle,
}) => {
  const authorName = author ? author.nameBn : 'এইচ এম কাইয়ুম ইসলাম';

  return (
    <article className="group bg-white flex flex-col justify-between">
      <button
        type="button"
        onClick={() => onSelectArticle(article.slug)}
        className="w-full text-left block focus-visible:outline-2 focus-visible:outline-red-600"
      >
        <div className="relative overflow-hidden bg-stone-900 mb-3.5">
          <EditorialImage
            theme={article.visualTheme}
            imageUrl={article.imageUrl}
            alt={article.seoMeta.ogImageAlt}
            aspectRatio="16:9"
            isVideo={article.isVideo}
            videoDurationBn={article.videoDurationBn}
            locationBadgeBn={article.locationBn}
          />
          <span className="absolute top-3.5 left-3.5 z-10 bg-white text-stone-900 px-3 py-1 text-xs font-bold shadow-xs">
            {article.categoryNameBn}
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-stone-500 mb-1">
              <span>{authorName}</span>
              <span aria-hidden="true"> - </span>
              <span>{article.publishedAtBn}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug group-hover:text-red-600 transition-colors">
              {article.title}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-2">
              নিউজ মির্জাগঞ্জ ডেস্ক // {article.summary}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="w-9 h-9 rounded-full bg-red-600 group-hover:bg-red-700 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
          >
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </button>
    </article>
  );
};

export const StandardNewsCard: React.FC<BaseCardProps> = ({
  article,
  author,
  onSelectArticle,
  onSelectAuthor,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  return (
    <article className="group flex flex-col justify-between h-full pb-5 border-b border-stone-200">
      <div>
        <button
          type="button"
          onClick={() => onSelectArticle(article.slug)}
          className="text-left w-full block focus-visible:outline-2 focus-visible:outline-red-600"
        >
          <div className="relative mb-3">
            <EditorialImage
              theme={article.visualTheme}
              imageUrl={article.imageUrl}
              alt={article.seoMeta.ogImageAlt}
              aspectRatio="4:3"
              isVideo={article.isVideo}
              videoDurationBn={article.videoDurationBn}
              locationBadgeBn={article.locationBn}
            />
            <span className="absolute top-2.5 left-2.5 z-10 bg-white text-stone-900 px-2.5 py-0.5 text-[11px] font-bold shadow-xs">
              {article.categoryNameBn}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 mb-1.5">
            <span>{author ? author.nameBn : 'নিউজ মির্জাগঞ্জ ডেস্ক'}</span>
            <span aria-hidden="true">-</span>
            <span className="tabular-nums">
              {toBengaliDigits(article.readingTimeMinutes)} মিনিট পাঠ
            </span>
          </div>

          <h3 className="text-lg font-bold text-stone-900 leading-snug group-hover:text-red-600 transition-colors">
            {article.title}
          </h3>

          <p className="mt-2 text-sm text-stone-600 leading-relaxed line-clamp-3">
            নিউজ মির্জাগঞ্জ ডেস্ক // {article.summary}
          </p>
        </button>
      </div>

      <div className="mt-3 pt-2.5 flex items-center justify-between gap-2 text-xs text-stone-500">
        <div className="flex items-center gap-1.5 truncate">
          {author && onSelectAuthor ? (
            <button
              type="button"
              onClick={() => onSelectAuthor(author.slug)}
              className="font-medium text-stone-700 hover:text-red-600 underline underline-offset-2 truncate transition-colors"
            >
              {author.nameBn}
            </button>
          ) : (
            <span className="font-medium text-stone-700 truncate">
              {author ? author.nameBn : 'ডেস্ক প্রতিবেদন'}
            </span>
          )}
          <span aria-hidden="true">·</span>
          <span className="truncate">{article.locationBn}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onToggleBookmark && (
            <button
              type="button"
              onClick={() => onToggleBookmark(article.id)}
              aria-label={
                isBookmarked
                  ? `"${article.title}" সংরক্ষণ তালিকা থেকে সরান`
                  : `"${article.title}" সংরক্ষণ করুন`
              }
              className={`p-1.5 rounded transition-colors ${
                isBookmarked
                  ? 'text-red-600 bg-red-50'
                  : 'text-stone-400 hover:text-stone-800 hover:bg-stone-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onSelectArticle(article.slug)}
            aria-label="বিস্তারিত পড়ুন"
            className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};

export const CompactHorizontalCard: React.FC<BaseCardProps> = ({ article, onSelectArticle }) => {
  return (
    <article className="group py-3.5 first:pt-0 border-b border-stone-200 last:border-b-0">
      <button
        type="button"
        onClick={() => onSelectArticle(article.slug)}
        className="w-full text-left grid grid-cols-12 gap-3.5 items-start focus-visible:outline-2 focus-visible:outline-red-600"
      >
        <div className="col-span-4 relative">
          <EditorialImage
            theme={article.visualTheme}
            imageUrl={article.imageUrl}
            alt={article.seoMeta.ogImageAlt}
            aspectRatio="4:3"
            isVideo={article.isVideo}
            compact={true}
          />
          <span className="absolute top-1.5 left-1.5 z-10 bg-white text-stone-900 px-1.5 py-0.5 text-[9px] font-bold shadow-xs">
            {article.categoryNameBn}
          </span>
        </div>
        <div className="col-span-8 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-bold text-stone-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
              {article.title}
            </h4>
            <p className="mt-1 text-xs text-stone-500 line-clamp-1">
              নিউজ মির্জাগঞ্জ ডেস্ক // {article.summary}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 mt-1"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </button>
    </article>
  );
};

interface NumberedRankItemProps {
  rank: number;
  article: Article;
  onSelectArticle: (slug: string) => void;
  showViews?: boolean;
}

export const NumberedRankItem: React.FC<NumberedRankItemProps> = ({
  rank,
  article,
  onSelectArticle,
  showViews = false,
}) => {
  const rankStr = toBengaliDigits(rank < 10 ? `0${rank}` : `${rank}`);
  return (
    <li className="group py-3 first:pt-0 border-b border-stone-200 last:border-b-0">
      <button
        type="button"
        onClick={() => onSelectArticle(article.slug)}
        className="w-full text-left flex items-start gap-3.5 focus-visible:outline-2 focus-visible:outline-red-600"
      >
        <span className="text-xl font-bold font-sans tabular-nums text-stone-400 group-hover:text-red-600 transition-colors shrink-0 leading-none mt-0.5">
          {rankStr}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-0.5">
            <span className="font-semibold text-red-600">{article.categoryNameBn}</span>
            {showViews && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {formatBengaliNumber(article.viewCount)} পাঠ
                </span>
              </>
            )}
          </div>
          <h4 className="text-sm font-bold text-stone-900 leading-snug group-hover:text-red-600 transition-colors">
            {article.title}
          </h4>
        </div>
      </button>
    </li>
  );
};

interface VideoNewsCardProps {
  article: Article;
  isActive?: boolean;
  onSelectVideo: (article: Article) => void;
  onOpenFullArticle: (slug: string) => void;
}

export const VideoNewsCard: React.FC<VideoNewsCardProps> = ({
  article,
  isActive = false,
  onSelectVideo,
  onOpenFullArticle,
}) => {
  return (
    <article
      className={`group p-3.5 rounded border transition-colors ${
        isActive
          ? 'bg-stone-800 border-red-600'
          : 'bg-stone-900/90 border-stone-800 hover:border-stone-700'
      }`}
    >
      <button
        type="button"
        onClick={() => onSelectVideo(article)}
        className="w-full text-left block focus-visible:outline-2 focus-visible:outline-red-500"
      >
        <EditorialImage
          theme={article.visualTheme}
          imageUrl={article.imageUrl}
          alt={article.seoMeta.ogImageAlt}
          aspectRatio="16:9"
          isVideo={true}
          videoDurationBn={article.videoDurationBn}
          className="mb-3"
        />
        <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
          <span className="text-red-400 font-semibold">{article.categoryNameBn}</span>
          <span aria-hidden="true">·</span>
          <span>ডেমো ভিডিও</span>
          {article.videoDurationBn && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{article.videoDurationBn}</span>
            </>
          )}
        </div>
        <h4 className="text-base font-bold text-stone-100 leading-snug group-hover:text-red-400 transition-colors">
          {article.title}
        </h4>
      </button>

      <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelectVideo(article)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors whitespace-nowrap shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isActive ? 'এখন চলছে (ডেমো)' : 'ভিডিও চালান'}</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenFullArticle(article.slug)}
          className="text-xs text-stone-400 hover:text-white underline underline-offset-4 whitespace-nowrap shrink-0"
        >
          বিস্তারিত প্রতিবেদন
        </button>
      </div>
    </article>
  );
};

interface ResponsiveAdSlotProps {
  ad: Advertisement;
  onInspectAdPolicy?: () => void;
  className?: string;
}

export const ResponsiveAdSlot: React.FC<ResponsiveAdSlotProps> = ({
  ad,
  onInspectAdPolicy,
  className = '',
}) => {
  if (!ad.isActive) return null;

  return (
    <aside
      aria-label={`বিজ্ঞাপন প্লেসহোল্ডার: ${ad.titleBn}`}
      className={`w-full bg-stone-50 border border-stone-200 p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pb-2.5 mb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-700">বিজ্ঞাপন স্থান (ডেমো প্লেসহোল্ডার)</span>
          <span aria-hidden="true">·</span>
          <span>{ad.formatLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{ad.dimensions}</span>
        </div>
        <span className="text-stone-500">{ad.sponsorNameBn}</span>
      </div>

      {ad.bannerImageUrl && (
        <div className="mb-3 overflow-hidden rounded border border-stone-200 bg-white">
          <img
            src={ad.bannerImageUrl}
            alt={ad.titleBn}
            referrerPolicy="no-referrer"
            className="w-full max-h-40 object-cover"
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm sm:text-base font-bold text-stone-900">{ad.titleBn}</p>
          <p className="text-xs text-stone-600 mt-1">
            এটি একটি রেসপনসিভ বিজ্ঞাপন স্লট নমুনা। অ্যাডমিন প্যানেল (/admin) থেকে এই বিজ্ঞাপনের ছবি, শিরোনাম ও সক্রিয়তা নিয়ন্ত্রণ করা যাবে।
          </p>
        </div>
        {onInspectAdPolicy && (
          <button
            type="button"
            onClick={onInspectAdPolicy}
            className="px-4 py-2 text-xs font-medium text-stone-800 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
          >
            {ad.ctaLabelBn}
          </button>
        )}
      </div>
    </aside>
  );
};
