import { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { initialDemoPortalData } from './data/demoNewsData.ts';
import type {
  Advertisement,
  Article,
  ArticleStatus,
  Author,
  Category,
  ContactMessage,
  NewsPortalDataStore,
  PortalPublicView,
  SiteSettings,
} from './types/news.ts';
import { Header } from './components/Header.tsx';
import { HomePage } from './components/HomePage.tsx';
import { ArticlePage } from './components/ArticlePage.tsx';
import {
  AuthorProfileTemplate,
  CategoryPageTemplate,
  SearchAndArchiveTemplate,
  StaticPagesTemplate,
} from './components/PublicTemplates.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import {
  Footer,
  PortalModal,
  type InfoModalType,
} from './components/FooterAndModals.tsx';
import { buildCanonicalUrl } from './utils/newsLogic.ts';

const BOOKMARK_STORAGE_KEY = 'newsmirzaganj_demo_bookmarks_v8';
const PORTAL_STORE_KEY = 'newsmirzaganj_portal_store_v8';

function parseInitialRoute(): {
  view: PortalPublicView;
  category: string;
  articleSlug: string | null;
  authorSlug: string;
} {
  if (typeof window === 'undefined') {
    return {
      view: 'home',
      category: 'all',
      articleSlug: null,
      authorSlug: 'hm-kaium-islam',
    };
  }
  const pathname = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  if (pathname === '/admin' || params.get('view') === 'admin') {
    return {
      view: 'admin',
      category: 'all',
      articleSlug: null,
      authorSlug: 'hm-kaium-islam',
    };
  }

  const articleParam = params.get('article');
  if (articleParam) {
    return {
      view: 'article',
      category: 'all',
      articleSlug: articleParam,
      authorSlug: 'hm-kaium-islam',
    };
  }

  const catParam = params.get('category');
  if (catParam && catParam !== 'all') {
    return {
      view: 'category',
      category: catParam,
      articleSlug: null,
      authorSlug: 'hm-kaium-islam',
    };
  }

  const viewParam = params.get('view') as PortalPublicView | null;
  const authorParam = params.get('author') || 'hm-kaium-islam';
  if (
    viewParam &&
    [
      'home',
      'category',
      'article',
      'author',
      'archive',
      'about',
      'contact',
      'editorial-policy',
      'privacy-policy',
      'terms',
      'admin',
    ].includes(viewParam)
  ) {
    return {
      view: viewParam,
      category: catParam || 'mirzaganj',
      articleSlug: null,
      authorSlug: authorParam,
    };
  }

  return {
    view: 'home',
    category: 'all',
    articleSlug: null,
    authorSlug: 'hm-kaium-islam',
  };
}

