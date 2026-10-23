import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toBengaliDigits,
  formatBengaliNumber,
  estimateReadingTimeMinutes,
  filterArticles,
  sortArticles,
  buildCanonicalUrl,
  buildNewsArticleJsonLd,
  validateContactForm,
  validateArticleDraft,
  generateArticleSlug,
  MIRZAGANJ_UNIONS,
  MIRZAGANJ_WARDS,
  MIRZAGANJ_EDUCATION_ITEMS,
  MIRZAGANJ_HEALTH_ITEMS,
  resolveCategoryMeta,
  getEffectiveMenuConfig,
} from './newsLogic.ts';
import type { Article, Author } from '../types/news.ts';

const sampleAuthor: Author = {
  id: 'author-1',
  slug: 'hm-kaium-islam',
  nameBn: 'এইচ এম কাইয়ুম ইসলাম',
  nameEn: 'HM Kaium Islam',
  roleBn: 'প্রধান প্রতিবেদক ও মির্জাগঞ্জ ডেস্ক প্রধান (ডেমো)',
  beatBn: 'মির্জাগঞ্জ জনপদ, উপকূলীয় অবকাঠামো ও জাতীয়',
  bioBn: 'কাল্পনিক ডেমো প্রতিবেদক প্রোফাইল।',
  email: 'kaium.demo@newsmirzaganj.example.com',
  locationBn: 'সুবিদখালী, মির্জাগঞ্জ',
  avatarInitials: 'কাই',
  articlesCount: 16,
};

const sampleArticles: Article[] = [
  {
    id: 'art-1',
    slug: 'mirzaganj-embankment-demo',
    title: 'মির্জাগঞ্জে পায়রা নদীর তীর রক্ষা বাঁধ সংস্কার',
    subtitle: 'ডেমো উপশিরোনাম ১',
    summary: 'মির্জাগঞ্জ উপজেলার নদীভাঙন রোধ ও জনপদ সুরক্ষা নিয়ে কাল্পনিক নমুনা প্রতিবেদন।',
    content: ['প্রথম অনুচ্ছেদ।', 'দ্বিতীয় অনুচ্ছেদ।'],
    keyTakeaways: ['পয়েন্ট ১'],
    categorySlug: 'mirzaganj',
    categoryNameBn: 'মির্জাগঞ্জ জনপদ',
    tags: ['মির্জাগঞ্জ', 'পায়রা-নদী'],
    authorId: 'author-1',
    publishedAtIso: '2026-10-22T09:00:00+06:00',
    publishedAtBn: '২২ অক্টোবর ২০২৬, সকাল ৯:০০',
    updatedAtBn: '২২ অক্টোবর ২০২৬, সকাল ৯:৩০',
    locationBn: 'মির্জাগঞ্জ, পটুয়াখালী',
    readingTimeMinutes: 4,
    viewCount: 24500,
    isFeatured: true,
    isLeadStory: true,
    isBreaking: true,
    isTrending: true,
    isVideo: false,
    isDemoContent: true,
    demoDisclaimerBn: 'ডেমো প্রতিবেদন',
    status: 'published',
    visualTheme: 'sundarbans',
    imageCaptionBn: 'ডেমো ক্যাপশন',
    seoMeta: {
      metaTitle: 'মির্জাগঞ্জে পায়রা নদীর তীর রক্ষা বাঁধ সংস্কার',
      metaDescription: 'ডেমো মেটা বিবরণ',
      canonicalUrl: 'https://newsmirzaganj.example.com/?article=mirzaganj-embankment-demo',
      ogImageAlt: 'ডেমো ছবি',
      keywords: ['মির্জাগঞ্জ'],
    },
  },
  {
    id: 'art-2',
    slug: 'agri-harvest-demo',
    title: 'মির্জাগঞ্জ ও দক্ষিণাঞ্চলে আমন ধানের বাম্পার ফলনের সম্ভাবনা',
    subtitle: 'ডেমো উপশিরোনাম ২',
    summary: 'কৃষি অর্থনীতি ও প্রযুক্তির সমন্বয়ে কাল্পনিক নমুনা প্রতিবেদন।',
    content: ['কৃষি অনুচ্ছেদ।'],
    keyTakeaways: ['পয়েন্ট ২'],
    categorySlug: 'economy',
    categoryNameBn: 'অর্থনীতি',
    tags: ['কৃষি', 'অর্থনীতি'],
    authorId: 'author-2',
    publishedAtIso: '2026-10-22T10:30:00+06:00',
    publishedAtBn: '২২ অক্টোবর ২০২৬, সকাল ১০:৩০',
    updatedAtBn: '২২ অক্টোবর ২০২৬, সকাল ১০:৪৫',
    locationBn: 'পটুয়াখালী',
    readingTimeMinutes: 3,
    viewCount: 8500,
    isFeatured: true,
    isLeadStory: false,
    isBreaking: false,
    isTrending: false,
    isVideo: true,
    videoDurationBn: '০৪:২০',
    isDemoContent: true,
    demoDisclaimerBn: 'ডেমো প্রতিবেদন',
    status: 'published',
    visualTheme: 'agriculture',
    imageCaptionBn: 'ডেমো ক্যাপশন ২',
    seoMeta: {
      metaTitle: 'মির্জাগঞ্জ ও দক্ষিণাঞ্চলে আমন ধানের বাম্পার ফলনের সম্ভাবনা',
      metaDescription: 'ডেমো মেটা বিবরণ ২',
      canonicalUrl: 'https://newsmirzaganj.example.com/?article=agri-harvest-demo',
      ogImageAlt: 'ডেমো ছবি ২',
      keywords: ['কৃষি'],
    },
  },
];

