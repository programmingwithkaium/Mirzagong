import React from 'react';
import { X, Trash2, Bookmark, ExternalLink, Info } from 'lucide-react';
import type { Article, Category, PortalPublicView, SiteSettings } from '../types/news.ts';
import { NewsMirzaganjLogo } from './NewsMirzaganjLogo.tsx';
import { toBengaliDigits } from '../utils/newsLogic.ts';

export type InfoModalType =
  | 'seo-architecture'
  | 'saved-articles'
  | 'advertising'
  | null;

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
  onSelectCategory: (slug: string) => void;
  onSelectHome: () => void;
  onSwitchView: (view: PortalPublicView) => void;
  onOpenModal: (type: InfoModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  categories,
  onSelectCategory,
  onSelectHome,
  onSwitchView,
  onOpenModal,
}) => {
  const developerName = settings.developerNameBn || 'মোঃ আঃ কাইয়ূম';
  const developerRole = settings.developerRoleBn || 'ডেভেলপার ও কারিগরি নির্মাতা';
  const developerPhoto = settings.developerPhotoUrl || '/assets/aistudio/____6f31a55b.png';
  const developerFb =
    settings.developerFacebookUrl || 'https://www.facebook.com/freelancerkaium143/';
  const adminPhoto =
    settings.adminPhotoUrl ||
    '/assets/aistudio/c86a50b4-d4d1-4994-b557-8e1f3319ba81_e3e38474.jfif';

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 mt-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-stone-800">
          {/* Brand & Editorial Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <button
              type="button"
              onClick={onSelectHome}
              className="flex items-center gap-3 text-left group"
            >
              <div className="bg-white p-1.5 rounded-full">
                <NewsMirzaganjLogo size="sm" />
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors">
                {settings.portalNameBn}
              </span>
            </button>
            <p className="text-xs text-stone-400 leading-relaxed">
              {settings.taglineBn}। মির্জাগঞ্জ উপজেলার ৬টি ইউনিয়ন, পায়রা উপকূল ও সারাদেশের ট্রেন্ডিং সংবাদের নির্ভরযোগ্য ডিজিটাল পোর্টাল।
            </p>
            <div className="pt-2 text-xs text-stone-400 space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-900/90 border border-stone-800">
                <img
                  src={adminPhoto}
                  alt={settings.editorNameBn}
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-[10px] text-emerald-400 font-bold">
                    প্রধান অ্যাডমিন ও ভারপ্রাপ্ত সম্পাদক
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {settings.editorNameBn}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2.5 p-2 rounded-lg bg-stone-900 border border-stone-700">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={developerPhoto}
                    alt={developerName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] text-amber-400 font-semibold">
                      {developerRole}
                    </div>
                    <div className="text-xs font-bold text-white truncate">
                      {developerName}
                    </div>
                  </div>
                </div>
                <a
                  href={developerFb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shrink-0 transition-colors"
                >
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>ইমেইল: {settings.editorialEmail}</div>
              <div>ঠিকানা: {settings.officeAddressBn}</div>
            </div>
          </div>

          {/* Categories (4 cols) */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-bold text-white mb-4">সংবাদ বিভাগসমূহ</h3>
            <ul className="grid grid-cols-2 gap-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('trending');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-red-400 hover:text-white font-semibold transition-colors"
                >
                  এখন ট্রেন্ডিং
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('education');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-300 hover:text-white font-semibold transition-colors"
                >
                  শিক্ষা সংক্রান্ত
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('edu-college-girls');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-amber-300 hover:text-white font-semibold transition-colors"
                >
                  কলেজ (বালিকা) — মহিলা কলেজ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('health');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-300 hover:text-white font-semibold transition-colors"
                >
                  স্বাস্থ্য সংক্রান্ত
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    {cat.nameBn}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory('video');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  ভিডিও সংবাদ
                </button>
              </li>
            </ul>
          </div>

          {/* Dedicated Portal Pages & Admin Link (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold text-white">পোর্টাল পাতা ও নীতিমালা</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSwitchView('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-300 hover:text-white transition-colors"
                >
                  আমাদের সম্পর্কে ও বার্তা কক্ষ পরিচিতি
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSwitchView('author');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-300 hover:text-white transition-colors"
                >
                  প্রতিবেদক ও লেখক প্রোফাইল ডিরেক্টরি
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSwitchView('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-300 hover:text-white transition-colors"
                >
                  যোগাযোগ ও স্থানীয় সংবাদের তথ্য পাঠান
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSwitchView('editorial-policy');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  সম্পাদকীয় নীতিমালা (Editorial Policy)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSwitchView('privacy-policy');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  গোপনীয়তা নীতি (Privacy Policy)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSwitchView('terms');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  ব্যবহারের শর্তাবলি (Terms of Use)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSwitchView('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-red-400 hover:text-red-300 font-semibold transition-colors underline underline-offset-4"
                >
                  অ্যাডমিন ড্যাশবোর্ড (/admin — অল কন্ট্রোল প্যানেল)
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright, Developer Credit & Demo Disclaimer */}
        <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © ২০২৬ {settings.portalNameBn} ({settings.portalNameEn}) — সর্বস্বত্ব সংরক্ষিত।
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <img
              src={developerPhoto}
              alt={developerName}
              className="w-6 h-6 rounded-full object-cover border border-amber-400"
            />
            <span className="font-bold text-amber-400">
              ডেভেলপার: {developerName}
            </span>
            <a
              href={developerFb}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2"
            >
              <span>ফেসবুক আইডি</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface PortalModalProps {
  modalType: InfoModalType;
  onClose: () => void;
  bookmarkedArticles: Article[];
  onSelectArticle: (slug: string) => void;
  onRemoveBookmark: (articleId: string) => void;
}

export const PortalModal: React.FC<PortalModalProps> = ({
  modalType,
  onClose,
  bookmarkedArticles,
  onSelectArticle,
  onRemoveBookmark,
}) => {
  if (!modalType) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-modal-title"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white border border-stone-200 rounded max-w-2xl w-full max-h-[88vh] flex flex-col shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-4 bg-stone-50">
          <h2 id="portal-modal-title" className="text-lg font-bold text-stone-900">
            {modalType === 'seo-architecture' &&
              'এসইও (SEO) পরিকল্পনা, ডেটা মডেল ও ফায়ারবেস আর্কিটেকচার'}
            {modalType === 'saved-articles' &&
              `সংরক্ষিত ডেমো সংবাদ (${toBengaliDigits(bookmarkedArticles.length)})`}
            {modalType === 'advertising' && 'বিজ্ঞাপন স্লট ও রেসপনসিভ স্পেসিফিকেশন'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="ডায়ালগ বন্ধ করুন"
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-sm text-stone-700 leading-relaxed">
          {modalType === 'seo-architecture' && (
            <>
              <div className="p-4 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>ক্লায়েন্ট-সাইড Vite ও এসইও (SEO) সীমাবদ্ধতা ব্যাখ্যা:</span>
                </div>
                <p>
                  শুধুমাত্র ক্লায়েন্ট-সাইড Vite (React SPA) স্বয়ংক্রিয়ভাবে সর্বোত্তম এসইও (Optimal SEO) প্রদান করে না। কারণ প্রাথমিক HTML পেলোডে কেবল একটি খালি <code className="font-mono">&lt;div id=&quot;root&quot;&gt;</code> থাকে এবং জাভাস্ক্রিপ্ট ব্রাউজারে রান হওয়ার পর মেটা ট্যাগ ও কন্টেন্ট তৈরি হয়।
                </p>
                <p className="font-medium">
                  প্রোডাকশন সমাধান: পূর্ণাঙ্গ এসইও নিশ্চিত করতে প্রোডাকশনে Server-Side Rendering (SSR), Prerendering, অথবা সার্ভার প্রক্সির মাধ্যমে ডায়নামিক মেটা ও <code className="font-mono">NewsArticle</code> JSON-LD ইনজেকশন ব্যবহার করা আবশ্যক।
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-stone-900 mb-2">
                  ১. বাস্তবায়িত এসইও ও মেটাডেটা বৈশিষ্ট্য:
                </h3>
                <ul className="space-y-1.5 text-xs list-disc list-inside text-stone-700">
                  <li>
                    প্রতিটি নিবন্ধের জন্য ডায়নামিক <code className="font-mono">&lt;title&gt;</code>, <code className="font-mono">meta description</code> এবং <code className="font-mono">rel=&quot;canonical&quot;</code> ইউআরএল আপডেট।
                  </li>
                  <li>
                    Schema.org <code className="font-mono">NewsMediaOrganization</code> (হোমপেজ) এবং <code className="font-mono">NewsArticle</code> (নিবন্ধ পৃষ্ঠা) JSON-LD স্ট্রাকচার্ড ডেটা।
                  </li>
                  <li>
                    Google News এক্সটেনশনসহ <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-red-700 underline inline-flex items-center gap-1">/sitemap.xml <ExternalLink className="w-3 h-3" /></a> এবং <a href="/robots.txt" target="_blank" rel="noreferrer" className="text-red-700 underline">/robots.txt</a> ফাইল প্রস্তুত।
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-stone-100 border border-stone-200 rounded text-xs">
                <div className="font-bold text-stone-900 mb-1">
                  ফায়ারবেস সংযোগের বর্তমান অবস্থা (Firebase Status: Unconnected in Phase 2)
                </div>
                <p className="text-stone-600">
                  নির্দেশনা অনুযায়ী দ্বিতীয় ধাপে (Phase 2) লোকাল স্টেট মোডে পূর্ণাঙ্গ <code className="font-mono">/admin</code> ড্যাশবোর্ড ও পাবলিক টেমপ্লেট নির্মিত হয়েছে। পরবর্তী ধাপে (Phase 3) Firebase Authentication, Firestore ও Cloud Storage সংযুক্ত এবং Firestore Security Rules যাচাই করা হবে।
                </p>
              </div>
            </>
          )}

          {modalType === 'saved-articles' && (
            <>
              {bookmarkedArticles.length === 0 ? (
                <div className="py-10 text-center text-stone-500">
                  <Bookmark className="w-8 h-8 mx-auto mb-2 text-stone-400" />
                  <p className="font-medium text-stone-800">কোনো সংরক্ষিত সংবাদ নেই</p>
                  <p className="text-xs mt-1">
                    যেকোনো সংবাদের পাশে &ldquo;সংরক্ষণ&rdquo; বোতামে ক্লিক করে পরবর্তীতে পড়ার জন্য জমা রাখতে পারেন।
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-stone-200">
                  {bookmarkedArticles.map((art) => (
                    <li
                      key={art.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="text-xs text-red-700 font-semibold mb-0.5">
                          {art.categoryNameBn} · ডেমো প্রতিবেদন
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectArticle(art.slug);
                            onClose();
                          }}
                          className="text-sm font-bold text-stone-900 hover:text-red-700 text-left"
                        >
                          {art.title}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveBookmark(art.id)}
                        aria-label={`"${art.title}" মুছে ফেলুন`}
                        className="p-1.5 text-stone-400 hover:text-red-700 rounded hover:bg-stone-100 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {modalType === 'advertising' && (
            <div className="space-y-3 text-xs sm:text-sm">
              <p>
                নিউজ মির্জাগঞ্জে ৩টি মানসম্মত রেসপনসিভ বিজ্ঞাপন প্লেসহোল্ডার স্লট প্রস্তুত করা হয়েছে যা অ্যাডমিন ড্যাশবোর্ড (<code className="font-mono">/admin</code>) থেকে তাৎক্ষণিক নিয়ন্ত্রণ করা যায়:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>হোমপেজ লিডারবোর্ড ব্যানার (970 × 90 px)</li>
                <li>সাইডবার মিডিয়াম রেকট্যাঙ্গেল (300 × 250 px)</li>
                <li>ইন-ফিড ও নিবন্ধ অভ্যন্তরীণ ব্যানার (728 × 90 px)</li>
              </ul>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
