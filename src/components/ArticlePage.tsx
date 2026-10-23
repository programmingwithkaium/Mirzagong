import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Check,
  Copy,
  Printer,
  Code2,
  Play,
  UserCheck,
} from 'lucide-react';
import type { Advertisement, Article, Author } from '../types/news.ts';
import { EditorialImage } from './EditorialImage.tsx';
import { StandardNewsCard, ResponsiveAdSlot } from './NewsCards.tsx';
import {
  buildCanonicalUrl,
  buildNewsArticleJsonLd,
  formatBengaliNumber,
  toBengaliDigits,
} from '../utils/newsLogic.ts';

interface ArticlePageProps {
  article: Article;
  author?: Author;
  relatedArticles: Article[];
  authorsMap: Record<string, Author>;
  inlineAd?: Advertisement;
  isBookmarked: boolean;
  onToggleBookmark: (articleId: string) => void;
  onBackHome: () => void;
  onSelectCategory: (categorySlug: string) => void;
  onSelectAuthor: (authorSlug: string) => void;
  onSelectTag: (tag: string) => void;
  onSelectArticle: (slug: string) => void;
  onInspectAdPolicy: () => void;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({
  article,
  author,
  relatedArticles,
  authorsMap,
  inlineAd,
  isBookmarked,
  onToggleBookmark,
  onBackHome,
  onSelectCategory,
  onSelectAuthor,
  onSelectTag,
  onSelectArticle,
  onInspectAdPolicy,
}) => {
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copied, setCopied] = useState(false);
  const [showSchemaPreview, setShowSchemaPreview] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://newsmirzaganj.example.com';

  const canonicalUrl = buildCanonicalUrl(origin, { articleSlug: article.slug });
  const jsonLdObject = buildNewsArticleJsonLd(article, author, origin);