test('toBengaliDigits converts ASCII digits to Bengali numerals accurately', () => {
  assert.equal(toBengaliDigits(2026), '২০২৬');
  assert.equal(toBengaliDigits('01:45'), '০১:৪৫');
  assert.equal(formatBengaliNumber(24500), '২৪,৫০০');
});

test('filterArticles filters by category, authorId, trending flag, video flag, and search query', () => {
  const mirzaganjOnly = filterArticles(sampleArticles, { categorySlug: 'mirzaganj' });
  assert.equal(mirzaganjOnly.length, 1);
  assert.equal(mirzaganjOnly[0].slug, 'mirzaganj-embankment-demo');

  const trendingOnly = filterArticles(sampleArticles, { onlyTrending: true });
  assert.equal(trendingOnly.length, 1);
  assert.equal(trendingOnly[0].id, 'art-1');

  const authorOnly = filterArticles(sampleArticles, { authorId: 'author-1' });
  assert.equal(authorOnly.length, 1);

  const videoOnly = filterArticles(sampleArticles, { categorySlug: 'video' });
  assert.equal(videoOnly.length, 1);
  assert.equal(videoOnly[0].slug, 'agri-harvest-demo');

  const searchResult = filterArticles(sampleArticles, { searchQuery: 'পায়রা' });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].id, 'art-1');
});

test('sortArticles sorts accurately by latest timestamp and popular viewCount', () => {
  const byLatest = sortArticles(sampleArticles, 'latest');
  assert.equal(byLatest[0].id, 'art-2');

  const byPopular = sortArticles(sampleArticles, 'popular');
  assert.equal(byPopular[0].id, 'art-1');
});

test('buildCanonicalUrl and buildNewsArticleJsonLd produce valid SEO metadata', () => {
  const url = buildCanonicalUrl('https://newsmirzaganj.example.com/', {
    articleSlug: 'mirzaganj-embankment-demo',
  });
  assert.equal(url, 'https://newsmirzaganj.example.com/?article=mirzaganj-embankment-demo');

  const jsonLd = buildNewsArticleJsonLd(
    sampleArticles[0],
    sampleAuthor,
    'https://newsmirzaganj.example.com'
  );
  assert.equal(jsonLd['@type'], 'NewsArticle');
  assert.equal(jsonLd.inLanguage, 'bn-BD');
  assert.equal((jsonLd.author as Record<string, string>).name, 'এইচ এম কাইয়ুম ইসলাম');
});