export default function App() {
  const [portalData, setPortalData] = useState<NewsPortalDataStore>(() => {
    try {
      const saved = localStorage.getItem(PORTAL_STORE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as NewsPortalDataStore;
        if (parsed && Array.isArray(parsed.articles) && parsed.settings) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return initialDemoPortalData;
  });

  const initialRoute = useMemo(() => parseInitialRoute(), []);
  const [activeView, setActiveView] = useState<PortalPublicView>(initialRoute.view);
  const [activeCategory, setActiveCategory] = useState<string>(initialRoute.category);
  const [activeTag, setActiveTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(
    initialRoute.articleSlug
  );
  const [activeAuthorSlug, setActiveAuthorSlug] = useState<string>(
    initialRoute.authorSlug
  );

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['art-1'];
    } catch {
      return ['art-1'];
    }
  });

  const [activeModal, setActiveModal] = useState<InfoModalType>(null);

  useEffect(() => {
    try {
      localStorage.setItem(PORTAL_STORE_KEY, JSON.stringify(portalData));
    } catch {
      // Ignore storage errors
    }
  }, [portalData]);

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarkedIds));
    } catch {
      // Ignore storage errors
    }
  }, [bookmarkedIds]);

  const authorsMap = useMemo(() => {
    const map: Record<string, Author> = {};
    for (const author of portalData.authors) {
      map[author.id] = author;
    }
    return map;
  }, [portalData.authors]);

  const publishedArticles = useMemo(
    () => portalData.articles.filter((a) => a.status === 'published'),
    [portalData.articles]
  );

  const breakingArticles = useMemo(
    () => publishedArticles.filter((a) => a.isBreaking),
    [publishedArticles]
  );

  const activeArticle = useMemo(
    () =>
      activeArticleSlug
        ? portalData.articles.find((a) => a.slug === activeArticleSlug) ?? null
        : null,
    [portalData.articles, activeArticleSlug]
  );

  const bookmarkedArticles = useMemo(
    () => publishedArticles.filter((a) => bookmarkedIds.includes(a.id)),
    [publishedArticles, bookmarkedIds]
  );

  // Sync page title & canonical URL for non-article views
  useEffect(() => {
    if (activeView === 'article' && activeArticleSlug) return;
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://newsmirzaganj.example.com';

    let pageTitle = `${portalData.settings.portalNameBn} | ${portalData.settings.portalNameEn} – মির্জাগঞ্জ ও সারাদেশের নির্ভরযোগ্য সংবাদ`;
    if (activeView === 'category') {
      const catObj = portalData.categories.find((c) => c.slug === activeCategory);
      pageTitle = `${
        activeCategory === 'trending'
          ? 'এখন ট্রেন্ডিং সংবাদ'
          : catObj?.nameBn ?? 'বিভাগ'
      } (ডেমো) | ${portalData.settings.portalNameBn}`;
    } else if (activeView === 'author') {
      const rep = portalData.authors.find((a) => a.slug === activeAuthorSlug);
      pageTitle = `${rep?.nameBn ?? 'প্রতিবেদক'} প্রোফাইল | ${
        portalData.settings.portalNameBn
      }`;
    } else if (activeView === 'archive') {
      pageTitle = `অনুসন্ধান ও সংবাদ আর্কাইভ | ${portalData.settings.portalNameBn}`;
    } else if (activeView === 'admin') {
      pageTitle = `অ্যাডমিন ড্যাশবোর্ড (/admin) | ${portalData.settings.portalNameBn}`;
    } else if (activeView === 'contact') {
      pageTitle = `যোগাযোগ ও সংবাদ পাঠান | ${portalData.settings.portalNameBn}`;
    }

    document.title = pageTitle;

    const canonicalEl = document.getElementById('canonical-link');
    if (canonicalEl) {
      canonicalEl.setAttribute(
        'href',
        buildCanonicalUrl(origin, {
          categorySlug: activeView === 'category' ? activeCategory : undefined,
          view: activeView,
        })
      );
    }
  }, [
    activeView,
    activeArticleSlug,
    activeCategory,
    activeAuthorSlug,
    portalData.categories,
    portalData.authors,
    portalData.settings.portalNameBn,
    portalData.settings.portalNameEn,
  ]);

  const handleToggleBookmark = (articleId: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleSelectHome = () => {
    setActiveView('home');
    setActiveArticleSlug(null);
    setActiveCategory('all');
    setActiveTag('');
    setSearchQuery('');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/');
    }
  };

  const handleSelectCategory = (categorySlug: string) => {
    setActiveView('category');
    setActiveArticleSlug(null);
    setActiveCategory(categorySlug);
    setActiveTag('');
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        {},
        '',
        `/?view=category&category=${encodeURIComponent(categorySlug)}`
      );
    }
  };

  const handleSelectArticle = (slug: string) => {
    setActiveView('article');
    setActiveArticleSlug(slug);
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        {},
        '',
        `/?article=${encodeURIComponent(slug)}`
      );
    }
  };

  const handleSelectAuthor = (authorSlug: string) => {
    setActiveView('author');
    setActiveArticleSlug(null);
    setActiveAuthorSlug(authorSlug);
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        {},
        '',
        `/?view=author&author=${encodeURIComponent(authorSlug)}`
      );
    }
  };

  const handleSelectArchive = (initialQuery?: string) => {
    setActiveView('archive');
    setActiveArticleSlug(null);
    if (typeof initialQuery === 'string') {
      setSearchQuery(initialQuery);
    }
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/?view=archive');
    }
  };

  const handleSwitchView = (view: PortalPublicView) => {
    setActiveView(view);
    setActiveArticleSlug(null);
    if (typeof window !== 'undefined') {
      const url = view === 'home' ? '/' : `/?view=${encodeURIComponent(view)}`;
      window.history.replaceState({}, '', url);
    }
  };

  const handleSelectTag = (tag: string) => {
    setActiveView('archive');
    setActiveArticleSlug(null);
    setActiveCategory('all');
    setActiveTag(tag);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/?view=archive');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0 && activeView !== 'archive') {
      setActiveView('archive');
      setActiveArticleSlug(null);
    }
  };

  /* ==========================================================================
     ADMIN & CONTACT STORE MUTATION HANDLERS
     ========================================================================== */
  const handleSaveArticle = (article: Article, isNew: boolean) => {
    setPortalData((prev) => {
      let updatedArticles = isNew
        ? [article, ...prev.articles]
        : prev.articles.map((a) => (a.id === article.id ? article : a));

      if (article.isLeadStory) {
        updatedArticles = updatedArticles.map((a) =>
          a.id === article.id ? a : { ...a, isLeadStory: false }
        );
      }

      const newActivity = {
        id: `act-${Date.now()}`,
        actionType: isNew
          ? ('article_created' as const)
          : ('article_updated' as const),
        actorNameBn: prev.settings.editorNameBn,
        actorRoleBn: 'অ্যাডমিন প্যানেল (ডেমো)',
        targetTitleBn: article.title,
        timestampBn: '২২ অক্টোবর ২০২৬, সদ্য সম্পাদিত',
        notesBn: isNew
          ? `নতুন ডেমো নিবন্ধ যোগ করা হয়েছে (${article.status})।`
          : `নিবন্ধের তথ্য ও মেটাডেটা হালনাগাদ করা হয়েছে (${article.status})।`,
      };

      return {
        ...prev,
        articles: updatedArticles,
        editorialActivities: [newActivity, ...prev.editorialActivities],
      };
    });
  };

  const handleDeleteArticle = (articleId: string) => {
    setPortalData((prev) => {
      const target = prev.articles.find((a) => a.id === articleId);
      const remaining = prev.articles.filter((a) => a.id !== articleId);
      const newActivity = {
        id: `act-${Date.now()}`,
        actionType: 'article_deleted' as const,
        actorNameBn: prev.settings.editorNameBn,
        actorRoleBn: 'অ্যাডমিন প্যানেল (ডেমো)',
        targetTitleBn: target?.title ?? articleId,
        timestampBn: '২২ অক্টোবর ২০২৬, সদ্য মুছে ফেলা হয়েছে',
        notesBn: 'ডেমো নিবন্ধটি তালিকা থেকে অপসারণ করা হয়েছে।',
      };
      return {
        ...prev,
        articles: remaining,
        editorialActivities: [newActivity, ...prev.editorialActivities],
      };
    });
  };

  const handleQuickStatusChange = (articleId: string, status: ArticleStatus) => {
    setPortalData((prev) => {
      const target = prev.articles.find((a) => a.id === articleId);
      const updated = prev.articles.map((a) =>
        a.id === articleId ? { ...a, status } : a
      );
      const newActivity = {
        id: `act-${Date.now()}`,
        actionType:
          status === 'published'
            ? ('published' as const)
            : status === 'draft'
            ? ('draft_saved' as const)
            : ('scheduled' as const),
        actorNameBn: prev.settings.editorNameBn,
        actorRoleBn: 'অ্যাডমিন প্যানেল (ডেমো)',
        targetTitleBn: target?.title ?? articleId,
        timestampBn: '২২ অক্টোবর ২০২৬, সদ্য পরিবর্তিত',
        notesBn: `প্রকাশনা অবস্থা পরিবর্তন করে "${status}" করা হয়েছে।`,
      };
      return {
        ...prev,
        articles: updated,
        editorialActivities: [newActivity, ...prev.editorialActivities],
      };
    });
  };

  const handleToggleArticleFlag = (
    articleId: string,
    flag: 'isLeadStory' | 'isFeatured' | 'isBreaking' | 'isTrending'
  ) => {
    setPortalData((prev) => {
      const updated = prev.articles.map((a) => {
        if (flag === 'isLeadStory') {
          return { ...a, isLeadStory: a.id === articleId };
        }
        if (a.id === articleId) {
          return { ...a, [flag]: !a[flag] };
        }
        return a;
      });
      return {
        ...prev,
        articles: updated,
      };
    });
  };

  const handleAddCategory = (cat: Category) => {
    setPortalData((prev) => ({
      ...prev,
      categories: prev.categories.some((c) => c.slug === cat.slug)
        ? prev.categories
        : [...prev.categories, cat],
    }));
  };

  const handleDeleteCategory = (catId: string) => {
    setPortalData((prev) => {
      const targetCat = prev.categories.find(
        (c) => c.id === catId || c.slug === catId
      );
      const remainingCategories = prev.categories.filter(
        (c) => c.id !== catId && c.slug !== catId
      );
      const existingMenus = prev.settings.navigationMenus;
      const updatedSettings: SiteSettings = existingMenus
        ? {
            ...prev.settings,
            navigationMenus: {
              ...existingMenus,
              mainNavItems: existingMenus.mainNavItems.filter(
                (m) =>
                  m.id !== catId &&
                  m.slug !== catId &&
                  (!targetCat || m.slug !== targetCat.slug)
              ),
            },
          }
        : prev.settings;

      return {
        ...prev,
        categories: remainingCategories,
        settings: updatedSettings,
      };
    });
  };

  const handleAddAuthor = (author: Author) => {
    setPortalData((prev) => {
      const exists = prev.authors.some(
        (a) =>
          a.id === author.id ||
          a.nameBn.trim() === author.nameBn.trim()
      );
      if (exists) {
        return {
          ...prev,
          authors: prev.authors.map((a) =>
            a.id === author.id || a.nameBn.trim() === author.nameBn.trim()
              ? { ...a, ...author, id: a.id }
              : a
          ),
        };
      }
      return {
        ...prev,
        authors: [...prev.authors, author],
      };
    });
  };

  const handleDeleteAuthor = (authorId: string, authorNameBn?: string) => {
    setPortalData((prev) => {
      const cleanName = authorNameBn?.trim();
      const remaining = prev.authors.filter((a) => {
        if (a.id === authorId) return false;
        if (cleanName && a.nameBn.trim() === cleanName) return false;
        return true;
      });
      // Ensure at least 1 primary author remains if all were somehow deleted
      const finalAuthors =
        remaining.length > 0 ? remaining : [initialDemoPortalData.authors[0]];
      const fallbackAuthorId = finalAuthors[0].id;
      const updatedArticles = prev.articles.map((art) =>
        finalAuthors.some((au) => au.id === art.authorId)
          ? art
          : { ...art, authorId: fallbackAuthorId }
      );
      return {
        ...prev,
        authors: finalAuthors,
        articles: updatedArticles,
      };
    });
  };

  const handleUpdateAd = (ad: Advertisement) => {
    setPortalData((prev) => ({
      ...prev,
      advertisements: prev.advertisements.map((item) =>
        item.id === ad.id ? ad : item
      ),
      editorialActivities: [
        {
          id: `act-${Date.now()}`,
          actionType: 'ad_updated',
          actorNameBn: prev.settings.editorNameBn,
          actorRoleBn: 'অ্যাডমিন প্যানেল',
          targetTitleBn: ad.titleBn,
          timestampBn: '২২ অক্টোবর ২০২৬, সদ্য হালনাগাদ',
          notesBn: `বিজ্ঞাপন স্লট (${ad.slotId}) হালনাগাদ করা হয়েছে।`,
        },
        ...prev.editorialActivities,
      ],
    }));
  };

  const handleAddAd = (ad: Advertisement) => {
    setPortalData((prev) => ({
      ...prev,
      advertisements: [ad, ...prev.advertisements],
      editorialActivities: [
        {
          id: `act-${Date.now()}`,
          actionType: 'ad_updated',
          actorNameBn: prev.settings.editorNameBn,
          actorRoleBn: 'অ্যাডমিন প্যানেল',
          targetTitleBn: ad.titleBn,
          timestampBn: '২২ অক্টোবর ২০২৬, সদ্য সংযোজিত',
          notesBn: `নতুন বিজ্ঞাপন স্লট (${ad.slotId}) যোগ করা হয়েছে।`,
        },
        ...prev.editorialActivities,
      ],
    }));
  };

  const handleDeleteAd = (adId: string) => {
    setPortalData((prev) => ({
      ...prev,
      advertisements: prev.advertisements.filter((a) => a.id !== adId),
    }));
  };

  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setPortalData((prev) => ({
      ...prev,
      settings: newSettings,
      editorialActivities: [
        {
          id: `act-${Date.now()}`,
          actionType: 'settings_updated',
          actorNameBn: newSettings.editorNameBn,
          actorRoleBn: 'অ্যাডমিন প্যানেল',
          targetTitleBn: newSettings.portalNameBn,
          timestampBn: '২২ অক্টোবর ২০২৬, সদ্য হালনাগাদ',
          notesBn: 'পোর্টাল মাস্টহেড ও সেটিংস হালনাগাদ করা হয়েছে।',
        },
        ...prev.editorialActivities,
      ],
    }));
  };

  const handleSubmitContactMessage = (
    msg: Omit<ContactMessage, 'id' | 'submittedAtBn' | 'status'>
  ) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      submittedAtBn: '২২ অক্টোবর ২০২৬, সদ্য প্রাপ্ত',
      status: 'unread',
    };
    setPortalData((prev) => ({
      ...prev,
      contactMessages: [newMsg, ...prev.contactMessages],
    }));
  };

  const handleToggleMessageStatus = (msgId: string) => {
    setPortalData((prev) => ({
      ...prev,
      contactMessages: prev.contactMessages.map((m) =>
        m.id === msgId
          ? { ...m, status: m.status === 'unread' ? 'reviewed' : 'unread' }
          : m
      ),
    }));
  };

  const handleDeleteMessage = (msgId: string) => {
    setPortalData((prev) => ({
      ...prev,
      contactMessages: prev.contactMessages.filter((m) => m.id !== msgId),
    }));
  };

  const handleResetDemoData = () => {
    localStorage.removeItem(PORTAL_STORE_KEY);
    setPortalData(initialDemoPortalData);
  };

  if (activeView === 'admin') {
    return (
      <AdminDashboard
        settings={portalData.settings}
        articles={portalData.articles}
        categories={portalData.categories}
        authors={portalData.authors}
        advertisements={portalData.advertisements}
        editorialActivities={portalData.editorialActivities}
        contactMessages={portalData.contactMessages}
        onBackToPortal={handleSelectHome}
        onSelectArticlePreview={handleSelectArticle}
        onSaveArticle={handleSaveArticle}
        onDeleteArticle={handleDeleteArticle}
        onQuickStatusChange={handleQuickStatusChange}
        onToggleArticleFlag={handleToggleArticleFlag}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddAuthor={handleAddAuthor}
        onDeleteAuthor={handleDeleteAuthor}
        onUpdateAd={handleUpdateAd}
        onAddAd={handleAddAd}
        onDeleteAd={handleDeleteAd}
        onUpdateSettings={handleUpdateSettings}
        onToggleMessageStatus={handleToggleMessageStatus}
        onDeleteMessage={handleDeleteMessage}
        onResetDemoData={handleResetDemoData}
      />
    );
  }

  return (
    <div id="top" className="min-h-screen flex flex-col bg-white text-stone-900">
      <Header
        settings={portalData.settings}
        categories={portalData.categories}
        breakingArticles={breakingArticles}
        activeView={activeView}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        bookmarkedCount={bookmarkedIds.length}
        onSelectHome={handleSelectHome}
        onSelectCategory={handleSelectCategory}
        onSelectArchive={handleSelectArchive}
        onSelectAdmin={() => handleSwitchView('admin')}
        onSearchChange={handleSearchChange}
        onSelectArticle={handleSelectArticle}
        onOpenSeoModal={() => setActiveModal('seo-architecture')}
        onOpenSavedModal={() => setActiveModal('saved-articles')}
      />

      <main className="flex-1">
        {activeView === 'article' ? (
          activeArticle ? (
            <ArticlePage
              article={activeArticle}
              author={authorsMap[activeArticle.authorId]}
              relatedArticles={publishedArticles.filter(
                (a) => a.id !== activeArticle.id
              )}
              authorsMap={authorsMap}
              inlineAd={portalData.advertisements.find(
                (a) => a.slotId === 'mid-page-banner'
              )}
              isBookmarked={bookmarkedIds.includes(activeArticle.id)}
              onToggleBookmark={handleToggleBookmark}
              onBackHome={handleSelectHome}
              onSelectCategory={handleSelectCategory}
              onSelectAuthor={handleSelectAuthor}
              onSelectTag={handleSelectTag}
              onSelectArticle={handleSelectArticle}
              onInspectAdPolicy={() => setActiveModal('advertising')}
            />
          ) : (
            <div className="max-w-xl mx-auto px-4 py-16 text-center my-8 bg-stone-50 border border-stone-200 rounded">
              <AlertTriangle className="w-10 h-10 text-red-700 mx-auto mb-3" />
              <h1 className="text-xl font-bold text-stone-900">
                কাঙ্ক্ষিত ডেমো প্রতিবেদনটি খুঁজে পাওয়া যায়নি (৪০৪)
              </h1>
              <p className="text-sm text-stone-600 mt-2">
                আপনি যে সংবাদের লিঙ্কে প্রবেশ করেছেন তা অনুপস্থিত অথবা সরিয়ে ফেলা হয়েছে। অনুগ্রহ করে প্রচ্ছদে ফিরে অন্য সংবাদগুলো দেখুন।
              </p>
              <button
                type="button"
                onClick={handleSelectHome}
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-red-700 text-white rounded hover:bg-red-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>মূল প্রচ্ছদে ফিরে যান</span>
              </button>
            </div>
          )
        ) : activeView === 'category' ? (
          <CategoryPageTemplate
            categorySlug={activeCategory}
            categories={portalData.categories}
            articles={publishedArticles}
            authorsMap={authorsMap}
            settings={portalData.settings}
            sidebarAd={portalData.advertisements.find(
              (a) => a.slotId === 'sidebar-rectangle'
            )}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectCategory={handleSelectCategory}
            onSelectArticle={handleSelectArticle}
            onSelectAuthor={handleSelectAuthor}
            onBackHome={handleSelectHome}
            onInspectAdPolicy={() => setActiveModal('advertising')}
          />
        ) : activeView === 'author' ? (
          <AuthorProfileTemplate
            authorSlug={activeAuthorSlug}
            authors={portalData.authors}
            articles={publishedArticles}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectAuthor={handleSelectAuthor}
            onSelectArticle={handleSelectArticle}
            onBackHome={handleSelectHome}
          />
        ) : activeView === 'archive' ? (
          <SearchAndArchiveTemplate
            articles={publishedArticles}
            categories={portalData.categories}
            tags={portalData.tags}
            authorsMap={authorsMap}
            searchQuery={searchQuery}
            selectedCategory={activeCategory}
            selectedTag={activeTag}
            bookmarkedIds={bookmarkedIds}
            onSearchChange={setSearchQuery}
            onCategoryFilterChange={setActiveCategory}
            onTagFilterChange={setActiveTag}
            onToggleBookmark={handleToggleBookmark}
            onSelectArticle={handleSelectArticle}
            onSelectAuthor={handleSelectAuthor}
            onBackHome={handleSelectHome}
          />
        ) : activeView === 'about' ||
          activeView === 'contact' ||
          activeView === 'editorial-policy' ||
          activeView === 'privacy-policy' ||
          activeView === 'terms' ? (
          <StaticPagesTemplate
            view={activeView}
            settings={portalData.settings}
            authors={portalData.authors}
            onSwitchView={handleSwitchView}
            onSelectAuthor={handleSelectAuthor}
            onSubmitContactMessage={handleSubmitContactMessage}
          />
        ) : (
          <HomePage
            articles={publishedArticles}
            authorsMap={authorsMap}
            advertisements={portalData.advertisements}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectArticle={handleSelectArticle}
            onSelectCategory={handleSelectCategory}
            onSelectAuthor={handleSelectAuthor}
            onInspectAdPolicy={() => setActiveModal('advertising')}
          />
        )}
      </main>

      <Footer
        settings={portalData.settings}
        categories={portalData.categories}
        onSelectCategory={handleSelectCategory}
        onSelectHome={handleSelectHome}
        onSwitchView={handleSwitchView}
        onOpenModal={(type) => setActiveModal(type)}
      />

      <PortalModal
        modalType={activeModal}
        onClose={() => setActiveModal(null)}
        bookmarkedArticles={bookmarkedArticles}
        onSelectArticle={handleSelectArticle}
        onRemoveBookmark={handleToggleBookmark}
      />
    </div>
  );
}