  useEffect(() => {
    document.title = article.seoMeta.metaTitle;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', article.seoMeta.metaDescription);
    }
    const canonicalEl = document.getElementById('canonical-link');
    if (canonicalEl) {
      canonicalEl.setAttribute('href', canonicalUrl);
    }
    const schemaEl = document.getElementById('schema-org-graph');
    if (schemaEl) {
      schemaEl.textContent = JSON.stringify(jsonLdObject, null, 2);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article, canonicalUrl, jsonLdObject]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(canonicalUrl).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const bodySizeClass =
    fontScale === 'xlarge'
      ? 'text-xl leading-loose'
      : fontScale === 'large'
      ? 'text-lg leading-relaxed'
      : 'text-base leading-relaxed';

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb & Back Navigation */}
      <nav
        aria-label="নিবন্ধের অবস্থান"
        className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-stone-200 text-xs text-stone-600"
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 font-medium text-stone-900 hover:text-red-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>প্রচ্ছদে ফিরে যান</span>
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            onClick={() => onSelectCategory(article.categorySlug)}
            className="font-semibold text-red-700 hover:underline"
          >
            {article.categoryNameBn}
          </button>
          <span aria-hidden="true">/</span>
          <span className="text-stone-500 truncate max-w-xs">{article.title}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowSchemaPreview((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-stone-700 bg-stone-100 rounded hover:bg-stone-200 transition-colors"
        >
          <Code2 className="w-3.5 h-3.5 text-red-700" />
          <span>{showSchemaPreview ? 'স্কিমা লুকান' : 'NewsArticle JSON-LD স্কিমা দেখুন'}</span>
        </button>
      </nav>

      {/* Demo Content Transparency Banner */}
      <div
        role="note"
        className="mb-6 p-3.5 bg-amber-50/80 border border-amber-300 rounded text-xs text-amber-950 flex flex-wrap items-center justify-between gap-2"
      >
        <div>
          <span className="font-bold">ডেমো প্রতিবেদন সতর্কীকরণ: </span>
          <span>{article.demoDisclaimerBn}</span>
        </div>
        <span className="text-xs font-medium text-amber-900 shrink-0">
          নমুনা প্রতিবেদন · Phase 2
        </span>
      </div>

      {/* Optional Live Schema.org & Canonical Inspector */}
      {showSchemaPreview && (
        <section
          aria-label="নিবন্ধের এসইও মেটাডেটা ও JSON-LD স্কিমা"
          className="mb-8 p-4 bg-stone-900 text-stone-100 rounded border border-stone-700 text-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-700">
            <div>
              <h2 className="text-sm font-bold text-white">
                Schema.org NewsArticle Structured Data & Canonical URL
              </h2>
              <p className="text-stone-400 mt-0.5">
                Canonical: <span className="font-mono text-amber-300">{canonicalUrl}</span>
              </p>
            </div>
            <span className="text-stone-400">
              নোট: ক্লায়েন্ট-সাইড Vite SPA-তে পূর্ণাঙ্গ সার্চ ইঞ্জিন ক্রলিংয়ের জন্য SSR বা প্রি-রেন্ডারিং প্রয়োজন।
            </span>
          </div>
          <pre className="font-mono text-[11px] leading-relaxed overflow-x-auto text-emerald-300">
            {JSON.stringify(jsonLdObject, null, 2)}
          </pre>
        </section>
      )}

      {/* Main Two-Column Asymmetric Reading Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Article Main Column (8 cols) */}
        <article className="lg:col-span-8">
          {/* Unboxed Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mb-3">
            <span className="font-semibold text-red-700">{article.categoryNameBn}</span>
            {article.isTrending && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-amber-800">এখন ট্রেন্ডিং</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>কাল্পনিক ডেমো নিবন্ধ</span>
            <span aria-hidden="true">·</span>
            <span>{article.locationBn}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {toBengaliDigits(article.readingTimeMinutes)} মিনিট পাঠ
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              পাঠসংখ্যা: {formatBengaliNumber(article.viewCount)} (ডেমো)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
            {article.title}
          </h1>

          <p className="mt-3 text-base sm:text-lg text-stone-700 font-medium leading-relaxed">
            {article.subtitle}
          </p>

          {/* Author & Reader Utility Bar */}
          <div className="mt-5 py-4 border-y border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {author ? author.avatarInitials : 'ডেস্ক'}
              </div>
              <div className="text-xs">
                {author ? (
                  <button
                    type="button"
                    onClick={() => onSelectAuthor(author.slug)}
                    className="font-bold text-stone-900 hover:text-red-700 underline underline-offset-4 transition-colors text-left"
                  >
                    {author.nameBn}
                  </button>
                ) : (
                  <div className="font-bold text-stone-900">
                    নিউজ মির্জাগঞ্জ ডেস্ক (ডেমো)
                  </div>
                )}
                <div className="text-stone-500 mt-0.5">
                  <span>প্রকাশ: {article.publishedAtBn}</span>
                  <span aria-hidden="true" className="mx-1.5">
                    ·
                  </span>
                  <span>হালনাগাদ: {article.updatedAtBn}</span>
                </div>
              </div>
            </div>

            {/* Reader Controls: Font Size, Bookmark, Copy Link, Print */}
            <div className="flex flex-wrap items-center gap-2">
              <div
                role="group"
                aria-label="লেখার আকার পরিবর্তন"
                className="inline-flex items-center bg-stone-100 p-0.5 rounded border border-stone-200"
              >
                <button
                  type="button"
                  onClick={() => setFontScale('normal')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    fontScale === 'normal'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ক
                </button>
                <button
                  type="button"
                  onClick={() => setFontScale('large')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    fontScale === 'large'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ক+
                </button>
                <button
                  type="button"
                  onClick={() => setFontScale('xlarge')}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    fontScale === 'xlarge'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ক++
                </button>
              </div>

              <button
                type="button"
                onClick={() => onToggleBookmark(article.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                  isBookmarked
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? 'সংরক্ষিত' : 'সংরক্ষণ করুন'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">লিঙ্ক কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>লিঙ্ক কপি</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                aria-label="প্রতিবেদন প্রিন্ট করুন"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">প্রিন্ট</span>
              </button>
            </div>
          </div>

          {/* Primary Lead Visual or Interactive Video Player */}
          <div className="my-6">
            <EditorialImage
              theme={article.visualTheme}
              imageUrl={article.imageUrl}
              alt={article.seoMeta.ogImageAlt}
              aspectRatio="16:9"
              isVideo={article.isVideo && !videoPlaying}
              videoDurationBn={article.videoDurationBn}
              locationBadgeBn={article.locationBn}
              captionBn={article.imageCaptionBn}
              priority={true}
            />

            {article.isVideo && (
              <div className="mt-3 p-4 bg-stone-900 text-stone-100 rounded border border-stone-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-red-400">ডেমো ভিডিও প্রতিবেদন</span>
                    <span className="mx-2 text-stone-500">·</span>
                    <span className="text-stone-300">ব্যাপ্তি: {article.videoDurationBn}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideoPlaying((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{videoPlaying ? 'ট্রান্সক্রিপ্ট সংক্ষিপ্ত করুন' : 'ডেমো ভিডিও ও ট্রান্সক্রিপ্ট দেখুন'}</span>
                  </button>
                </div>
                {videoPlaying && article.videoTranscriptBn && (
                  <p className="mt-3 pt-3 border-t border-stone-800 text-xs text-stone-300 leading-relaxed">
                    {article.videoTranscriptBn}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Key Takeaways Box */}
          {article.keyTakeaways.length > 0 && (
            <section
              aria-label="প্রতিবেদনের মূল অংশ"
              className="my-6 p-5 bg-stone-50 border border-stone-200 rounded"
            >
              <h2 className="text-sm font-bold text-stone-900 pb-2 mb-3 border-b border-stone-200">
                একনজরে প্রতিবেদনের মূল তথ্য (ডেমো সারসংক্ষেপ)
              </h2>
              <ul className="space-y-2 text-sm text-stone-700 list-disc list-inside">
                {article.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Article Prose Body */}
          <div className={`max-w-prose space-y-5 text-stone-800 ${bodySizeClass}`}>
            {article.content.map((paragraph, index) => (
              <p
                key={index}
                className={
                  index === 0
                    ? 'first-letter:text-4xl first-letter:font-bold first-letter:text-red-700 first-letter:mr-1.5'
                    : ''
                }
              >
                {paragraph}
              </p>
            ))}

            {article.pullQuote && (
              <blockquote className="my-8 py-6 border-y border-stone-300 text-center px-4">
                <p className="text-xl sm:text-2xl font-editorial italic text-stone-900 leading-relaxed">
                  “{article.pullQuote.quote}”
                </p>
                <footer className="mt-3 text-xs font-sans not-italic text-stone-500">
                  — {article.pullQuote.attribution}
                </footer>
              </blockquote>
            )}
          </div>

          {/* Multi-Photo Gallery inside Article when galleryImages are present */}
          {article.galleryImages && article.galleryImages.length > 0 && (
            <section
              aria-label="সংবাদ ফটো অ্যালবাম"
              className="my-8 p-5 bg-stone-50 border border-stone-200 rounded"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-stone-200">
                <div>
                  <span className="text-xs font-semibold text-red-700">বিশেষ ফটো গ্যালারি</span>
                  <h2 className="text-lg font-bold text-stone-900">
                    সংযুক্ত আলোকচিত্র ও দৃশ্যপট ({toBengaliDigits(article.galleryImages.length)}টি ছবি)
                  </h2>
                </div>
                <span className="text-xs text-stone-500">মির্জাগঞ্জ ফটো ডেস্ক (ডেমো)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {article.galleryImages.map((imgItem, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-stone-200 p-3 rounded flex flex-col justify-between"
                  >
                    <EditorialImage
                      theme={imgItem.theme}
                      imageUrl={imgItem.imageUrl}
                      alt={imgItem.titleBn}
                      aspectRatio="16:9"
                      locationBadgeBn={imgItem.locationBn}
                      className="mb-2.5"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">{imgItem.titleBn}</h3>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {imgItem.captionBn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Topic Tags */}
          <div className="mt-8 pt-5 border-t border-stone-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-600 mr-1">সংশ্লিষ্ট বিষয়:</span>
            {article.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(tag)}
                className="px-3 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-red-50 hover:text-red-700 rounded transition-colors whitespace-nowrap shrink-0"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Author Bio Box with Profile Link */}
          {author && (
            <section
              aria-label="প্রতিবেদক পরিচিতি"
              className="mt-8 p-5 bg-stone-50 border border-stone-200 rounded"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {author.avatarInitials}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <button
                        type="button"
                        onClick={() => onSelectAuthor(author.slug)}
                        className="font-bold text-sm text-stone-900 hover:text-red-700 underline underline-offset-4"
                      >
                        {author.nameBn}
                      </button>
                      <span aria-hidden="true">·</span>
                      <span>{author.roleBn}</span>
                      <span aria-hidden="true">·</span>
                      <span>কর্মক্ষেত্র: {author.locationBn}</span>
                    </div>
                    <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {author.bioBn}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectAuthor(author.slug)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0 self-start"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>প্রতিবেদকের সব খবর</span>
                </button>
              </div>
            </section>
          )}

          {/* Inline Responsive Advertisement Slot */}
          {inlineAd && (
            <div className="mt-8">
              <ResponsiveAdSlot ad={inlineAd} onInspectAdPolicy={onInspectAdPolicy} />
            </div>
          )}
        </article>

        {/* Right Sidebar: Related Stories & Editorial Transparency (4 cols) */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="p-5 bg-stone-50 border border-stone-200">
            <h2 className="text-base font-bold text-stone-900 pb-2.5 mb-3 border-b border-stone-200">
              সম্পাদকীয় স্বচ্ছতা ও ডেমো নোট
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              নিউজ মির্জাগঞ্জের এই নিবন্ধ পৃষ্ঠাটি একটি পুনঃব্যবহারযোগ্য আর্টিকেল টেমপ্লেট। এতে বাংলা ফন্ট রেন্ডারিং, পাঠ-সহায়ক ফন্ট রিসাইজার, ক্যানোনিকাল ইউআরএল এবং Schema.org <code className="font-mono text-red-700">NewsArticle</code> মেটাডেটা যুক্ত করা হয়েছে।
            </p>
          </div>

          <section aria-label="সম্পর্কিত আরও সংবাদ">
            <div className="flex items-center justify-between pb-2.5 mb-4 border-b-2 border-stone-900">
              <h2 className="text-lg font-bold text-stone-900">সম্পর্কিত আরও সংবাদ</h2>
              <span className="text-xs text-stone-500">ডেমো তালিকা</span>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {relatedArticles.slice(0, 3).map((rel) => (
                <StandardNewsCard
                  key={rel.id}
                  article={rel}
                  author={authorsMap[rel.authorId]}
                  onSelectArticle={onSelectArticle}
                  onSelectAuthor={onSelectAuthor}
                />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