test('validateContactForm rejects empty or invalid inputs and accepts valid submissions', () => {
  const invalid = validateContactForm({
    senderName: '',
    senderEmail: 'bad-email',
    subject: '',
    message: 'ছোট',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.senderName);
  assert.ok(invalid.errors.senderEmail);
  assert.ok(invalid.errors.subject);
  assert.ok(invalid.errors.message);

  const valid = validateContactForm({
    senderName: 'রফিকুল ইসলাম',
    senderEmail: 'rafiq@example.com',
    subject: 'মির্জাগঞ্জ সড়কের সংস্কার প্রসঙ্গে',
    message: 'সুবিদখালী বাজার সংলগ্ন সড়কের কাজ দ্রুত শেষ করার অনুরোধ জানাচ্ছি।',
  });
  assert.equal(valid.valid, true);
});

test('validateArticleDraft and generateArticleSlug work for Admin CRUD', () => {
  const badDraft = validateArticleDraft({
    title: '',
    subtitle: '',
    summary: '',
    contentText: '',
    categorySlug: 'mirzaganj',
    authorId: 'author-1',
  });
  assert.equal(badDraft.valid, false);

  const goodDraft = validateArticleDraft({
    title: 'নতুন ডেমো প্রতিবেদন',
    subtitle: 'উপশিরোনাম',
    summary: 'সারসংক্ষেপ',
    contentText: 'বিস্তারিত অনুচ্ছেদ।',
    categorySlug: 'mirzaganj',
    authorId: 'author-1',
  });
  assert.equal(goodDraft.valid, true);

  const slug = generateArticleSlug('মির্জাগঞ্জ সংবাদ', '101');
  assert.equal(slug, 'mirzaganj-news-101');
});

test('estimateReadingTimeMinutes returns at least 1 minute', () => {
  assert.equal(estimateReadingTimeMinutes(['সংক্ষিপ্ত অনুচ্ছেদ']), 1);
});

test('MIRZAGANJ_UNIONS, MIRZAGANJ_WARDS, and resolveCategoryMeta support 7 unions, 9 wards, Mahila College under Girls College, and strict empty-news filtering', () => {
  assert.equal(MIRZAGANJ_UNIONS.length, 7);
  assert.equal(MIRZAGANJ_WARDS.length, 9);
  assert.equal(MIRZAGANJ_WARDS[0].labelBn, '১নং ওয়ার্ড');
  assert.equal(MIRZAGANJ_WARDS[8].labelBn, '৯নং ওয়ার্ড');

  const meta = resolveCategoryMeta('union-mirzaganj:ward-1', []);
  assert.ok(meta.titleBn.includes('মির্জাগঞ্জ ইউনিয়ন'));
  assert.ok(meta.titleBn.includes('১নং ওয়ার্ড'));

  const unionFiltered = filterArticles(sampleArticles, {
    categorySlug: 'union-mirzaganj',
  });
  assert.equal(unionFiltered.length, 1);

  // Ward with no news returns 0 articles so UI shows "কোনো খবর নেই!"
  const emptyWardFiltered = filterArticles(sampleArticles, {
    categorySlug: 'union-mirzaganj:ward-9',
  });
  assert.equal(emptyWardFiltered.length, 0);

  // Education sub-item with no news returns 0 articles
  const emptyEduFiltered = filterArticles(sampleArticles, {
    categorySlug: 'edu-primary',
  });
  assert.equal(emptyEduFiltered.length, 0);

  // Girls College submenu includes Subidkhali Mahila Degree College
  const girlsCollegeItem = MIRZAGANJ_EDUCATION_ITEMS.find(
    (i) => i.slug === 'edu-college-girls'
  );
  assert.ok(girlsCollegeItem);
  assert.ok(
    girlsCollegeItem.subItems?.some((s) =>
      s.labelBn.includes('সুবিদখালী মহিলা ডিগ্রি কলেজ')
    )
  );

  assert.equal(MIRZAGANJ_EDUCATION_ITEMS.length, 10);
  assert.equal(MIRZAGANJ_HEALTH_ITEMS.length, 6);
  const eduMeta = resolveCategoryMeta('edu-primary', []);
  assert.ok(eduMeta.titleBn.includes('সরকারী প্রাথমিক বিদ্যালয়'));
  const healthMeta = resolveCategoryMeta('health-upazila-complex', []);
  assert.ok(healthMeta.titleBn.includes('উপজেলা স্বাস্থ্য কমপ্লেক্স'));

  // Deleting items in navigationMenus preserves empty lists rather than restoring defaults
  const customMenu = getEffectiveMenuConfig({
    navigationMenus: {
      mainNavItems: [],
      unionItems: MIRZAGANJ_UNIONS.slice(0, 2),
      educationItems: [],
      healthItems: [],
    },
  } as any);
  assert.equal(customMenu.mainNavItems.length, 0);
  assert.equal(customMenu.unionItems.length, 2);
  assert.equal(customMenu.educationItems.length, 0);
  assert.equal(customMenu.healthItems.length, 0);
});
