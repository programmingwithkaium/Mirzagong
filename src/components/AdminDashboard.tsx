import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  Camera,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FileText,
  Filter,
  Flag,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  LayoutGrid,
  Lock,
  LogOut,
  MapPin,
  Megaphone,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import type {
  Advertisement,
  Article,
  ArticleGalleryItem,
  ArticleStatus,
  Author,
  Category,
  ContactMessage,
  EditorialActivity,
  PortalMenuConfig,
  SiteSettings,
  VisualTheme,
} from '../types/news.ts';
import { EditorialImage } from './EditorialImage.tsx';
import { NewsMirzaganjLogo } from './NewsMirzaganjLogo.tsx';
import {
  estimateReadingTimeMinutes,
  formatBengaliNumber,
  generateArticleSlug,
  getEffectiveMenuConfig,
  MIRZAGANJ_EDUCATION_ITEMS,
  MIRZAGANJ_HEALTH_ITEMS,
  MIRZAGANJ_UNIONS,
  MIRZAGANJ_WARDS,
  resolveCategoryMeta,
  toBengaliDigits,
  validateArticleDraft,
} from '../utils/newsLogic.ts';

type AdminSection =
  | 'overview'
  | 'compose'
  | 'articles'
  | 'area-performance'
  | 'categories-tags'
  | 'admin-roles'
  | 'highlights'
  | 'ads'
  | 'inbox'
  | 'settings-logs';

export type AdminPermissionKey =
  | 'compose_news'
  | 'manage_articles'
  | 'manage_breaking'
  | 'manage_ads'
  | 'manage_categories'
  | 'manage_inbox_settings'
  | 'manage_admins';

export const ADMIN_PERMISSION_DEFINITIONS: {
  key: AdminPermissionKey;
  labelBn: string;
  descBn: string;
}[] = [
  {
    key: 'compose_news',
    labelBn: 'সংবাদ লেখা ও ছবি আপলোড',
    descBn: 'নতুন সংবাদ রচনা, ইউনিয়ন/শিক্ষা/স্বাস্থ্য/খেলাধুলা বিভাগ নির্বাচন ও ছবি আপলোড করতে পারবে।',
  },
  {
    key: 'manage_articles',
    labelBn: 'সংবাদ সম্পাদনা, প্রকাশ ও মুছে ফেলা',
    descBn: 'প্রকাশিত বা খসড়া সংবাদ সম্পাদনা (Edit), প্রকাশ (Publish) ও মুছে ফেলতে (Delete) পারবে।',
  },
  {
    key: 'manage_breaking',
    labelBn: 'ব্রেকিং নিউজ ও প্রধান সংবাদ নিয়ন্ত্রণ',
    descBn: 'ব্রেকিং নিউজ টিকার এবং হোমপেজের লিড স্টোরি নির্ধারণ করতে পারবে।',
  },
  {
    key: 'manage_ads',
    labelBn: 'বিজ্ঞাপন নিয়ন্ত্রণ (Ads Control)',
    descBn: 'বিজ্ঞাপন ব্যানার আপলোড, নতুন বিজ্ঞাপন যোগ ও চালু/বন্ধ করতে পারবে।',
  },
  {
    key: 'manage_categories',
    labelBn: 'ইউনিয়ন, বিভাগ ও প্রতিবেদক ব্যবস্থাপনা',
    descBn: 'নতুন বিভাগ সংযোজন, ইউনিয়ন পারফরম্যান্স ও প্রতিবেদক তালিকা পরিচালনা করতে পারবে।',
  },
  {
    key: 'manage_inbox_settings',
    labelBn: 'পাঠক বার্তা ইনবক্স ও পোর্টাল সেটিংস',
    descBn: 'পাঠকদের পাঠানো বার্তা পড়া এবং পোর্টালের সাধারণ সেটিংস পরিবর্তন করতে পারবে।',
  },
  {
    key: 'manage_admins',
    labelBn: 'নতুন অ্যাডমিন তৈরি ও পারমিশন নিয়ন্ত্রণ',
    descBn: 'অন্যকে মোবাইল নাম্বার ও পাসওয়ার্ড দিয়ে অ্যাডমিন বানানো এবং নির্দিষ্ট পারমিশন দিতে পারবে।',
  },
];

export const ALL_ADMIN_PERMISSION_KEYS: AdminPermissionKey[] =
  ADMIN_PERMISSION_DEFINITIONS.map((d) => d.key);

export interface AdminAccount {
  id: string;
  accountType?: 'admin' | 'public';
  nameBn: string;
  nameEn: string;
  phone: string;
  password: string;
  handle: string;
  email: string;
  roleBn: string;
  roleBadgeEn: string;
  avatarInitials: string;
  avatarUrl?: string;
  isSuperAdmin?: boolean;
  permissions: AdminPermissionKey[];
  createdAtBn: string;
}

interface AdminSession extends AdminAccount {
  loggedInAtBn: string;
}

const ADMIN_SESSION_STORAGE_KEY = 'newsmirzaganj_admin_session_v5';
const ADMIN_ACCOUNTS_STORAGE_KEY = 'newsmirzaganj_admin_accounts_v5';

function normalizeDigitsToAscii(input: string): string {
  const bengaliDigits = '০১২৩৪৫৬৭৮৯';
  return input
    .trim()
    .split('')
    .map((ch) => {
      const idx = bengaliDigits.indexOf(ch);
      return idx !== -1 ? String(idx) : ch;
    })
    .join('')
    .replace(/[\s-]/g, '');
}

const DEFAULT_ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'adm-super-1',
    accountType: 'admin',
    nameBn: 'মোঃ আঃ কাইয়ূম',
    nameEn: 'Md. A. Kaium',
    phone: '01700000000',
    password: '123456',
    handle: '@mdakaium',
    email: 'kaium.admin@newsmirzaganj.example.com',
    roleBn: 'ডেভেলপার ও প্রধান সিস্টেম অ্যাডমিন (সকল পারমিশন)',
    roleBadgeEn: 'Super Admin',
    avatarInitials: 'কাই',
    avatarUrl: '/assets/aistudio/c86a50b4-d4d1-4994-b557-8e1f3319ba81_e3e38474.jfif',
    isSuperAdmin: true,
    permissions: [...ALL_ADMIN_PERMISSION_KEYS],
    createdAtBn: 'স্থায়ী সুপার অ্যাডমিন',
  },
  {
    id: 'adm-editor-2',
    accountType: 'admin',
    nameBn: 'নাবিলা করিম',
    nameEn: 'Nabila Karim',
    phone: '01800000000',
    password: '123456',
    handle: '@nabilakarim',
    email: 'nabila.editor@newsmirzaganj.example.com',
    roleBn: 'বার্তা ও শিক্ষাঙ্গন অ্যাডমিন',
    roleBadgeEn: 'News Editor',
    avatarInitials: 'নাবি',
    permissions: ['compose_news', 'manage_articles', 'manage_breaking'],
    createdAtBn: '২২ অক্টোবর ২০২৬',
  },
  {
    id: 'adm-ads-3',
    accountType: 'admin',
    nameBn: 'তানভীর আহমেদ',
    nameEn: 'Tanvir Ahmed',
    phone: '01900000000',
    password: '123456',
    handle: '@tanvirahmed',
    email: 'tanvir.ads@newsmirzaganj.example.com',
    roleBn: 'বিজ্ঞাপন ও বাণিজ্য অ্যাডমিন',
    roleBadgeEn: 'Ad Manager',
    avatarInitials: 'তান',
    permissions: ['compose_news', 'manage_ads'],
    createdAtBn: '২২ অক্টোবর ২০২৬',
  },
  {
    id: 'pub-user-1',
    accountType: 'public',
    nameBn: 'পাবলিক ইউজার (01600000000)',
    nameEn: 'Public User',
    phone: '01600000000',
    password: '123456',
    handle: '@public_0000',
    email: 'public.0000@newsmirzaganj.example.com',
    roleBn: 'পাবলিক অ্যাকাউন্ট (নাম্বার ও পাসওয়ার্ড)',
    roleBadgeEn: 'Public',
    avatarInitials: 'পাব',
    permissions: ['compose_news'],
    createdAtBn: '২২ অক্টোবর ২০২৬',
  },
];

const REAL_MIRZAGANJ_PHOTO_LIBRARY: {
  imageUrl: string;
  titleBn: string;
  locationBn: string;
  captionBn: string;
  theme: VisualTheme;
}[] = [
  {
    imageUrl: '/assets/aistudio/images__6__4cd9f74e.jpg',
    titleBn: 'পায়রা নদীর তীর রক্ষা সিসি ব্লক বাঁধ ও সিঁড়ি',
    locationBn: 'পায়রা নদী পাড়, মির্জাগঞ্জ',
    captionBn:
      'পটুয়াখালীর মির্জাগঞ্জে খরস্রোতা পায়রা নদীর ভাঙন রোধে নির্মিত সিসি ব্লক বাঁধ ও নদীপাড়ের সিঁড়ি।',
    theme: 'payra_river',
  },
  {
    imageUrl: '/assets/aistudio/images__2__d67a18b2.jpg',
    titleBn: 'সুবিদখালী সরকারি কলেজ ও পাইলট স্কুল মাঠ',
    locationBn: 'দেউলী সুবিদখালী, মির্জাগঞ্জ',
    captionBn:
      'ঐতিহ্যবাহী সুবিদখালী সরকারি কলেজ ও রইচ উদ্দিন পাইলট স্কুল চত্বরের একাডেমিক ভবন ও সবুজ খেলার মাঠ।',
    theme: 'subidkhali_college',
  },
  {
    imageUrl: '/assets/aistudio/images__1__d4d1a735.jpg',
    titleBn: 'আখতার হোসেন চৌধুরী মেমোরিয়াল ডিগ্রি কলেজ, কাঁঠালতলী',
    locationBn: 'কাঁঠালতলী, মাধবখালী, মির্জাগঞ্জ',
    captionBn:
      'মির্জাগঞ্জের কাঁঠালতলীতে অবস্থিত আখতার হোসেন চৌধুরী মেমোরিয়াল ডিগ্রি কলেজের প্রশাসন ভবন।',
    theme: 'pilot_school',
  },
  {
    imageUrl: '/assets/aistudio/images__3__863e98d7.jpg',
    titleBn: 'হযরত ইয়ার উদ্দিন খলিফা (রহ.) মাজার শরীফ চত্বর',
    locationBn: 'মির্জাগঞ্জ দরবার শরীফ, মির্জাগঞ্জ',
    captionBn:
      'পায়রা নদীর তীরে অবস্থিত ঐতিহাসিক মির্জাগঞ্জ হযরত ইয়ার উদ্দিন খলিফা (রহ.) মাজার শরীফ কমপ্লেক্স।',
    theme: 'mirzaganj_shrine_mosque',
  },
  {
    imageUrl: '/assets/aistudio/images__4__f6fbbe46.jpg',
    titleBn: 'উপজেলা স্বাস্থ্য কমপ্লেক্স, মির্জাগঞ্জ, পটুয়াখালী',
    locationBn: 'উপজেলা স্বাস্থ্য কমপ্লেক্স, মির্জাগঞ্জ',
    captionBn:
      'পটুয়াখালীর মির্জাগঞ্জ ৫০ শয্যাবিশিষ্ট উপজেলা স্বাস্থ্য কমপ্লেক্সের মূল ভবন।',
    theme: 'education',
  },
  {
    imageUrl: '/assets/aistudio/images__7__0de16b1e.jpg',
    titleBn: 'মির্জাগঞ্জ দরবার শরীফের ঐতিহাসিক বার্ষিক ওয়াজ মাহফিল',
    locationBn: 'মির্জাগঞ্জ মাহফিল ময়দান',
    captionBn:
      'মির্জাগঞ্জ দরবার শরীফে ঐতিহাসিক বার্ষিক ওয়াজ ও তাফসিরুল কোরআন মাহফিলে লাখো মুসল্লির সমাগম।',
    theme: 'mirzaganj_shrine_mosque',
  },
  {
    imageUrl: '/assets/aistudio/images__5__4ddb199b.jpg',
    titleBn: 'মির্জাগঞ্জ দরবার শরীফ তিনতলা জামে মসজিদ কমপ্লেক্স',
    locationBn: 'মির্জাগঞ্জ দরবার শরীফ',
    captionBn:
      'মির্জাগঞ্জ হযরত ইয়ার উদ্দিন খলিফা (রহ.) দরবার শরীফের সুদৃশ্য তিনতলা জামে মসজিদ ভবন।',
    theme: 'mirzaganj_shrine_mosque',
  },
  {
    imageUrl: '/assets/aistudio/images_cb33891a.jpg',
    titleBn: 'ঐতিহাসিক মির্জাগঞ্জ মাজার ও দরবার শরীফের প্রধান তোরণ',
    locationBn: 'মির্জাগঞ্জ সদর, পটুয়াখালী',
    captionBn:
      'সবুজ গম্বুজবিশিষ্ট ঐতিহাসিক মির্জাগঞ্জ হযরত ইয়ার উদ্দিন খলিফা (রহ.) দরবার শরীফের প্রধান গেট।',
    theme: 'mirzaganj_tourism',
  },
  {
    imageUrl: '/assets/aistudio/images__1__d94b78a3.jpg',
    titleBn: 'সরকারি সুবিদখালী কলেজের মূল একাডেমিক ভবন (EIIN: ১০২৪৭১)',
    locationBn: 'সুবিদখালী সরকারি কলেজ, মির্জাগঞ্জ',
    captionBn:
      '১৯৭২ সালে প্রতিষ্ঠিত এবং ২০১৮ সালের ৮ আগস্ট জাতীয়করণকৃত সরকারি সুবিদখালী কলেজের মূল ভবন।',
    theme: 'subidkhali_college',
  },
  {
    imageUrl: '/assets/aistudio/images_18ce5d28.jpg',
    titleBn: 'সুবিদখালী সরকারি কলেজের চারতলা আধুনিক ভবন ও সবুজ মাঠ',
    locationBn: 'সুবিদখালী সরকারি কলেজ, মির্জাগঞ্জ',
    captionBn:
      'সুবিদখালী সরকারি কলেজের চারতলা একাডেমিক ভবন ও সামনের প্রশস্ত খেলার মাঠ।',
    theme: 'subidkhali_college',
  },
  {
    imageUrl: '/assets/aistudio/maxresdefault_8b160eb4.jpg',
    titleBn: 'সুবিদখালী সরকারি কলেজের ৬.১৩ একর ক্যাম্পাস ও পুকুর',
    locationBn: 'সুবিদখালী সরকারি কলেজ, মির্জাগঞ্জ',
    captionBn:
      'সুবিদখালী শহরের প্রাণকেন্দ্রে ৬.১৩ একর জমির ওপর বিস্তৃত কলেজ ক্যাম্পাসের পুকুর ও ভবনসমূহ।',
    theme: 'subidkhali_college',
  },
  {
    imageUrl: '/assets/aistudio/images__2__eb278632.jpg',
    titleBn: 'সুবিদখালী সরকারি রহমান ইসহাক পাইলট উচ্চ বিদ্যালয় (গেইট-২)',
    locationBn: 'সুবিদখালী, মির্জাগঞ্জ',
    captionBn:
      'সুবিদখালী সরকারি রহমান ইসহাক পাইলট মাধ্যমিক উচ্চ বিদ্যালয়ের গেইট নং-২ ও একাডেমিক প্রাঙ্গণ।',
    theme: 'pilot_school',
  },
  {
    imageUrl: '/assets/aistudio/images__3__ea59c5ae.jpg',
    titleBn: 'সুবিদখালী মহিলা (ডিগ্রী) কলেজ প্রধান ফটক (স্থাপিত: ১৯৯৫ খ্রি.)',
    locationBn: 'সুবিদখালী মহিলা (ডিগ্রী) কলেজ, মির্জাগঞ্জ',
    captionBn:
      'পটুয়াখালী মির্জাগঞ্জের সুবিদখালী মহিলা (ডিগ্রী) কলেজ (Subidkhali Women\'s Degree College, স্থাপিত: ১৯৯৫ খ্রিস্টাব্দ)-এর প্রধান তোরণ।',
    theme: 'subidkhali_college',
  },
];

interface AdminDashboardProps {
  settings: SiteSettings;
  articles: Article[];
  categories: Category[];
  authors: Author[];
  advertisements: Advertisement[];
  editorialActivities: EditorialActivity[];
  contactMessages: ContactMessage[];
  onBackToPortal: () => void;
  onSelectArticlePreview: (slug: string) => void;
  onSaveArticle: (article: Article, isNew: boolean) => void;
  onDeleteArticle: (articleId: string) => void;
  onQuickStatusChange: (articleId: string, status: ArticleStatus) => void;
  onToggleArticleFlag: (
    articleId: string,
    flag: 'isLeadStory' | 'isFeatured' | 'isBreaking' | 'isTrending'
  ) => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onAddAuthor: (author: Author) => void;
  onDeleteAuthor?: (authorId: string, authorNameBn?: string) => void;
  onUpdateAd: (ad: Advertisement) => void;
  onAddAd?: (ad: Advertisement) => void;
  onDeleteAd?: (adId: string) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onToggleMessageStatus: (msgId: string) => void;
  onDeleteMessage: (msgId: string) => void;
  onResetDemoData: () => void;
}

const VISUAL_THEMES: { value: VisualTheme; labelBn: string }[] = [
  { value: 'payra_river', labelBn: 'পায়রা ও শ্রীমন্ত নদী (Payra River & Embankment)' },
  { value: 'subidkhali_college', labelBn: 'সুবিদখালী সরকারি কলেজ ক্যাম্পাস (Subidkhali Govt. College)' },
  { value: 'pilot_school', labelBn: 'সুবিদখালী পাইলট উচ্চ বিদ্যালয় (Pilot High School)' },
  { value: 'mirzaganj_shrine_mosque', labelBn: 'মজিদবাড়িয়া শাহী মসজিদ ও মাজার শরীফ (Shrine & Shahi Mosque)' },
  { value: 'subidkhali_bazar', labelBn: 'সুবিদখালী সদর বাজার ও সেতু (Subidkhali Sadar & Bridge)' },
  { value: 'mirzaganj_tourism', labelBn: 'মির্জাগঞ্জের দর্শনীয় স্থান ও পর্যটন (Mirzaganj Tourist Spots)' },
  { value: 'sundarbans', labelBn: 'উপকূলীয় সবুজ বেষ্টনী (Coastal Belt)' },
  { value: 'agriculture', labelBn: 'কৃষি, আমন ও সৌর সেচ (Agriculture)' },
  { value: 'economy', labelBn: 'অর্থনীতি ও বাজারদর (Economy)' },
  { value: 'metro', labelBn: 'মহাসড়ক ও যোগাযোগ (Highway/Transport)' },
  { value: 'tech', labelBn: 'প্রযুক্তি ও আইটি ল্যাব (Tech/ICT)' },
  { value: 'education', labelBn: 'স্বাস্থ্য ও শিক্ষা অবকাঠামো (Health/Education)' },
  { value: 'culture', labelBn: 'ঐতিহ্য ও লোকজ সংস্কৃতি (Culture/Heritage)' },
  { value: 'cricket', labelBn: 'খেলাধুলা ও ক্রিকেট (Sports)' },
  { value: 'parliament', labelBn: 'ইউনিয়ন পরিষদ ও স্থানীয় সরকার (Local Gov)' },
  { value: 'port', labelBn: 'বন্দর ও রেমিট্যান্স (Port/Trade)' },
  { value: 'diplomacy', labelBn: 'আন্তর্জাতিক ও জলবায়ু (International)' },
  { value: 'energy', labelBn: 'পরিবেশ ও জলাধার (Environment)' },
];

/**
 * Reads an uploaded image File and compresses/resizes it via HTML5 canvas
 * so it stores reliably in localStorage and renders immediately.
 */
function readAndCompressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ছবি ফাইলটি পড়া সম্ভব হয়নি।'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        try {
          const maxWidth = 960;
          const maxHeight = 600;
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.84);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  articles,
  categories,
  authors,
  advertisements,
  editorialActivities,
  contactMessages,
  onBackToPortal,
  onSelectArticlePreview,
  onSaveArticle,
  onDeleteArticle,
  onQuickStatusChange,
  onToggleArticleFlag,
  onAddCategory,
  onDeleteCategory,
  onAddAuthor,
  onDeleteAuthor,
  onUpdateAd,
  onAddAd,
  onDeleteAd,
  onUpdateSettings,
  onToggleMessageStatus,
  onDeleteMessage,
  onResetDemoData,
}) => {
  // Admin Accounts Registry (Persisted in localStorage so Super Admin can add/edit admins with phone + password + permissions)
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_ACCOUNTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AdminAccount[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_ADMIN_ACCOUNTS;
  });

  const saveAdminAccountsToStorage = (updated: AdminAccount[]) => {
    setAdminAccounts(updated);
    try {
      localStorage.setItem(ADMIN_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Track explicitly deleted admin/reporter names so deleted names never reappear in Reporter dropdown
  const DELETED_REPORTERS_STORAGE_KEY = 'newsmirzaganj_deleted_reporter_names_v1';
  const [deletedReporterNames, setDeletedReporterNames] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('newsmirzaganj_deleted_reporter_names_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const recordDeletedReporterName = (nameBn: string) => {
    const clean = nameBn.trim();
    if (!clean) return;
    setDeletedReporterNames((prev) => {
      const next = Array.from(new Set([...prev, clean]));
      try {
        localStorage.setItem(DELETED_REPORTERS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const unrecordDeletedReporterName = (nameBn: string) => {
    const clean = nameBn.trim();
    if (!clean) return;
    setDeletedReporterNames((prev) => {
      const next = prev.filter((n) => n !== clean);
      try {
        localStorage.setItem(DELETED_REPORTERS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Effective reporters list synchronized with Admin deletions
  const effectiveAuthors = React.useMemo(() => {
    const activeAdminNames = new Set(
      adminAccounts
        .filter((a) => a.accountType !== 'public')
        .map((a) => a.nameBn.trim())
    );
    const defaultSubAdminNames = new Set(
      DEFAULT_ADMIN_ACCOUNTS.filter((a) => !a.isSuperAdmin).map((a) => a.nameBn.trim())
    );

    const filtered = authors.filter((au) => {
      const cleanName = au.nameBn.trim();
      if (deletedReporterNames.includes(cleanName)) return false;
      // If this author was one of the default sub-admins (e.g. নাবিলা করিম, তানভীর আহমেদ)
      // and was already deleted from adminAccounts, hide them immediately
      if (defaultSubAdminNames.has(cleanName) && !activeAdminNames.has(cleanName)) {
        return false;
      }
      return true;
    });

    return filtered.length > 0 ? filtered : authors.slice(0, 1);
  }, [authors, adminAccounts, deletedReporterNames]);

  // Automatically purge any previously deleted sub-admin from persistent `authors` store as well
  useEffect(() => {
    if (!onDeleteAuthor) return;
    const activeAdminNames = new Set(
      adminAccounts
        .filter((a) => a.accountType !== 'public')
        .map((a) => a.nameBn.trim())
    );
    const defaultSubAdminNames = new Set(
      DEFAULT_ADMIN_ACCOUNTS.filter((a) => !a.isSuperAdmin).map((a) => a.nameBn.trim())
    );
    authors.forEach((au) => {
      const cleanName = au.nameBn.trim();
      if (
        deletedReporterNames.includes(cleanName) ||
        (defaultSubAdminNames.has(cleanName) && !activeAdminNames.has(cleanName))
      ) {
        if (au.id !== 'author-1') {
          onDeleteAuthor(au.id, cleanName);
        }
      }
    });
  }, [adminAccounts, authors, deletedReporterNames, onDeleteAuthor]);

  // Authentication / Login Gate State
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    if (typeof window === 'undefined') {
      return {
        ...DEFAULT_ADMIN_ACCOUNTS[0],
        loggedInAtBn: '২২ অক্টোবর ২০২৬, সক্রিয় সেশন',
      };
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === '1') return null;
    try {
      const saved = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AdminSession;
        if (parsed && parsed.phone && Array.isArray(parsed.permissions)) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return {
      ...DEFAULT_ADMIN_ACCOUNTS[0],
      loggedInAtBn: '২২ অক্টোবর ২০২৬, সক্রিয় সেশন',
    };
  });

  const [loginTab, setLoginTab] = useState<'public' | 'admin'>('public');
  const [loginAdminName, setLoginAdminName] = useState('মোঃ আঃ কাইয়ূম');
  const [loginPhone, setLoginPhone] = useState('01600000000');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin vs Public Creator Form State
  // অ্যাডমিনের জন্য: নাম, ফোন, পাসওয়ার্ড | পাবলিকের জন্য: নাম্বার ও পাসওয়ার্ড
  const [creatorAccountType, setCreatorAccountType] = useState<'admin' | 'public'>('admin');
  const [accountListFilter, setAccountListFilter] = useState<'all' | 'admin' | 'public'>('all');
  const [newAdminNameBn, setNewAdminNameBn] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRoleBn, setNewAdminRoleBn] = useState('সহকারী অ্যাডমিন ও প্রতিবেদক');
  const [newAdminPermissions, setNewAdminPermissions] = useState<AdminPermissionKey[]>([
    'compose_news',
    'manage_articles',
  ]);
  const [newPublicPhone, setNewPublicPhone] = useState('');
  const [newPublicPassword, setNewPublicPassword] = useState('');
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);

  const hasPermission = (perm: AdminPermissionKey): boolean => {
    if (!adminSession) return false;
    if (adminSession.isSuperAdmin) return true;
    return adminSession.permissions.includes(perm);
  };

  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [statusFilter, setStatusFilter] = useState<'all' | ArticleStatus>('all');
  const [adminSearch, setAdminSearch] = useState('');
  const [overviewSort, setOverviewSort] = useState<'popular' | 'latest'>('popular');
  const [overviewPage, setOverviewPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Article Composer & Photo Upload State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContentText, setFormContentText] = useState('');
  const [formCategorySlug, setFormCategorySlug] = useState(
    categories[0]?.slug ?? 'mirzaganj'
  );
  const [formAuthorId, setFormAuthorId] = useState(authors[0]?.id ?? 'author-1');
  const [formLocationBn, setFormLocationBn] = useState('সুবিদখালী, মির্জাগঞ্জ');
  const [formVisualTheme, setFormVisualTheme] = useState<VisualTheme>('payra_river');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImageCaptionBn, setFormImageCaptionBn] = useState('');
  const [formGalleryImages, setFormGalleryImages] = useState<ArticleGalleryItem[]>([]);
  const [formStatus, setFormStatus] = useState<ArticleStatus>('published');
  const [formTagsText, setFormTagsText] = useState('মির্জাগঞ্জ-ট্রেন্ডিং, সুবিদখালী-সদর');
  const [formIsLead, setFormIsLead] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(true);
  const [formIsBreaking, setFormIsBreaking] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(true);
  const [formIsVideo, setFormIsVideo] = useState(false);
  const [formVideoDurationBn, setFormVideoDurationBn] = useState('০৪:৩০');
  const [formKeyTakeawaysText, setFormKeyTakeawaysText] = useState('');
  const [formPullQuote, setFormPullQuote] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Additional Gallery Photo Upload inputs
  const [newGalleryTitleBn, setNewGalleryTitleBn] = useState('');
  const [newGalleryLocationBn, setNewGalleryLocationBn] = useState('মির্জাগঞ্জ, পটুয়াখালী');
  const [newGalleryCaptionBn, setNewGalleryCaptionBn] = useState('');
  const [newGalleryTheme, setNewGalleryTheme] = useState<VisualTheme>('subidkhali_college');
  const [newGalleryImageUrl, setNewGalleryImageUrl] = useState('');

  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);

  // Quick Breaking News Creator State
  const [quickBreakingTitle, setQuickBreakingTitle] = useState('');
  const [quickBreakingCategory, setQuickBreakingCategory] = useState('mirzaganj');

  // New Category Form
  const [newCatNameBn, setNewCatNameBn] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDescBn, setNewCatDescBn] = useState('');

  // New Reporter Form
  const [newAuthorNameBn, setNewAuthorNameBn] = useState('');
  const [newAuthorRoleBn, setNewAuthorRoleBn] = useState('');
  const [newAuthorBeatBn, setNewAuthorBeatBn] = useState('');
  const [newAuthorLocationBn, setNewAuthorLocationBn] = useState('সুবিদখালী, মির্জাগঞ্জ');
  const [newAuthorEmail, setNewAuthorEmail] = useState('');

  // New Advertisement Form
  const [isNewAdOpen, setIsNewAdOpen] = useState(false);
  const [newAdSlotId, setNewAdSlotId] = useState<Advertisement['slotId']>('header-leaderboard');
  const [newAdTitleBn, setNewAdTitleBn] = useState('');
  const [newAdSponsorBn, setNewAdSponsorBn] = useState('');
  const [newAdDimensions, setNewAdDimensions] = useState('970 × 90 px');
  const [newAdCtaBn, setNewAdCtaBn] = useState('বিস্তারিত দেখুন');
  const [newAdBannerUrl, setNewAdBannerUrl] = useState('');

  // Site Settings Editor State
  const [portalNameBn, setPortalNameBn] = useState(settings.portalNameBn);
  const [taglineBn, setTaglineBn] = useState(settings.taglineBn);
  const [editionDateBn, setEditionDateBn] = useState(settings.editionDateBn);
  const [editorNameBn, setEditorNameBn] = useState(settings.editorNameBn);
  const [demoNoticeTextBn, setDemoNoticeTextBn] = useState(settings.demoNoticeTextBn);
  const [breakingTickerActive, setBreakingTickerActive] = useState(
    settings.breakingTickerActive
  );
  const [adminPhotoUrl, setAdminPhotoUrl] = useState(
    settings.adminPhotoUrl ||
      '/assets/aistudio/c86a50b4-d4d1-4994-b557-8e1f3319ba81_e3e38474.jfif'
  );
  const [developerNameBn, setDeveloperNameBn] = useState(
    settings.developerNameBn || 'মোঃ আঃ কাইয়ূম'
  );
  const [developerRoleBn, setDeveloperRoleBn] = useState(
    settings.developerRoleBn || 'পোর্টাল ডেভেলপার ও কারিগরি নির্মাতা'
  );
  const [developerPhotoUrl, setDeveloperPhotoUrl] = useState(
    settings.developerPhotoUrl || '/assets/aistudio/____6f31a55b.png'
  );
  const [developerFacebookUrl, setDeveloperFacebookUrl] = useState(
    settings.developerFacebookUrl || 'https://www.facebook.com/freelancerkaium143/'
  );

  const adminPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const developerPhotoInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic Menu Management State (অল মেনু কন্ট্রোল: সকল মেনু ও সাব-মেনু দেখা, কাটা ও যোগ করা)
  const menuConfig = getEffectiveMenuConfig(settings);
  const [newMainMenuLabelBn, setNewMainMenuLabelBn] = useState('');
  const [newMainMenuSlug, setNewMainMenuSlug] = useState('');
  const [newEduLabelBn, setNewEduLabelBn] = useState('');
  const [newEduSlug, setNewEduSlug] = useState('');
  const [newCollegeParentSlug, setNewCollegeParentSlug] = useState('edu-college-girls');
  const [newCollegeLabelBn, setNewCollegeLabelBn] = useState('');
  const [newCollegeSlug, setNewCollegeSlug] = useState('');
  const [newHealthLabelBn, setNewHealthLabelBn] = useState('');
  const [newHealthSlug, setNewHealthSlug] = useState('');
  const [newUnionNameBn, setNewUnionNameBn] = useState('');
  const [newUnionSlug, setNewUnionSlug] = useState('');
  const [inlineSubMenuDrafts, setInlineSubMenuDrafts] = useState<Record<string, string>>({});

  const updateNavigationMenus = (nextMenus: PortalMenuConfig, toastMsg: string) => {
    onUpdateSettings({
      ...settings,
      navigationMenus: nextMenus,
    });
    showToast(toastMsg);
  };

  const handleAdminPhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await readAndCompressImageFile(file);
      setAdminPhotoUrl(compressed);
      onUpdateSettings({
        ...settings,
        adminPhotoUrl: compressed,
      });
      showToast('অ্যাডমিনের ছবি সফলভাবে আপলোড ও সংরক্ষণ করা হয়েছে!');
    } catch {
      showToast('অ্যাডমিনের ছবি আপলোডে সমস্যা হয়েছে।');
    }
  };

  const handleDeveloperPhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await readAndCompressImageFile(file);
      setDeveloperPhotoUrl(compressed);
      onUpdateSettings({
        ...settings,
        developerPhotoUrl: compressed,
      });
      showToast('ডেভেলপারের ছবি সফলভাবে আপলোড ও সংরক্ষণ করা হয়েছে!');
    } catch {
      showToast('ডেভেলপারের ছবি আপলোডে সমস্যা হয়েছে।');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Phone + Password Login Handler
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = normalizeDigitsToAscii(loginPhone);
    const cleanPass = normalizeDigitsToAscii(loginPassword);

    if (!cleanPhone || !cleanPass) {
      setLoginError('অনুগ্রহ করে মোবাইল নাম্বার এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    const matchedAccount = adminAccounts.find(
      (acc) =>
        normalizeDigitsToAscii(acc.phone) === cleanPhone &&
        (normalizeDigitsToAscii(acc.password) === cleanPass ||
          acc.password.trim() === loginPassword.trim())
    );

    if (!matchedAccount) {
      setLoginError(
        'প্রদত্ত মোবাইল নাম্বার বা পাসওয়ার্ড সঠিক নয়! অনুগ্রহ করে নিচের তালিকা থেকে সঠিক নাম্বার ও পাসওয়ার্ড দেখুন।'
      );
      return;
    }

    const session: AdminSession = {
      ...matchedAccount,
      loggedInAtBn: '২২ অক্টোবর ২০২৬, সদ্য লগইনকৃত',
    };
    setAdminSession(session);
    setActiveSection('overview');
    try {
      localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore storage errors
    }
    setLoginError(null);
    showToast(
      `স্বাগতম, ${session.nameBn}! আপনার নির্ধারিত ${toBengaliDigits(
        session.permissions.length
      )}টি পারমিশনসহ অ্যাডমিন প্যানেলে লগইন হয়েছে।`
    );
  };

  const handleQuickProfileLogin = (account: AdminAccount) => {
    const session: AdminSession = {
      ...account,
      loggedInAtBn: '২২ অক্টোবর ২০২৬, সক্রিয় সেশন',
    };
    setAdminSession(session);
    setActiveSection('overview');
    try {
      localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
    setLoginError(null);
    showToast(
      `স্বাগতম, ${account.nameBn} (${account.roleBn}) — নির্ধারিত পারমিশন সক্রিয় করা হয়েছে!`
    );
  };

  const handleAdminLogout = () => {
    setAdminSession(null);
    try {
      localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Create or Update Admin Account with Phone, Password & Granular Permissions
  const handleToggleNewAdminPerm = (perm: AdminPermissionKey) => {
    setNewAdminPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSaveAdminAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('manage_admins')) {
      showToast('দুঃখিত, নতুন অ্যাডমিন তৈরি বা পারমিশন পরিবর্তনের অনুমতি আপনার নেই।');
      return;
    }
    const cleanPhone = normalizeDigitsToAscii(newAdminPhone);
    if (!newAdminNameBn.trim() || cleanPhone.length < 6 || !newAdminPassword.trim()) {
      showToast('অনুগ্রহ করে অ্যাডমিনের নাম, সঠিক মোবাইল নাম্বার এবং পাসওয়ার্ড দিন।');
      return;
    }
    if (newAdminPermissions.length === 0) {
      showToast('অন্তত ১টি পারমিশন নির্বাচন করুন।');
      return;
    }

    const duplicatePhone = adminAccounts.find(
      (a) =>
        normalizeDigitsToAscii(a.phone) === cleanPhone && a.id !== editingAdminId
    );
    if (duplicatePhone) {
      showToast('এই মোবাইল নাম্বার দিয়ে ইতিমধ্যে একজন অ্যাডমিন নিবন্ধিত আছেন!');
      return;
    }

    if (editingAdminId) {
      const updatedList = adminAccounts.map((acc) => {
        if (acc.id !== editingAdminId) return acc;
      return {
        ...acc,
        accountType: acc.accountType || 'admin',
        nameBn: newAdminNameBn.trim(),
        nameEn: newAdminNameBn.trim(),
        phone: cleanPhone,
        password: newAdminPassword.trim(),
        roleBn: newAdminRoleBn.trim() || 'নির্ধারিত অ্যাডমিন',
        roleBadgeEn:
          acc.accountType === 'public'
            ? 'Public'
            : newAdminPermissions.length === ALL_ADMIN_PERMISSION_KEYS.length
            ? 'Full Admin'
            : 'Custom Admin',
        avatarInitials: newAdminNameBn.trim().slice(0, 2),
        permissions: newAdminPermissions,
      };
      });
      saveAdminAccountsToStorage(updatedList);
      if (adminSession && adminSession.id === editingAdminId) {
        const refreshed = updatedList.find((a) => a.id === editingAdminId);
        if (refreshed) {
          const updatedSession: AdminSession = {
            ...refreshed,
            loggedInAtBn: adminSession.loggedInAtBn,
          };
          setAdminSession(updatedSession);
          localStorage.setItem(
            ADMIN_SESSION_STORAGE_KEY,
            JSON.stringify(updatedSession)
          );
        }
      }
      const prevAcc = adminAccounts.find((a) => a.id === editingAdminId);
      if (prevAcc && prevAcc.nameBn.trim() !== newAdminNameBn.trim()) {
        onDeleteAuthor?.(`author-${editingAdminId}`, prevAcc.nameBn.trim());
      }
      unrecordDeletedReporterName(newAdminNameBn.trim());
      onAddAuthor({
        id: `author-${editingAdminId}`,
        slug: `reporter-${editingAdminId}`,
        nameBn: newAdminNameBn.trim(),
        nameEn: newAdminNameBn.trim(),
        roleBn: newAdminRoleBn.trim() || 'নির্ধারিত অ্যাডমিন',
        beatBn: 'মির্জাগঞ্জ জনপদ ও সারাদেশ',
        bioBn: `${newAdminNameBn.trim()} নিউজ মির্জাগঞ্জ পোর্টালের অ্যাডমিন ও প্রতিবেদক।`,
        email: `admin.${cleanPhone.slice(-4)}@newsmirzaganj.example.com`,
        locationBn: 'সুবিদখালী, মির্জাগঞ্জ',
        avatarInitials: newAdminNameBn.trim().slice(0, 2),
        articlesCount: 1,
      });
      setEditingAdminId(null);
      showToast('অ্যাডমিনের নাম, ফোন নাম্বার, পাসওয়ার্ড ও পারমিশন সফলভাবে হালনাগাদ করা হয়েছে!');
    } else {
      const createdAdmin: AdminAccount = {
        id: `adm-${Date.now()}`,
        accountType: 'admin',
        nameBn: newAdminNameBn.trim(),
        nameEn: newAdminNameBn.trim(),
        phone: cleanPhone,
        password: newAdminPassword.trim(),
        handle: `@admin_${cleanPhone.slice(-4)}`,
        email: `admin.${cleanPhone.slice(-4)}@newsmirzaganj.example.com`,
        roleBn: newAdminRoleBn.trim() || 'সহকারী অ্যাডমিন',
        roleBadgeEn:
          newAdminPermissions.length === ALL_ADMIN_PERMISSION_KEYS.length
            ? 'Full Admin'
            : 'Custom Admin',
        avatarInitials: newAdminNameBn.trim().slice(0, 2),
        permissions: newAdminPermissions,
        createdAtBn: '২২ অক্টোবর ২০২৬, সদ্য নির্মিত',
      };
      saveAdminAccountsToStorage([...adminAccounts, createdAdmin]);
      unrecordDeletedReporterName(createdAdmin.nameBn);
      onAddAuthor({
        id: `author-${createdAdmin.id}`,
        slug: `reporter-${createdAdmin.id}`,
        nameBn: createdAdmin.nameBn,
        nameEn: createdAdmin.nameEn,
        roleBn: createdAdmin.roleBn,
        beatBn: 'মির্জাগঞ্জ জনপদ ও সারাদেশ',
        bioBn: `${createdAdmin.nameBn} নিউজ মির্জাগঞ্জ পোর্টালের অ্যাডমিন ও প্রতিবেদক।`,
        email: createdAdmin.email,
        locationBn: 'সুবিদখালী, মির্জাগঞ্জ',
        avatarInitials: createdAdmin.avatarInitials,
        articlesCount: 1,
      });
      showToast(
        `নতুন অ্যাডমিন "${createdAdmin.nameBn}" (নাম, ফোন: ${createdAdmin.phone} ও পাসওয়ার্ডসহ) সফলভাবে তৈরি হয়েছে!`
      );
    }

    setNewAdminNameBn('');
    setNewAdminPhone('');
    setNewAdminPassword('');
    setNewAdminRoleBn('সহকারী অ্যাডমিন ও প্রতিবেদক');
    setNewAdminPermissions(['compose_news', 'manage_articles']);
  };

  // Create Public Account (পাবলিকের জন্য শুধু নাম্বার ও পাসওয়ার্ড)
  const handleSavePublicAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = normalizeDigitsToAscii(newPublicPhone);
    if (cleanPhone.length < 6 || !newPublicPassword.trim()) {
      showToast('পাবলিক অ্যাকাউন্টের জন্য সঠিক মোবাইল নাম্বার এবং পাসওয়ার্ড দিন।');
      return;
    }
    const duplicatePhone = adminAccounts.find(
      (a) => normalizeDigitsToAscii(a.phone) === cleanPhone
    );
    if (duplicatePhone) {
      showToast('এই মোবাইল নাম্বার দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট নিবন্ধিত আছে!');
      return;
    }
    const createdPublic: AdminAccount = {
      id: `pub-${Date.now()}`,
      accountType: 'public',
      nameBn: `পাবলিক ইউজার (${cleanPhone})`,
      nameEn: `Public User (${cleanPhone})`,
      phone: cleanPhone,
      password: newPublicPassword.trim(),
      handle: `@public_${cleanPhone.slice(-4)}`,
      email: `public.${cleanPhone.slice(-4)}@newsmirzaganj.example.com`,
      roleBn: 'পাবলিক অ্যাকাউন্ট (নাম্বার ও পাসওয়ার্ড)',
      roleBadgeEn: 'Public',
      avatarInitials: 'পাব',
      permissions: ['compose_news'],
      createdAtBn: '২২ অক্টোবর ২০২৬, সদ্য নিবন্ধিত পাবলিক',
    };
    saveAdminAccountsToStorage([...adminAccounts, createdPublic]);
    setNewPublicPhone('');
    setNewPublicPassword('');
    showToast(
      `নতুন পাবলিক অ্যাকাউন্ট (নাম্বার: ${createdPublic.phone} ও পাসওয়ার্ড) সফলভাবে যোগ করা হয়েছে!`
    );
  };

  const handleStartEditAdminAccount = (acc: AdminAccount) => {
    setEditingAdminId(acc.id);
    setCreatorAccountType(acc.accountType === 'public' ? 'public' : 'admin');
    setNewAdminNameBn(acc.nameBn);
    setNewAdminPhone(acc.phone);
    setNewAdminPassword(acc.password);
    setNewAdminRoleBn(acc.roleBn);
    setNewAdminPermissions([...acc.permissions]);
  };

  const handleDeleteAdminAccount = (adminId: string) => {
    const target = adminAccounts.find((a) => a.id === adminId);
    if (!target || target.isSuperAdmin) {
      showToast('সুপার অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা যাবে না।');
      return;
    }
    const remaining = adminAccounts.filter((a) => a.id !== adminId);
    saveAdminAccountsToStorage(remaining);
    // Also delete matching reporter/author profile so the name never stays in Reporter select
    const cleanName = target.nameBn.trim();
    recordDeletedReporterName(cleanName);
    const matchingAuthor = authors.find(
      (au) => au.nameBn.trim() === cleanName || au.id === `author-${adminId}`
    );
    onDeleteAuthor?.(matchingAuthor ? matchingAuthor.id : `author-${adminId}`, cleanName);
    if (matchingAuthor && formAuthorId === matchingAuthor.id) {
      const fallback = effectiveAuthors.find(
        (au) => au.id !== matchingAuthor.id && au.nameBn.trim() !== cleanName
      );
      setFormAuthorId(fallback?.id ?? 'author-1');
    }
    showToast(`"${target.nameBn}" অ্যাকাউন্ট ও প্রতিবেদক নাম স্থায়ীভাবে মুছে ফেলা হয়েছে।`);
  };

  const handleDeleteReporterProfile = (authorId: string, authorNameBn: string) => {
    const cleanName = authorNameBn.trim();
    const superAdminName = DEFAULT_ADMIN_ACCOUNTS.find((a) => a.isSuperAdmin)?.nameBn.trim();
    if (
      effectiveAuthors.length <= 1 ||
      (authorId === 'author-1' && cleanName === superAdminName)
    ) {
      showToast('প্রধান সম্পাদক/সুপার অ্যাডমিনের নাম মুছে ফেলা যাবে না।');
      return;
    }
    recordDeletedReporterName(cleanName);
    onDeleteAuthor?.(authorId, cleanName);

    // Also remove from adminAccounts if an admin account has this same name
    const matchingAdmin = adminAccounts.find(
      (a) => !a.isSuperAdmin && (a.nameBn.trim() === cleanName || `author-${a.id}` === authorId)
    );
    if (matchingAdmin) {
      const remainingAdmins = adminAccounts.filter((a) => a.id !== matchingAdmin.id);
      saveAdminAccountsToStorage(remainingAdmins);
    }

    if (formAuthorId === authorId) {
      const fallback = effectiveAuthors.find(
        (au) => au.id !== authorId && au.nameBn.trim() !== cleanName
      );
      setFormAuthorId(fallback?.id ?? 'author-1');
    }
    showToast(`"${cleanName}" নামটি অ্যাডমিন ও প্রতিবেদক তালিকা থেকে স্থায়ীভাবে মুছে ফেলা হয়েছে।`);
  };

  const openNewArticleComposer = () => {
    setEditingArticleId(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormSummary('');
    setFormContentText('');
    setFormCategorySlug(categories[0]?.slug ?? 'mirzaganj');
    setFormAuthorId(authors[0]?.id ?? 'author-1');
    setFormLocationBn('সুবিদখালী, মির্জাগঞ্জ');
    setFormVisualTheme('payra_river');
    setFormImageUrl('');
    setFormImageCaptionBn('');
    setFormGalleryImages([]);
    setFormStatus('published');
    setFormTagsText('মির্জাগঞ্জ-ট্রেন্ডিং, সুবিদখালী-সদর');
    setFormIsLead(false);
    setFormIsFeatured(true);
    setFormIsBreaking(true);
    setFormIsTrending(true);
    setFormIsVideo(false);
    setFormVideoDurationBn('০৪:৩০');
    setFormKeyTakeawaysText('');
    setFormPullQuote('');
    setFormErrors([]);
    setActiveSection('compose');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEditArticleComposer = (art: Article) => {
    setEditingArticleId(art.id);
    setFormTitle(art.title);
    setFormSubtitle(art.subtitle);
    setFormSummary(art.summary);
    setFormContentText(art.content.join('\n\n'));
    setFormCategorySlug(art.categorySlug);
    setFormAuthorId(art.authorId);
    setFormLocationBn(art.locationBn);
    setFormVisualTheme(art.visualTheme);
    setFormImageUrl(art.imageUrl ?? '');
    setFormImageCaptionBn(art.imageCaptionBn ?? '');
    setFormGalleryImages(art.galleryImages ?? []);
    setFormStatus(art.status);
    setFormTagsText(art.tags.join(', '));
    setFormIsLead(art.isLeadStory);
    setFormIsFeatured(art.isFeatured);
    setFormIsBreaking(art.isBreaking);
    setFormIsTrending(Boolean(art.isTrending));
    setFormIsVideo(art.isVideo);
    setFormVideoDurationBn(art.videoDurationBn ?? '০৪:৩০');
    setFormKeyTakeawaysText(art.keyTakeaways.join('\n'));
    setFormPullQuote(art.pullQuote?.quote ?? '');
    setFormErrors([]);
    setActiveSection('compose');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const compressedDataUrl = await readAndCompressImageFile(file);
      setFormImageUrl(compressedDataUrl);
      if (!formImageCaptionBn.trim()) {
        setFormImageCaptionBn(`আপলোডকৃত আলোকচিত্র: ${file.name.replace(/\.[^/.]+$/, '')} (মির্জাগঞ্জ ফটো ডেস্ক)`);
      }
      showToast('সংবাদের মূল ছবি সফলভাবে আপলোড ও অপ্টিমাইজ করা হয়েছে!');
    } catch {
      showToast('ছবি আপলোডে ত্রুটি হয়েছে। অন্য ফাইল চেষ্টা করুন।');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await readAndCompressImageFile(file);
      setNewGalleryImageUrl(compressedDataUrl);
      if (!newGalleryTitleBn.trim()) {
        setNewGalleryTitleBn(file.name.replace(/\.[^/.]+$/, ''));
      }
      showToast('গ্যালারির ছবি প্রস্তুত হয়েছে। এখন “গ্যালারিতে যুক্ত করুন” বাটনে ক্লিক করুন।');
    } catch {
      showToast('গ্যালারি ছবি আপলোডে সমস্যা হয়েছে।');
    }
  };

  const handleAddGalleryItemToDraft = () => {
    const title = newGalleryTitleBn.trim() || 'মির্জাগঞ্জ বিশেষ আলোকচিত্র';
    const caption =
      newGalleryCaptionBn.trim() ||
      `${title} — ${newGalleryLocationBn.trim()} (নিউজ মির্জাগঞ্জ ফটো গ্যালারি)`;
    const item: ArticleGalleryItem = {
      theme: newGalleryTheme,
      imageUrl: newGalleryImageUrl.trim() || undefined,
      titleBn: title,
      captionBn: caption,
      locationBn: newGalleryLocationBn.trim() || 'মির্জাগঞ্জ',
    };
    setFormGalleryImages((prev) => [...prev, item]);
    setNewGalleryTitleBn('');
    setNewGalleryCaptionBn('');
    setNewGalleryImageUrl('');
    showToast('ছবিটি সংবাদের ফটো গ্যালারিতে যুক্ত হয়েছে!');
  };

  const handleRemoveGalleryItemFromDraft = (index: number) => {
    setFormGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateArticleDraft({
      title: formTitle,
      summary: formSummary,
      categorySlug: formCategorySlug,
      authorId: formAuthorId,
      contentText: formContentText,
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    const categoryObj = categories.find((c) => c.slug === formCategorySlug);
    const resolvedMeta = resolveCategoryMeta(formCategorySlug, categories);
    const resolvedCategoryNameBn = categoryObj
      ? categoryObj.nameBn
      : resolvedMeta.titleBn;

    const paragraphs = formContentText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const takeaways = formKeyTakeawaysText
      .split(/\n+/)
      .map((k) => k.trim())
      .filter(Boolean);
    const tags = formTagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const existing = editingArticleId
      ? articles.find((a) => a.id === editingArticleId)
      : undefined;

    const newArticle: Article = {
      id: existing ? existing.id : `art-${Date.now()}`,
      slug: existing ? existing.slug : generateArticleSlug(formTitle),
      title: formTitle.trim(),
      subtitle:
        formSubtitle.trim() ||
        `${formLocationBn} থেকে পাঠানো ছবিসহ বিশেষ প্রতিবেদন`,
      summary: formSummary.trim(),
      content: paragraphs,
      pullQuote: formPullQuote.trim()
        ? {
            quote: formPullQuote.trim(),
            attribution: `${adminSession?.nameBn ?? 'বার্তা কক্ষ ডেস্ক'}, নিউজ মির্জাগঞ্জ`,
          }
        : existing?.pullQuote,
      keyTakeaways:
        takeaways.length > 0
          ? takeaways
          : [
              'নিউজ মির্জাগঞ্জ অ্যাডমিন প্যানেল থেকে সংযোজিত ছবিসহ প্রতিবেদন',
              `স্থান: ${formLocationBn.trim()}`,
            ],
      categorySlug: formCategorySlug,
      categoryNameBn: resolvedCategoryNameBn,
      tags: tags.length > 0 ? tags : ['মির্জাগঞ্জ-ট্রেন্ডিং'],
      authorId: formAuthorId,
      publishedAtIso: existing ? existing.publishedAtIso : new Date().toISOString(),
      publishedAtBn: existing
        ? existing.publishedAtBn
        : '২২ অক্টোবর ২০২৬, সদ্য প্রকাশিত',
      updatedAtBn: '২২ অক্টোবর ২০২৬, সদ্য হালনাগাদ',
      locationBn: formLocationBn.trim() || 'মির্জাগঞ্জ, পটুয়াখালী',
      readingTimeMinutes: estimateReadingTimeMinutes(paragraphs),
      viewCount: existing ? existing.viewCount : 1540,
      isFeatured: formIsFeatured,
      isLeadStory: formIsLead,
      isBreaking: formIsBreaking,
      isTrending: formIsTrending,
      isVideo: formIsVideo,
      videoDurationBn: formIsVideo ? formVideoDurationBn : undefined,
      isDemoContent: true,
      demoDisclaimerBn:
        'সতর্কীকরণ: এটি নিউজ মির্জাগঞ্জ (News Mirzaganj) পোর্টালের অ্যাডমিন প্যানেল থেকে তৈরি বা সম্পাদিত একটি কাল্পনিক নমুনা (ডেমো) প্রতিবেদন।',
      status: formStatus,
      visualTheme: formVisualTheme,
      imageUrl: formImageUrl.trim() || undefined,
      imageCaptionBn:
        formImageCaptionBn.trim() ||
        `আলোকচিত্র: ${formTitle.trim()} — ${formLocationBn.trim()} (ডেমো চিত্র)।`,
      galleryImages: formGalleryImages.length > 0 ? formGalleryImages : undefined,
      seoMeta: {
        metaTitle: `[ডেমো] ${formTitle.trim()} | নিউজ মির্জাগঞ্জ`,
        metaDescription: formSummary.trim(),
        canonicalUrl: `https://newsmirzaganj.example.com/?article=${
          existing ? existing.slug : generateArticleSlug(formTitle)
        }`,
        ogImageAlt: formTitle.trim(),
        keywords: tags.length > 0 ? tags : ['মির্জাগঞ্জ', 'সুবিদখালী', 'পায়রা'],
      },
    };

    onSaveArticle(newArticle, !existing);
    setActiveSection('articles');
    showToast(
      existing
        ? 'সংবাদ ও ছবি সফলভাবে সম্পাদনা ও সংরক্ষণ করা হয়েছে!'
        : formStatus === 'published'
        ? 'নতুন ছবিসহ সংবাদটি সফলভাবে প্রকাশিত হয়েছে!'
        : 'সংবাদটি খসড়া/শিডিউল তালিকায় সংরক্ষিত হয়েছে!'
    );
  };

  const handleQuickBreakingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickBreakingTitle.trim().length < 8) return;
    const catObj =
      categories.find((c) => c.slug === quickBreakingCategory) ?? categories[0];
    const newBreakingArt: Article = {
      id: `art-brk-${Date.now()}`,
      slug: generateArticleSlug(quickBreakingTitle),
      title: quickBreakingTitle.trim(),
      subtitle: 'অ্যাডমিন প্যানেল থেকে যুক্ত সদ্যপ্রাপ্ত ও ট্রেন্ডিং ব্রেকিং সংবাদ',
      summary: `${quickBreakingTitle.trim()} — মির্জাগঞ্জ ও সুবিদখালী ডেস্ক থেকে সদ্যপ্রাপ্ত সংবাদের বিস্তারিত আপডেট।`,
      content: [
        `${quickBreakingTitle.trim()}। এটি অ্যাডমিন ড্যাশবোর্ডের ব্রেকিং ও ট্রেন্ডিং টিকার প্যানেল থেকে তাৎক্ষণিক যুক্ত করা একটি ডেমো প্রতিবেদন।`,
      ],
      keyTakeaways: ['সদ্যপ্রাপ্ত ব্রেকিং ও ট্রেন্ডিং সংবাদ আপডেট'],
      categorySlug: quickBreakingCategory,
      categoryNameBn: catObj ? catObj.nameBn : 'মির্জাগঞ্জ ও সুবিদখালী',
      tags: ['মির্জাগঞ্জ-ট্রেন্ডিং', 'ব্রেকিং'],
      authorId: authors[0]?.id ?? 'author-1',
      publishedAtIso: new Date().toISOString(),
      publishedAtBn: '২২ অক্টোবর ২০২৬, এইমাত্র প্রাপ্ত',
      updatedAtBn: '২২ অক্টোবর ২০২৬, এইমাত্র প্রাপ্ত',
      locationBn: 'সুবিদখালী, মির্জাগঞ্জ',
      readingTimeMinutes: 2,
      viewCount: 1850,
      isFeatured: true,
      isLeadStory: false,
      isBreaking: true,
      isTrending: true,
      isVideo: false,
      isDemoContent: true,
      demoDisclaimerBn:
        'সতর্কীকরণ: এটি নিউজ মির্জাগঞ্জ অ্যাডমিন প্যানেল থেকে যুক্ত করা একটি কাল্পনিক ডেমো ব্রেকিং সংবাদ।',
      status: 'published',
      visualTheme: 'payra_river',
      imageCaptionBn: 'সদ্যপ্রাপ্ত ব্রেকিং সংবাদের ভিজ্যুয়াল অলংকরণ (ডেমো)।',
      seoMeta: {
        metaTitle: `[ব্রেকিং ডেমো] ${quickBreakingTitle.trim()} | নিউজ মির্জাগঞ্জ`,
        metaDescription: quickBreakingTitle.trim(),
        canonicalUrl: 'https://newsmirzaganj.example.com/',
        ogImageAlt: quickBreakingTitle.trim(),
        keywords: ['ব্রেকিং', 'মির্জাগঞ্জ'],
      },
    };
    onSaveArticle(newBreakingArt, true);
    setQuickBreakingTitle('');
    showToast('নতুন ব্রেকিং নিউজ টিকারে ও পোর্টালে যুক্ত হয়েছে!');
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameBn.trim() || !newCatSlug.trim()) return;
    onAddCategory({
      id: `cat-${Date.now()}`,
      slug: newCatSlug.trim().toLowerCase().replace(/\s+/g, '-'),
      nameBn: newCatNameBn.trim(),
      nameEn: newCatNameEn.trim() || newCatSlug.trim(),
      descriptionBn:
        newCatDescBn.trim() || `${newCatNameBn.trim()} বিভাগের ছবিসহ সংবাদ ও বিশ্লেষণ (ডেমো)।`,
      order: categories.length + 1,
      featuredInNav: true,
    });
    setNewCatNameBn('');
    setNewCatNameEn('');
    setNewCatSlug('');
    setNewCatDescBn('');
    showToast('নতুন সংবাদ বিভাগ সফলভাবে যুক্ত হয়েছে!');
  };

  const handleAddAuthorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorNameBn.trim() || !newAuthorRoleBn.trim()) return;
    unrecordDeletedReporterName(newAuthorNameBn.trim());
    onAddAuthor({
      id: `author-${Date.now()}`,
      slug: `reporter-${Date.now().toString(36)}`,
      nameBn: newAuthorNameBn.trim(),
      nameEn: newAuthorNameBn.trim(),
      roleBn: newAuthorRoleBn.trim(),
      beatBn: newAuthorBeatBn.trim() || 'মির্জাগঞ্জ জনপদ ও সারাদেশ',
      bioBn: `${newAuthorNameBn.trim()} নিউজ মির্জাগঞ্জ পোর্টালের একজন ডেমো প্রতিবেদক প্রোফাইল।`,
      email: newAuthorEmail.trim() || 'reporter@newsmirzaganj.example.com',
      locationBn: newAuthorLocationBn.trim() || 'সুবিদখালী, মির্জাগঞ্জ',
      avatarInitials: newAuthorNameBn.trim().slice(0, 2),
      articlesCount: 1,
    });
    setNewAuthorNameBn('');
    setNewAuthorRoleBn('');
    setNewAuthorBeatBn('');
    setNewAuthorEmail('');
    showToast('নতুন প্রতিবেদক প্রোফাইল যুক্ত হয়েছে!');
  };

  const handleCreateAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitleBn.trim() || !onAddAd) return;
    const formatLabels: Record<Advertisement['slotId'], string> = {
      'header-leaderboard': 'লিডারবোর্ড ব্যানার',
      'sidebar-rectangle': 'মিডিয়াম রেকট্যাঙ্গেল',
      'mid-page-banner': 'ইন-ফিড রেসপনসিভ ব্যানার',
      'article-inline': 'আর্টিকেল ইনলাইন ব্যানার',
    };
    const created: Advertisement = {
      id: `ad-${Date.now()}`,
      slotId: newAdSlotId,
      titleBn: newAdTitleBn.trim(),
      sponsorNameBn: newAdSponsorBn.trim() || 'নিউজ মির্জাগঞ্জ স্পনসর (ডেমো)',
      formatLabel: formatLabels[newAdSlotId],
      dimensions: newAdDimensions.trim() || '728 × 90 px',
      ctaLabelBn: newAdCtaBn.trim() || 'বিস্তারিত দেখুন',
      targetUrl: '#advertising-info',
      bannerImageUrl: newAdBannerUrl.trim() || undefined,
      isActive: true,
      isDemoPlaceholder: true,
    };
    onAddAd(created);
    setNewAdTitleBn('');
    setNewAdSponsorBn('');
    setNewAdBannerUrl('');
    setIsNewAdOpen(false);
    showToast('নতুন বিজ্ঞাপন স্লট সফলভাবে তৈরি ও সক্রিয় করা হয়েছে!');
  };

  const handleAdBannerUpload = async (
    ad: Advertisement,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await readAndCompressImageFile(file);
      onUpdateAd({
        ...ad,
        bannerImageUrl: compressed,
      });
      showToast(`"${ad.titleBn.slice(0, 25)}..." বিজ্ঞাপনে নতুন ব্যানার ছবি আপলোড হয়েছে!`);
    } catch {
      showToast('বিজ্ঞাপনের ব্যানার আপলোডে ত্রুটি হয়েছে।');
    }
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      portalNameBn: portalNameBn.trim() || 'নিউজ মির্জাগঞ্জ',
      taglineBn: taglineBn.trim(),
      editionDateBn: editionDateBn.trim(),
      editorNameBn: editorNameBn.trim(),
      demoNoticeTextBn: demoNoticeTextBn.trim(),
      breakingTickerActive,
      adminPhotoUrl:
        adminPhotoUrl.trim() ||
        '/assets/aistudio/c86a50b4-d4d1-4994-b557-8e1f3319ba81_e3e38474.jfif',
      developerNameBn: developerNameBn.trim() || 'মোঃ আঃ কাইয়ূম',
      developerRoleBn:
        developerRoleBn.trim() || 'পোর্টাল ডেভেলপার ও কারিগরি নির্মাতা',
      developerPhotoUrl:
        developerPhotoUrl.trim() || '/assets/aistudio/____6f31a55b.png',
      developerFacebookUrl:
        developerFacebookUrl.trim() ||
        'https://www.facebook.com/freelancerkaium143/',
    });
    showToast('পোর্টাল সেটিংস, ডেভেলপার ও অ্যাডমিনের ছবি এবং ফেসবুক লিঙ্ক সংরক্ষিত হয়েছে!');
  };

  // Filtered articles for table / overview
  const filteredArticles = articles.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (adminSearch.trim()) {
      const q = adminSearch.trim().toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.categoryNameBn.toLowerCase().includes(q) ||
        a.locationBn.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const sortedOverviewArticles = [...filteredArticles].sort((a, b) =>
    overviewSort === 'popular'
      ? b.viewCount - a.viewCount
      : b.publishedAtIso.localeCompare(a.publishedAtIso)
  );

  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const scheduledCount = articles.filter((a) => a.status === 'scheduled').length;
  const unreadMessagesCount = contactMessages.filter(
    (m) => m.status === 'unread'
  ).length;
  const totalViewsCount = articles.reduce((sum, a) => sum + a.viewCount, 0);
  const activeAdsCount = advertisements.filter((a) => a.isActive).length;

  const authorsMap = Object.fromEntries(authors.map((au) => [au.id, au]));

  // ============================================================================
  // 1. PUBLIC & ADMIN LOGIN PORTAL VIEW (লিংকে ঢুকলে দেখাবে পাবলিক | অ্যাডমিন)
  // ============================================================================
  if (!adminSession) {
    const publicAccounts = adminAccounts.filter((a) => a.accountType === 'public');
    const onlyAdminAccounts = adminAccounts.filter((a) => a.accountType !== 'public');

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
        <div className="max-w-5xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Left 7 Cols: Public | Admin Selector & Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <NewsMirzaganjLogo size="sm" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {settings.portalNameBn} · পাবলিক ও অ্যাডমিন পোর্টাল
                  </h1>
                  <p className="text-xs text-slate-500">
                    লিংকে প্রবেশ করে পাবলিক অথবা অ্যাডমিন নির্বাচন করে লগইন করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onBackToPortal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>মূল পোর্টালে ফিরুন</span>
              </button>
            </div>

            {/* PROMINENT PUBLIC | ADMIN TABS (লিংকে ঢুকলে দেখাবে পাবলিক | অ্যাডমিন) */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">
                অ্যাকাউন্টের ধরন নির্বাচন করুন (পাবলিক / অ্যাডমিন):
              </div>
              <div
                role="tablist"
                aria-label="পাবলিক ও অ্যাডমিন লগইন ট্যাব"
                className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-xl border border-slate-200"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={loginTab === 'public'}
                  onClick={() => {
                    setLoginTab('public');
                    const pubAcc = publicAccounts[0];
                    if (pubAcc) {
                      setLoginPhone(pubAcc.phone);
                      setLoginPassword(pubAcc.password);
                    }
                    setLoginError(null);
                  }}
                  className={`py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    loginTab === 'public'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>পাবলিক (Public)</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={loginTab === 'admin'}
                  onClick={() => {
                    setLoginTab('admin');
                    const admAcc = onlyAdminAccounts[0];
                    if (admAcc) {
                      setLoginAdminName(admAcc.nameBn);
                      setLoginPhone(admAcc.phone);
                      setLoginPassword(admAcc.password);
                    }
                    setLoginError(null);
                  }}
                  className={`py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    loginTab === 'admin'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>অ্যাডমিন (Admin)</span>
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              {loginTab === 'public' ? (
                <>
                  {/* PUBLIC LOGIN: ONLY NUMBER & PASSWORD (পাবলিকের জন্য নাম্বার ও পাসওয়ার্ড) */}
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950">
                        নিবন্ধিত পাবলিক অ্যাকাউন্ট (নাম্বার ও পাসওয়ার্ড):
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700">
                        ক্লিক করলে অটো বসে যাবে
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {publicAccounts.map((acc) => {
                        const isSelected =
                          normalizeDigitsToAscii(loginPhone) ===
                          normalizeDigitsToAscii(acc.phone);
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => {
                              setLoginPhone(acc.phone);
                              setLoginPassword(acc.password);
                              setLoginError(null);
                            }}
                            className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-emerald-600 bg-white ring-1 ring-emerald-600'
                                : 'border-emerald-200/80 bg-white/80 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                পাবলিক ইউজার
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                                পাবলিক
                              </span>
                            </div>
                            <p className="text-xs font-mono text-slate-800 mt-1">
                              📱 নাম্বার: <strong>{acc.phone}</strong> · 🔑 পাসওয়ার্ড: <strong>{acc.password}</strong>
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="public-login-phone"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        পাবলিক মোবাইল নাম্বার (Number) *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="public-login-phone"
                          type="text"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          placeholder="01600000000"
                          className="w-full pl-9 pr-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="public-login-password"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        পাসওয়ার্ড (Password) *
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="public-login-password"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="123456"
                          className="w-full pl-9 pr-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* ADMIN LOGIN: NAME, PHONE & PASSWORD (অ্যাডমিনের জন্য নাম, ফোন ও পাসওয়ার্ড) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      নিবন্ধিত অ্যাডমিন অ্যাকাউন্টসমূহ (ক্লিক করলে নাম, ফোন ও পাসওয়ার্ড বসে যাবে):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {onlyAdminAccounts.map((acc) => {
                        const isSelected =
                          normalizeDigitsToAscii(loginPhone) ===
                          normalizeDigitsToAscii(acc.phone);
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => {
                              setLoginAdminName(acc.nameBn);
                              setLoginPhone(acc.phone);
                              setLoginPassword(acc.password);
                              setLoginError(null);
                            }}
                            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {acc.nameBn}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0">
                                অ্যাডমিন
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-slate-700 mt-1">
                              📱 {acc.phone}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                              {acc.roleBn}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="admin-login-name"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        অ্যাডমিনের নাম (Name) *
                      </label>
                      <input
                        id="admin-login-name"
                        type="text"
                        value={loginAdminName}
                        onChange={(e) => setLoginAdminName(e.target.value)}
                        placeholder="মোঃ আঃ কাইয়ূম"
                        className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="admin-login-phone"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        ফোন নাম্বার (Phone) *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="admin-login-phone"
                          type="text"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          placeholder="01700000000"
                          className="w-full pl-9 pr-3 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="admin-login-password"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        পাসওয়ার্ড (Password) *
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="admin-login-password"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="123456"
                          className="w-full pl-9 pr-3 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-lg transition-colors shadow-sm cursor-pointer ${
                    loginTab === 'public'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {loginTab === 'public'
                      ? 'পাবলিক লগইন করুন (নাম্বার ও পাসওয়ার্ড)'
                      : 'অ্যাডমিন লগইন করুন (নাম, ফোন ও পাসওয়ার্ড)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickProfileLogin(adminAccounts[0])}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>সুপার অ্যাডমিন (মোঃ আঃ কাইয়ূম) ১-ক্লিক প্রবেশ</span>
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <span>
                পাবলিক: <strong>01600000000</strong> · অ্যাডমিন: <strong>01700000000</strong> · পাসওয়ার্ড: <strong>123456</strong>
              </span>
              <span className="font-medium text-blue-700">
                ডেভেলপার: মোঃ আঃ কাইয়ূম
              </span>
            </div>
          </div>

          {/* Right 5 Cols: Public vs Admin Overview */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white p-6 sm:p-10 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>পাবলিক ও অ্যাডমিন অ্যাক্সেস সিস্টেম</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold leading-snug">
                লিংকে ঢুকলে পাবলিক ও অ্যাডমিন দুই অপশনই দেখতে পাবেন
              </h2>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">পাবলিক (Public):</strong> পাবলিকের জন্য শুধু মোবাইল নাম্বার ও পাসওয়ার্ড দিয়ে লগইন এবং সংবাদ/তথ্য পাঠানোর সুবিধা।
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">অ্যাডমিন (Admin):</strong> অ্যাডমিনের জন্য নাম, ফোন নাম্বার ও পাসওয়ার্ড এবং নির্ধারিত পারমিশন অনুযায়ী কন্ট্রোল।
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Filter className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">মেনু ও সাব-মেনু কন্ট্রোল:</strong> ড্যাশবোর্ডের “মেনু” অপশন থেকে সকল মেনু ও সাব-মেনু দেখা, কাটা এবং নতুন সাব-মেনু যোগ করা যাবে।
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>নিউজ মির্জাগঞ্জ · মির্জাগঞ্জ, পটুয়াখালী</span>
              <span className="text-amber-400 font-bold">ডেভেলপার: মোঃ আঃ কাইয়ূম</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 2. LOGGED-IN SAAS CMS DASHBOARD (Matching Reference UI Layout)
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#f3f5f9] text-slate-900 flex flex-col">
      {/* Top SaaS CMS Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className="flex items-center gap-2.5 text-left group shrink-0"
            >
              <NewsMirzaganjLogo size="sm" />
              <div>
                <div className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-none">
                  {settings.portalNameBn}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  পাবলিক · অ্যাডমিন ড্যাশবোর্ড
                </div>
              </div>
            </button>

            {/* Logged-in Admin/Public Profile Pill */}
            <div className="hidden md:flex items-center gap-2.5 pl-6 border-l border-slate-200">
              <div className="relative">
                {adminSession.isSuperAdmin || adminSession.avatarUrl ? (
                  <img
                    src={
                      adminSession.isSuperAdmin
                        ? settings.adminPhotoUrl ||
                          adminSession.avatarUrl ||
                          '/assets/aistudio/c86a50b4-d4d1-4994-b557-8e1f3319ba81_e3e38474.jfif'
                        : adminSession.avatarUrl
                    }
                    alt={adminSession.nameBn}
                    className="w-9 h-9 rounded-full object-cover border-2 border-blue-600"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    {adminSession.avatarInitials}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{adminSession.nameBn}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      adminSession.accountType === 'public'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {adminSession.accountType === 'public' ? 'পাবলিক (Public)' : 'অ্যাডমিন (Admin)'}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] flex items-center gap-2">
                  <span>📱 {adminSession.phone}</span>
                  <span>·</span>
                  <span className="text-emerald-700 font-semibold">
                    {toBengaliDigits(adminSession.permissions.length)}টি পারমিশন সক্রিয়
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Public | Admin Link Switcher Pill + Search */}
          <div className="flex items-center gap-3 flex-1 max-w-xl justify-center">
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setLoginTab('public');
                  handleAdminLogout();
                }}
                className="px-2.5 py-1 text-[11px] font-bold rounded-md text-emerald-800 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                title="পাবলিক লগইন ভিউ দেখুন"
              >
                পাবলিক লগইন
              </button>
              <span className="text-slate-300 text-xs px-0.5">|</span>
              <button
                type="button"
                onClick={() => {
                  setLoginTab('admin');
                  handleAdminLogout();
                }}
                className="px-2.5 py-1 text-[11px] font-bold rounded-md text-blue-800 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                title="অ্যাডমিন লগইন ভিউ দেখুন"
              >
                অ্যাডমিন লগইন
              </button>
            </div>

            <div className="flex-1 hidden lg:block">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={adminSearch}
                  onChange={(e) => {
                    setAdminSearch(e.target.value);
                    if (activeSection !== 'overview' && activeSection !== 'articles') {
                      setActiveSection('articles');
                    }
                  }}
                  placeholder="সংবাদ, সুবিদখালী, পায়রা, কলেজ বা প্রতিবেদক খুঁজুন..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
                />
                {adminSearch && (
                  <button
                    type="button"
                    onClick={() => setAdminSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Action Buttons, Notifications, View Live Portal & Logout */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={openNewArticleComposer}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>সংবাদ লিখুন ও ছবি আপলোড</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('inbox')}
              aria-label="পাঠক বার্তা ইনবক্স"
              className="relative p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {toBengaliDigits(unreadMessagesCount)}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onBackToPortal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">মূল পোর্টালে ফিরুন</span>
            </button>

            <button
              type="button"
              onClick={handleAdminLogout}
              title="পাবলিক / অ্যাডমিন লগইন পেজে যান"
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="bg-emerald-900 text-white px-4 py-2.5 text-xs font-medium shadow-md">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-emerald-200 hover:text-white"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Main Two-Column SaaS CMS Layout: Left Sidebar + Right Workspace */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Sidebar (Selected Focus Element: <aside>) */}
        <aside className="lg:col-span-3 xl:col-span-2 bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between lg:sticky lg:top-22 space-y-4 shadow-xs">
          {/* Top Public | Admin Quick Switcher inside Sidebar */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>লিংক মোড: পাবলিক | অ্যাডমিন</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('admin-roles');
                  setCreatorAccountType('public');
                }}
                className={`py-1.5 px-2 rounded text-[11px] font-bold text-center transition-colors cursor-pointer ${
                  activeSection === 'admin-roles' && creatorAccountType === 'public'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-200 text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                পাবলিক
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveSection('admin-roles');
                  setCreatorAccountType('admin');
                }}
                className={`py-1.5 px-2 rounded text-[11px] font-bold text-center transition-colors cursor-pointer ${
                  activeSection === 'admin-roles' && creatorAccountType === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-blue-800 hover:bg-blue-50'
                }`}
              >
                অ্যাডমিন
              </button>
            </div>
          </div>

          <nav aria-label="অ্যাডমিন মেনু" className="space-y-1">
            {[
              {
                id: 'overview' as const,
                label: 'ওভারভিউ (Overview)',
                icon: LayoutGrid,
                perm: null as AdminPermissionKey | null,
              },
              {
                id: 'categories-tags' as const,
                label: 'মেনু (সকল মেনু ও সাব-মেনু)',
                icon: Filter,
                badge: toBengaliDigits(
                  menuConfig.mainNavItems.length +
                    menuConfig.unionItems.length +
                    menuConfig.educationItems.length +
                    menuConfig.healthItems.length
                ),
                perm: 'manage_categories' as AdminPermissionKey,
              },
              {
                id: 'admin-roles' as const,
                label: 'অ্যাডমিন (অ্যাডমিন ও পাবলিক)',
                icon: Users,
                badge: toBengaliDigits(adminAccounts.length),
                perm: 'manage_admins' as AdminPermissionKey,
              },
              {
                id: 'compose' as const,
                label: 'সংবাদ লেখা ও ছবি আপলোড',
                icon: Upload,
                perm: 'compose_news' as AdminPermissionKey,
              },
              {
                id: 'articles' as const,
                label: 'সংবাদ ব্যবস্থাপনা (CRUD)',
                icon: FileText,
                badge: toBengaliDigits(articles.length),
                perm: 'manage_articles' as AdminPermissionKey,
              },
              {
                id: 'ads' as const,
                label: 'বিজ্ঞাপন নিয়ন্ত্রণ (Ads)',
                icon: Megaphone,
                badge: toBengaliDigits(advertisements.length),
                perm: 'manage_ads' as AdminPermissionKey,
              },
              {
                id: 'highlights' as const,
                label: 'ব্রেকিং ও হাইলাইট (Breakings)',
                icon: Zap,
                perm: 'manage_breaking' as AdminPermissionKey,
              },
              {
                id: 'area-performance' as const,
                label: 'ইউনিয়ন পারফরম্যান্স',
                icon: MapPin,
                perm: null as AdminPermissionKey | null,
              },
              {
                id: 'inbox' as const,
                label: 'পাঠক বার্তা ও মন্তব্য',
                icon: Inbox,
                badge:
                  unreadMessagesCount > 0
                    ? `${toBengaliDigits(unreadMessagesCount)}`
                    : undefined,
                perm: 'manage_inbox_settings' as AdminPermissionKey,
              },
              {
                id: 'settings-logs' as const,
                label: 'সেটিংস (Settings)',
                icon: Settings,
                perm: 'manage_inbox_settings' as AdminPermissionKey,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const isAllowed = !item.perm || hasPermission(item.perm);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (!isAllowed) {
                      showToast(
                        `দুঃখিত! আপনার অ্যাকাউন্টে (${adminSession.nameBn}) "${item.label}" ব্যবহারের পারমিশন নেই।`
                      );
                      return;
                    }
                    if (item.id === 'compose' && !editingArticleId) {
                      openNewArticleComposer();
                    } else {
                      setActiveSection(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-3 border-blue-600'
                      : isAllowed
                      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="leading-snug">{item.label}</span>
                  </span>
                  {!isAllowed ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    item.badge && (
                      <span
                        className={`text-[11px] font-sans tabular-nums px-1.5 py-0.2 rounded ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Blue CTA Box: "+ Publish A News" matching Reference UI */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={openNewArticleComposer}
              className="w-full py-3.5 px-3 rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer"
            >
              <span className="w-7 h-7 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </span>
              <span className="text-xs font-bold tracking-wide">
                নতুন সংবাদ প্রকাশ করুন
              </span>
              <span className="text-[10px] text-blue-100">
                Publish A News & Photo
              </span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Area (9 cols on lg, 10 cols on xl) */}
        <main className="lg:col-span-9 xl:col-span-10 space-y-6">
          {/* ================================================================
              SECTION 1: OVERVIEW DASHBOARD (Matching SaaS CMS Reference Image)
             ================================================================ */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Top 4 KPI Metric Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4">
                {/* KPI 1: Total News Articles */}
                <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
                  <div className="w-1.5 h-10 bg-emerald-500 rounded-r absolute left-0 top-5" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      মোট সংবাদ নিবন্ধ (Total News Articles)
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSection('articles')}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="সকল সংবাদ দেখুন"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-2">
                    <span className="text-3xl font-bold font-sans tabular-nums text-slate-900">
                      {toBengaliDigits(articles.length)}টি
                    </span>
                    <span className="text-xs text-slate-500">
                      প্রকাশিত: {toBengaliDigits(publishedCount)} · খসড়া:{' '}
                      {toBengaliDigits(draftCount)}
                    </span>
                  </div>
                </div>

                {/* KPI 2: Total Unions & Locations Covered */}
                <div className="xl:col-span-3 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      কভারকৃত ইউনিয়ন ও বিভাগ
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSection('area-performance')}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-2">
                    <span className="text-3xl font-bold font-sans tabular-nums text-slate-900">
                      {toBengaliDigits(categories.length)}টি
                    </span>
                    <span className="text-xs text-slate-500">
                      ৬টি ইউনিয়ন ও সদর
                    </span>
                  </div>
                </div>

                {/* KPI 3: Total Reader Visits */}
                <div className="xl:col-span-3 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      মোট পাঠক ভিজিট (Total Visited)
                    </span>
                    <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+১৮%</span>
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-2">
                    <span className="text-3xl font-bold font-sans tabular-nums text-slate-900">
                      {formatBengaliNumber(totalViewsCount)}
                    </span>
                    <span className="text-xs text-slate-500">গত ৩০ দিন (ডেমো)</span>
                  </div>
                </div>

                {/* KPI 4: Calendar & Edition Date Card (Matching Reference Right Card) */}
                <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xl font-bold font-sans tabular-nums shadow-xs">
                    ২২
                  </div>
                  <div className="text-[11px] font-bold text-slate-700 mt-2">
                    অক্টোবর, ২০২৬
                  </div>
                  <div className="text-[10px] text-slate-500">
                    বৃহস্পতিবার · সক্রিয় বিজ্ঞাপন: {toBengaliDigits(activeAdsCount)}টি
                  </div>
                </div>
              </div>

              {/* Quick Action Bar for Writing News, Uploading Photos, and Controlling Ads */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      দ্রুত অ্যাডমিন অ্যাকশন: সংবাদ লেখা, ছবি আপলোড, সম্পাদনা ও বিজ্ঞাপন নিয়ন্ত্রণ
                    </h2>
                    <p className="text-xs text-slate-500">
                      যেকোনো সংবাদের কার্ডে থাকা আইকনে ক্লিক করে সরাসরি প্রিভিউ, সম্পাদনা, প্রকাশ বা মুছে ফেলতে পারবেন।
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openNewArticleComposer}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>নতুন সংবাদ ও ছবি আপলোড</span>
                  </button>
                  {hasPermission('manage_admins') && (
                    <button
                      type="button"
                      onClick={() => setActiveSection('admin-roles')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>অ্যাডমিন তৈরি ও পারমিশন ({toBengaliDigits(adminAccounts.length)})</span>
                    </button>
                  )}
                  {hasPermission('manage_ads') && (
                    <button
                      type="button"
                      onClick={() => setActiveSection('ads')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Megaphone className="w-3.5 h-3.5 text-blue-600" />
                      <span>বিজ্ঞাপন নিয়ন্ত্রণ ({toBengaliDigits(activeAdsCount)} সক্রিয়)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Main 2-Column Split: Left Union/City Performance Donut + Right Top Performing News Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left 4 Cols: Mirzaganj Union / Area Performance Donut Chart */}
                <section className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900">
                      জনপদ ও ইউনিয়ন পারফরম্যান্স
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      দৈনিক রিপোর্ট
                    </span>
                  </div>

                  {/* SVG Donut Chart matching Reference Image */}
                  <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      {/* Background Ring */}
                      <circle
                        cx="60"
                        cy="60"
                        r="44"
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="20"
                      />
                      {/* High 50% (Blue/Indigo) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="44"
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth="20"
                        strokeDasharray="138 276"
                        strokeDashoffset="0"
                      />
                      {/* Medium 25% (Emerald Green) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="44"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray="69 276"
                        strokeDashoffset="-138"
                      />
                      {/* Below Average 15% (Amber/Orange) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="44"
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="20"
                        strokeDasharray="41.4 276"
                        strokeDashoffset="-207"
                      />
                      {/* Low 10% (Red) */}
                      <circle
                        cx="60"
                        cy="60"
                        r="44"
                        fill="transparent"
                        stroke="#ef4444"
                        strokeWidth="20"
                        strokeDasharray="27.6 276"
                        strokeDashoffset="-248.4"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-xs font-bold text-slate-800">
                        দৈনিক পাঠক
                      </span>
                      <span className="text-[11px] text-slate-500">রিপোর্ট</span>
                    </div>
                  </div>

                  {/* Area Traffic Retention Breakdown */}
                  <div className="space-y-3 pt-2">
                    {[
                      {
                        area: 'সুবিদখালী সদর, কলেজ ও পাইলট স্কুল এলাকা',
                        retention: '৫০% পাঠক অংশগ্রহণ (High)',
                        color: 'bg-blue-500',
                        textColor: 'text-slate-600',
                      },
                      {
                        area: 'মির্জাগঞ্জ সদর, পায়রা পাড় ও মাজার শরীফ',
                        retention: '২৫% পাঠক অংশগ্রহণ (Medium)',
                        color: 'bg-emerald-500',
                        textColor: 'text-slate-600',
                      },
                      {
                        area: 'মজিদবাড়িয়া শাহী মসজিদ ও কাকড়াবুনিয়া',
                        retention: '১৫% পাঠক অংশগ্রহণ',
                        color: 'bg-amber-500',
                        textColor: 'text-slate-600',
                      },
                      {
                        area: 'মাধবখালী ও আমড়াগাছিয়া ইউনিয়ন',
                        retention: '১০% পাঠক অংশগ্রহণ',
                        color: 'bg-red-500',
                        textColor: 'text-red-600',
                      },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        className="pb-2.5 border-b border-slate-100 last:border-b-0 flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {row.area}
                          </div>
                          <div className={`text-[11px] mt-0.5 ${row.textColor}`}>
                            {row.retention}
                          </div>
                        </div>
                        <span
                          className={`w-2.5 h-2.5 rounded-xs shrink-0 mt-1 ${row.color}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <div className="w-full py-2 px-3 bg-slate-100 text-slate-500 text-[11px] font-medium rounded text-center">
                      বিগত ৮ ঘণ্টার পোর্টাল অ্যানালিটিক্স (ডেমো)
                    </div>
                  </div>
                </section>

                {/* Right 8 Cols: Top Performing News & Instant CRUD Cards (Matching Reference Image) */}
                <section className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        শীর্ষ পঠিত ও প্রকাশিত সংবাদ ব্যবস্থাপনা (Top Performing News)
                      </h3>
                      <p className="text-xs text-slate-500">
                        ছবিসহ প্রিভিউ, সরাসরি সম্পাদনা (Edit), প্রকাশ/খসড়া পরিবর্তন ও মুছে ফেলার সুবিধা
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        aria-label="সংবাদ ক্রম নির্বাচন"
                        value={overviewSort}
                        onChange={(e) =>
                          setOverviewSort(e.target.value as 'popular' | 'latest')
                        }
                        className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded-lg"
                      >
                        <option value="popular">সর্বাধিক পঠিত (Sort by Reach)</option>
                        <option value="latest">সর্বশেষ প্রকাশিত (Sort by Date)</option>
                      </select>
                    </div>
                  </div>

                  {/* News Cards List (3 per page) */}
                  <div className="space-y-4">
                    {sortedOverviewArticles
                      .slice((overviewPage - 1) * 3, overviewPage * 3)
                      .map((art) => {
                        const artAuthor = authorsMap[art.authorId];
                        return (
                          <article
                            key={art.id}
                            className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                              {/* Left 4 Cols: Thumbnail + 3 Action Icon Buttons (View, Edit, Flag/Delete) */}
                              <div className="sm:col-span-4 space-y-2">
                                <div className="relative rounded-lg overflow-hidden">
                                  <EditorialImage
                                    theme={art.visualTheme}
                                    imageUrl={art.imageUrl}
                                    alt={art.title}
                                    aspectRatio="4:3"
                                    compact={true}
                                  />
                                  <div className="absolute top-2 left-2 bg-black/75 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5 text-red-400" />
                                    <span className="truncate max-w-[120px]">
                                      {art.locationBn}
                                    </span>
                                  </div>
                                </div>

                                {/* 3 Action Buttons below thumbnail (Matching Reference UI) */}
                                <div className="grid grid-cols-3 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => onSelectArticlePreview(art.slug)}
                                    title="লাইভ পোর্টালে প্রিভিউ দেখুন"
                                    className="py-1.5 bg-slate-200/80 hover:bg-blue-600 hover:text-white text-slate-700 rounded flex items-center justify-center transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openEditArticleComposer(art)}
                                    title="সংবাদ ও ছবি সম্পাদনা করুন"
                                    className="py-1.5 bg-slate-200/80 hover:bg-amber-600 hover:text-white text-slate-700 rounded flex items-center justify-center transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteArticle(art.id);
                                      showToast(`"${art.title.slice(0, 28)}..." সংবাদটি মুছে ফেলা হয়েছে।`);
                                    }}
                                    title="সংবাদটি মুছে ফেলুন"
                                    className="py-1.5 bg-slate-200/80 hover:bg-red-600 hover:text-white text-slate-700 rounded flex items-center justify-center transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Right 8 Cols: Title, Reached To Counter, Author, Status & Metadata */}
                              <div className="sm:col-span-8 flex flex-col justify-between h-full space-y-3">
                                <div>
                                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                    <span
                                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                        art.status === 'published'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : art.status === 'draft'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }`}
                                    >
                                      {art.status === 'published'
                                        ? 'প্রকাশিত (Published)'
                                        : art.status === 'draft'
                                        ? 'খসড়া (Draft)'
                                        : 'নির্ধারিত (Scheduled)'}
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => openEditArticleComposer(art)}
                                        className="text-xs font-bold text-blue-600 hover:underline"
                                      >
                                        সম্পাদনা
                                      </button>
                                      <span className="text-slate-300">|</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextStatus: ArticleStatus =
                                            art.status === 'published'
                                              ? 'draft'
                                              : 'published';
                                          onQuickStatusChange(art.id, nextStatus);
                                          showToast(
                                            nextStatus === 'published'
                                              ? 'সংবাদটি লাইভ পোর্টালে প্রকাশ করা হয়েছে!'
                                              : 'সংবাদটি খসড়ায় স্থানান্তর করা হয়েছে।'
                                          );
                                        }}
                                        className="text-xs font-bold text-emerald-700 hover:underline"
                                      >
                                        {art.status === 'published'
                                          ? 'খসড়া করুন'
                                          : 'এখনই প্রকাশ করুন'}
                                      </button>
                                    </div>
                                  </div>

                                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                                    {art.title}
                                  </h4>
                                </div>

                                {/* Reached To Metric Row with Sparkline (Matching Reference Image) */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                  <span className="text-xs text-slate-500 font-medium">
                                    পাঠক পৌঁছেছে (Reached to):
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <svg
                                      viewBox="0 0 48 20"
                                      className="w-10 h-4 stroke-emerald-600 fill-none"
                                      strokeWidth="2.2"
                                    >
                                      <polyline points="2,16 14,8 24,14 36,4 46,7" />
                                    </svg>
                                    <span className="text-sm font-bold font-sans tabular-nums text-slate-900 underline decoration-slate-400 underline-offset-4">
                                      {formatBengaliNumber(art.viewCount)} পাঠক
                                    </span>
                                  </div>
                                </div>

                                {/* Published By & Timestamp */}
                                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200/80">
                                  <div className="flex items-center gap-1.5">
                                    <span>প্রকাশক:</span>
                                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center">
                                      {artAuthor ? artAuthor.avatarInitials : 'মি'}
                                    </span>
                                    <span className="font-bold text-slate-800">
                                      {artAuthor ? artAuthor.nameBn : 'বার্তা ডেস্ক'}
                                    </span>
                                    <span className="text-blue-600 font-semibold">
                                      (Admin)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 tabular-nums">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{art.publishedAtBn}</span>
                                  </div>
                                </div>

                                {/* Bottom Grey Pill Bar: Category, Gallery Photos Count, Shares */}
                                <div className="bg-slate-200/70 rounded-lg px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 font-medium">
                                  <span>বিভাগ: {art.categoryNameBn}</span>
                                  <span>
                                    আলোকচিত্র:{' '}
                                    {art.galleryImages
                                      ? `${toBengaliDigits(art.galleryImages.length + 1)}টি ছবি`
                                      : '১টি কভার ছবি'}
                                  </span>
                                  <span>
                                    পাঠের সময়: {toBengaliDigits(art.readingTimeMinutes)} মিনিট
                                  </span>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                  </div>

                  {/* Footer View All & Pagination (Matching Reference Image) */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveSection('articles')}
                      className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      সকল সংবাদ দেখুন (View All)
                    </button>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4].map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setOverviewPage(pageNum)}
                          className={`w-7 h-7 text-xs font-bold rounded flex items-center justify-center transition-colors ${
                            overviewPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {toBengaliDigits(pageNum)}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* ================================================================
              SECTION 2: NEWS COMPOSER & PHOTO UPLOAD STUDIO (সংবাদ লেখা ও ছবি আপলোড)
             ================================================================ */}
          {activeSection === 'compose' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold text-blue-600">
                    সংবাদ রচনা ও ফটো আপলোড স্টুডিও
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingArticleId
                      ? 'বিদ্যমান সংবাদ ও ছবি সম্পাদনা করুন (Edit News & Photos)'
                      : 'নতুন সংবাদ লিখুন এবং ছবি আপলোড করুন (Write News & Upload Photos)'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('overview')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>ওভারভিউতে ফিরুন</span>
                </button>
              </div>

              {formErrors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-xs text-red-900 space-y-1">
                  <div className="font-bold">অনুগ্রহ করে নিচের ত্রুটিগুলো সংশোধন করুন:</div>
                  <ul className="list-disc list-inside">
                    {formErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSaveArticleSubmit} className="space-y-6">
                {/* Title & Subtitle */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        সংবাদের শিরোনাম (Headline) *
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="যেমন: সুবিদখালী সরকারি কলেজে নতুন বিজ্ঞান ভবন ও আইসিটি ল্যাব উদ্বোধন..."
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        উপ-শিরোনাম (Sub-headline)
                      </label>
                      <input
                        type="text"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        placeholder="সংবাদের মূল প্রেক্ষাপট এক বাক্যে লিখুন..."
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        সংক্ষিপ্ত সারসংক্ষেপ (Summary — কার্ড ও মেটা ডেসক্রিপশনের জন্য) *
                      </label>
                      <textarea
                        rows={2}
                        value={formSummary}
                        onChange={(e) => setFormSummary(e.target.value)}
                        placeholder="১-২ বাক্যে সংবাদের মূল সারসংক্ষেপ লিখুন..."
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* Right 4 Cols: Category, Author, Location, Status */}
                  <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        সংবাদ বিভাগ (ইউনিয়ন, শিক্ষা, স্বাস্থ্য, খেলাধুলা ইত্যাদি) *
                      </label>
                      <select
                        value={formCategorySlug}
                        onChange={(e) => {
                          const nextSlug = e.target.value;
                          setFormCategorySlug(nextSlug);
                          const resolved = resolveCategoryMeta(nextSlug, categories);
                          if (resolved && !formTagsText.includes(resolved.titleBn)) {
                            setFormTagsText((prev) =>
                              prev ? `${prev}, ${resolved.titleBn}` : resolved.titleBn
                            );
                          }
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg"
                      >
                        <optgroup label="প্রধান সংবাদ বিভাগসমূহ (Main Categories)">
                          {categories.map((c) => (
                            <option key={c.id} value={c.slug}>
                              {c.nameBn} ({c.nameEn})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="মির্জাগঞ্জের ইউনিয়নসমূহ (Unions)">
                          {menuConfig.unionItems.map((u) => (
                            <option key={u.slug} value={u.slug}>
                              ইউনিয়ন: {u.fullNameBn}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="শিক্ষা সংক্রান্ত ও কলেজ (স্কুল, মাদ্রাসা ও মহিলা কলেজ)">
                          {menuConfig.educationItems.map((edu) => (
                            <React.Fragment key={edu.slug}>
                              <option value={edu.slug}>
                                শিক্ষা: {edu.labelBn || edu.nameBn}
                              </option>
                              {edu.subItems?.map((sub) => (
                                <option key={sub.slug} value={sub.slug}>
                                  ↳ {edu.labelBn || edu.nameBn} — {sub.labelBn || sub.nameBn}
                                </option>
                              ))}
                            </React.Fragment>
                          ))}
                        </optgroup>
                        <optgroup label="স্বাস্থ্য সংক্রান্ত (হাসপাতাল ও ক্লিনিক)">
                          {menuConfig.healthItems.map((hl) => (
                            <option key={hl.slug} value={hl.slug}>
                              স্বাস্থ্য: {hl.labelBn || hl.nameBn}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="ইউনিয়ন ও ওয়ার্ডভিত্তিক সংবাদ (১নং-৯নং ওয়ার্ড)">
                          {menuConfig.unionItems.map((u) =>
                            MIRZAGANJ_WARDS.map((w) => (
                              <option
                                key={`${u.slug}-${w.id}`}
                                value={`${u.slug}-${w.id}`}
                              >
                                {u.nameBn} — {w.labelBn}
                              </option>
                            ))
                          )}
                        </optgroup>
                      </select>
                      <p className="text-[11px] text-slate-500 mt-1">
                        এখান থেকে যেকোনো ইউনিয়ন, কলেজ (বালিকা) → মহিলা কলেজ, শিক্ষা প্রতিষ্ঠান, স্বাস্থ্য কমপ্লেক্স বা মূল বিভাগ নির্বাচন করতে পারবেন।
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          প্রতিবেদক (Reporter) *
                        </label>
                        {(() => {
                          const currentReporter =
                            effectiveAuthors.find((a) => a.id === formAuthorId) ||
                            effectiveAuthors[0];
                          const canDeleteSelected =
                            currentReporter &&
                            effectiveAuthors.length > 1 &&
                            currentReporter.id !== 'author-1';
                          if (!canDeleteSelected) return null;
                          return (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteReporterProfile(
                                  currentReporter.id,
                                  currentReporter.nameBn
                                )
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 cursor-pointer"
                              title="নির্বাচিত প্রতিবেদক/অ্যাডমিনের নাম স্থায়ীভাবে মুছে ফেলুন"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>নির্বাচিত নাম মুছুন</span>
                            </button>
                          );
                        })()}
                      </div>
                      <select
                        value={
                          effectiveAuthors.some((a) => a.id === formAuthorId)
                            ? formAuthorId
                            : effectiveAuthors[0]?.id ?? 'author-1'
                        }
                        onChange={(e) => setFormAuthorId(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg"
                      >
                        {effectiveAuthors.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nameBn} — {a.roleBn}
                          </option>
                        ))}
                      </select>
                      {effectiveAuthors.length > 1 && (
                        <div className="mt-2 pt-2 border-t border-slate-200/80">
                          <div className="text-[10px] font-semibold text-slate-500 mb-1">
                            তালিকা থেকে অপ্রয়োজনীয় নাম মুছুন (× ক্লিক করুন):
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {effectiveAuthors.map((a) => {
                              const isPrimary = a.id === 'author-1';
                              return (
                                <span
                                  key={a.id}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                    formAuthorId === a.id
                                      ? 'bg-red-50 text-red-800 border-red-200'
                                      : 'bg-white text-slate-700 border-slate-200'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => setFormAuthorId(a.id)}
                                    className="cursor-pointer hover:underline"
                                  >
                                    {a.nameBn}
                                  </button>
                                  {!isPrimary && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteReporterProfile(a.id, a.nameBn)
                                      }
                                      aria-label={`${a.nameBn} মুছে ফেলুন`}
                                      title={`${a.nameBn} মুছে ফেলুন`}
                                      className="ml-0.5 text-red-600 hover:text-red-800 font-bold cursor-pointer"
                                    >
                                      ×
                                    </button>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        স্থান / ডেটলাইন (ইউনিয়ন ও ওয়ার্ড)
                      </label>
                      <input
                        type="text"
                        value={formLocationBn}
                        onChange={(e) => setFormLocationBn(e.target.value)}
                        placeholder="সুবিদখালী, মির্জাগঞ্জ"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg mb-2"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <select
                          aria-label="ইউনিয়ন নির্বাচন"
                          defaultValue=""
                          onChange={(e) => {
                            const u = menuConfig.unionItems.find((x) => x.slug === e.target.value);
                            if (u) {
                              setFormLocationBn(`${u.fullNameBn}, মির্জাগঞ্জ`);
                              if (!formTagsText.includes(u.nameBn)) {
                                setFormTagsText((prev) => `${prev}, ${u.nameBn}`);
                              }
                            }
                          }}
                          className="px-2 py-1.5 text-[11px] font-semibold bg-white border border-slate-300 rounded"
                        >
                          <option value="">ইউনিয়ন বাছাই...</option>
                          {menuConfig.unionItems.map((u) => (
                            <option key={u.slug} value={u.slug}>
                              {u.nameBn}
                            </option>
                          ))}
                        </select>
                        <select
                          aria-label="ওয়ার্ড নির্বাচন"
                          defaultValue=""
                          onChange={(e) => {
                            const w = MIRZAGANJ_WARDS.find((x) => x.id === e.target.value);
                            if (w) {
                              setFormLocationBn((prev) =>
                                prev.includes('ওয়ার্ড')
                                  ? prev.replace(/[১-৯]নং ওয়ার্ড/g, w.labelBn)
                                  : `${w.labelBn}, ${prev}`
                              );
                              if (!formTagsText.includes(w.labelBn)) {
                                setFormTagsText((prev) => `${prev}, ${w.labelBn}`);
                              }
                            }
                          }}
                          className="px-2 py-1.5 text-[11px] font-semibold bg-white border border-slate-300 rounded"
                        >
                          <option value="">ওয়ার্ড (১-৯)...</option>
                          {MIRZAGANJ_WARDS.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.labelBn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        প্রকাশের অবস্থা (Publish Status) *
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) =>
                          setFormStatus(e.target.value as ArticleStatus)
                        }
                        className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="published">
                          প্রকাশিত (Published — সরাসরি লাইভ)
                        </option>
                        <option value="draft">খসড়া (Draft — অপ্রকাশিত)</option>
                        <option value="scheduled">
                          নির্ধারিত (Scheduled — পরবর্তী সময়ের জন্য)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* PHOTO UPLOAD STUDIO: Cover Image File Upload + Visual Theme + Caption */}
                <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-blue-200">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          ১. সংবাদের মূল ছবি আপলোড বা দৃশ্যপট নির্বাচন (Cover Photo Upload)
                        </h3>
                        <p className="text-xs text-slate-600">
                          আপনার কম্পিউটার বা মোবাইল থেকে সরাসরি ছবি আপলোড করুন অথবা মির্জাগঞ্জ থিম নির্বাচন করুন
                        </p>
                      </div>
                    </div>
                    {formImageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>আপলোডকৃত ছবি সরান</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left 7 Cols: Upload Box + URL Input + Theme Selector */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Direct Device File Upload Button */}
                      <div className="border-2 border-dashed border-blue-300 bg-white rounded-xl p-5 text-center space-y-3">
                        <input
                          ref={coverFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileUpload}
                          className="hidden"
                        />
                        <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => coverFileInputRef.current?.click()}
                            className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
                          >
                            {isUploadingCover
                              ? 'ছবি প্রক্রিয়াকরণ হচ্ছে...'
                              : 'ডিভাইস থেকে ছবি আপলোড করুন (Choose Image)'}
                          </button>
                          <p className="text-[11px] text-slate-500 mt-1.5">
                            JPG, PNG বা WEBP ছবি নির্বাচন করলে তা স্বয়ংক্রিয়ভাবে অপ্টিমাইজ হয়ে সংবাদের সাথে যুক্ত হবে।
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            অথবা মির্জাগঞ্জ ভিজ্যুয়াল দৃশ্যপট (Theme)
                          </label>
                          <select
                            value={formVisualTheme}
                            onChange={(e) =>
                              setFormVisualTheme(e.target.value as VisualTheme)
                            }
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                          >
                            {VISUAL_THEMES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.labelBn}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            অথবা সরাসরি ছবির লিঙ্ক (Image URL)
                          </label>
                          <input
                            type="text"
                            value={
                              formImageUrl.startsWith('data:')
                                ? ''
                                : formImageUrl
                            }
                            onChange={(e) => setFormImageUrl(e.target.value)}
                            placeholder="https://example.com/photo.jpg"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ছবির ক্যাপশন (Photo Caption)
                        </label>
                        <input
                          type="text"
                          value={formImageCaptionBn}
                          onChange={(e) => setFormImageCaptionBn(e.target.value)}
                          placeholder="আলোকচিত্র: সুবিদখালী সরকারি কলেজের মূল ভবন ও সবুজ মাঠ..."
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      {/* 1-Click Real Mirzaganj Uploaded Photos Picker */}
                      <div className="pt-2 border-t border-blue-200">
                        <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                          <span>অথবা মির্জাগঞ্জের বাস্তব ছবি গ্যালারি থেকে ১-ক্লিকে বাছাই করুন:</span>
                          <span className="text-[11px] text-blue-700">১৩টি বাস্তব ছবি</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {REAL_MIRZAGANJ_PHOTO_LIBRARY.map((photo, pIdx) => {
                            const isSelected = formImageUrl === photo.imageUrl;
                            return (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => {
                                  setFormImageUrl(photo.imageUrl);
                                  setFormVisualTheme(photo.theme);
                                  if (!formImageCaptionBn) {
                                    setFormImageCaptionBn(photo.captionBn);
                                  }
                                  showToast(`"${photo.titleBn}" ছবিটি সংবাদের কভার হিসেবে যুক্ত হয়েছে!`);
                                }}
                                className={`group relative rounded-lg overflow-hidden border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                                    : 'border-slate-200 hover:border-blue-400 bg-white'
                                }`}
                              >
                                <img
                                  src={photo.imageUrl}
                                  alt={photo.titleBn}
                                  className="w-full h-14 object-cover"
                                />
                                <div className="p-1.5 text-[10px] font-bold text-slate-800 truncate">
                                  {photo.titleBn}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right 5 Cols: Live Cover Image Preview */}
                    <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-3">
                      <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                        <span>লাইভ কভার ফটো প্রিভিউ:</span>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          {formImageUrl ? 'আপলোডকৃত ছবি সক্রিয়' : 'থিম ভিজ্যুয়াল সক্রিয়'}
                        </span>
                      </div>
                      <EditorialImage
                        theme={formVisualTheme}
                        imageUrl={formImageUrl}
                        alt={formTitle || 'সংবাদের ছবি প্রিভিউ'}
                        aspectRatio="16:9"
                        locationBadgeBn={formLocationBn}
                        captionBn={formImageCaptionBn}
                      />
                    </div>
                  </div>
                </div>

                {/* MULTI-PHOTO GALLERY UPLOADER (একাধিক ছবি সংযোজন) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        ২. সংবাদের ফটো অ্যালবামে অতিরিক্ত ছবি যোগ করুন (Multi-Photo Gallery)
                      </h3>
                      <p className="text-xs text-slate-500">
                        একটি সংবাদের ভেতরে একাধিক আলোকচিত্র দেখাতে এখানে আরও ছবি আপলোড বা যুক্ত করুন ({toBengaliDigits(formGalleryImages.length)}টি ছবি সংযুক্ত)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        গ্যালারি ছবি আপলোড বা থিম
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          ref={galleryFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleGalleryFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => galleryFileInputRef.current?.click()}
                          className="px-2.5 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shrink-0"
                        >
                          ছবি ফাইল
                        </button>
                        <select
                          value={newGalleryTheme}
                          onChange={(e) =>
                            setNewGalleryTheme(e.target.value as VisualTheme)
                          }
                          className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                        >
                          {VISUAL_THEMES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.labelBn.split('(')[0]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        ছবির শিরোনাম
                      </label>
                      <input
                        type="text"
                        value={newGalleryTitleBn}
                        onChange={(e) => setNewGalleryTitleBn(e.target.value)}
                        placeholder="যেমন: পাইলট স্কুল মাঠ"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        ক্যাপশন / বিবরণ
                      </label>
                      <input
                        type="text"
                        value={newGalleryCaptionBn}
                        onChange={(e) => setNewGalleryCaptionBn(e.target.value)}
                        placeholder="ছবির সংক্ষিপ্ত বিবরণ..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        onClick={handleAddGalleryItemToDraft}
                        className="w-full py-2 px-3 text-xs font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
                      >
                        + গ্যালারিতে ছবি যুক্ত করুন
                      </button>
                    </div>
                  </div>

                  {formGalleryImages.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {formGalleryImages.map((gItem, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-start justify-between gap-2"
                        >
                          <div className="w-20 shrink-0">
                            <EditorialImage
                              theme={gItem.theme}
                              imageUrl={gItem.imageUrl}
                              alt={gItem.titleBn}
                              aspectRatio="16:9"
                              compact={true}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {gItem.titleBn}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">
                              {gItem.captionBn}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryItemFromDraft(idx)}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main Article Body & Takeaways */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মূল প্রতিবেদন (প্রতি অনুচ্ছেদের পর নতুন লাইন দিন) *
                    </label>
                    <textarea
                      rows={7}
                      value={formContentText}
                      onChange={(e) => setFormContentText(e.target.value)}
                      placeholder="বিস্তারিত সংবাদ প্রতিবেদন এখানে লিখুন..."
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
                    />
                  </div>

                  <div className="lg:col-span-4 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        একনজরে মূল তথ্য (Key Takeaways — প্রতি লাইনে ১টি)
                      </label>
                      <textarea
                        rows={3}
                        value={formKeyTakeawaysText}
                        onChange={(e) => setFormKeyTakeawaysText(e.target.value)}
                        placeholder="মূল বুলেট পয়েন্টগুলো লিখুন..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        বিশেষ উদ্ধৃতি (Pull Quote)
                      </label>
                      <input
                        type="text"
                        value={formPullQuote}
                        onChange={(e) => setFormPullQuote(e.target.value)}
                        placeholder="গুরুত্বপূর্ণ উদ্ধৃতি বা মন্তব্য..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)
                      </label>
                      <input
                        type="text"
                        value={formTagsText}
                        onChange={(e) => setFormTagsText(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Flags & Submit Buttons */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-800">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsLead}
                        onChange={(e) => setFormIsLead(e.target.checked)}
                        className="accent-red-700"
                      />
                      <span>প্রধান সংবাদ (Lead Story)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsFeatured}
                        onChange={(e) => setFormIsFeatured(e.target.checked)}
                        className="accent-red-700"
                      />
                      <span>নির্বাচিত (Featured)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsTrending}
                        onChange={(e) => setFormIsTrending(e.target.checked)}
                        className="accent-red-700"
                      />
                      <span>এখন ট্রেন্ডিং</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsBreaking}
                        onChange={(e) => setFormIsBreaking(e.target.checked)}
                        className="accent-red-700"
                      />
                      <span>ব্রেকিং টিকার</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsVideo}
                        onChange={(e) => setFormIsVideo(e.target.checked)}
                        className="accent-red-700"
                      />
                      <span>ভিডিও প্রতিবেদন</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveSection('overview')}
                      className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                    >
                      বাতিল করুন
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      {editingArticleId
                        ? 'পরিবর্তন ও ছবি সংরক্ষণ করুন'
                        : formStatus === 'published'
                        ? 'ছবিসহ সংবাদ প্রকাশ করুন (Publish Now)'
                        : 'সংবাদ সংরক্ষণ করুন'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================
              SECTION 3: FULL NEWS MANAGEMENT TABLE (সংবাদ সম্পাদনা, প্রকাশ বা মুছে ফেলা)
             ================================================================ */}
          {activeSection === 'articles' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    সংবাদ ব্যবস্থাপনা: সম্পাদনা, প্রকাশ বা মুছে ফেলা
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    সকল প্রকাশিত ({toBengaliDigits(publishedCount)}), খসড়া ({toBengaliDigits(draftCount)}) ও নির্ধারিত ({toBengaliDigits(scheduledCount)}) সংবাদ তালিকা
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewArticleComposer}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন সংবাদ ও ছবি যোগ করুন</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                  {[
                    { id: 'all' as const, label: `সব (${toBengaliDigits(articles.length)})` },
                    {
                      id: 'published' as const,
                      label: `প্রকাশিত (${toBengaliDigits(publishedCount)})`,
                    },
                    { id: 'draft' as const, label: `খসড়া (${toBengaliDigits(draftCount)})` },
                    {
                      id: 'scheduled' as const,
                      label: `নির্ধারিত (${toBengaliDigits(scheduledCount)})`,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                        statusFilter === tab.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <input
                  type="search"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="শিরোনাম বা স্থান খুঁজুন..."
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg w-full sm:w-64"
                />
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-3 px-4 font-bold">ছবি ও শিরোনাম</th>
                      <th className="py-3 px-3 font-bold">প্রকাশের অবস্থা (Status)</th>
                      <th className="py-3 px-3 font-bold">পাঠসংখ্যা</th>
                      <th className="py-3 px-4 font-bold text-right">
                        কার্যক্রম (প্রিভিউ / সম্পাদনা / মুছুন)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredArticles.map((art) => (
                      <tr key={art.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 max-w-md">
                          <div className="flex items-start gap-3">
                            <div className="w-20 shrink-0 rounded overflow-hidden">
                              <EditorialImage
                                theme={art.visualTheme}
                                imageUrl={art.imageUrl}
                                alt={art.title}
                                aspectRatio="16:9"
                                compact={true}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
                                <span className="font-bold text-red-700">
                                  {art.categoryNameBn}
                                </span>
                                <span>·</span>
                                <span>{art.locationBn}</span>
                                {art.imageUrl && (
                                  <>
                                    <span>·</span>
                                    <span className="text-blue-600 font-semibold">
                                      আপলোডকৃত ছবি
                                    </span>
                                  </>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => onSelectArticlePreview(art.slug)}
                                className="font-bold text-sm text-slate-900 hover:text-blue-600 text-left leading-snug"
                              >
                                {art.title}
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <select
                            aria-label={`${art.title} স্ট্যাটাস পরিবর্তন`}
                            value={art.status}
                            onChange={(e) => {
                              const next = e.target.value as ArticleStatus;
                              onQuickStatusChange(art.id, next);
                              showToast(
                                `সংবাদের অবস্থা "${next}"-এ পরিবর্তন করা হয়েছে!`
                              );
                            }}
                            className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
                              art.status === 'published'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : art.status === 'draft'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-blue-50 text-blue-900 border-blue-300'
                            }`}
                          >
                            <option value="published">প্রকাশিত (Published)</option>
                            <option value="draft">খসড়া (Draft)</option>
                            <option value="scheduled">নির্ধারিত (Scheduled)</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-3 font-sans tabular-nums text-slate-600 font-semibold">
                          {formatBengaliNumber(art.viewCount)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectArticlePreview(art.slug)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                            >
                              প্রিভিউ
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditArticleComposer(art)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>সম্পাদনা</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteArticle(art.id);
                                showToast('সংবাদটি মুছে ফেলা হয়েছে।');
                              }}
                              aria-label={`${art.title} মুছে ফেলুন`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>মুছুন</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              SECTION 4: ADVERTISEMENT CONTROL CENTER (বিজ্ঞাপন নিয়ন্ত্রণ)
             ================================================================ */}
          {activeSection === 'ads' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold text-blue-600">
                    Advertisement Control Center
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    বিজ্ঞাপন নিয়ন্ত্রণ ও ব্যানার ছবি আপলোড
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    হোমপেজ লিডারবোর্ড, সাইডবার এবং নিবন্ধের ভেতরের বিজ্ঞাপন চালু/বন্ধ, ব্যানার ছবি আপলোড ও নতুন বিজ্ঞাপন সংযোজন করুন।
                  </p>
                </div>

                {onAddAd && (
                  <button
                    type="button"
                    onClick={() => setIsNewAdOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন বিজ্ঞাপন যোগ করুন</span>
                  </button>
                )}
              </div>

              {/* Create New Ad Form */}
              {isNewAdOpen && onAddAd && (
                <form
                  onSubmit={handleCreateAdSubmit}
                  className="p-5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-4"
                >
                  <h3 className="text-sm font-bold text-slate-900">
                    নতুন বিজ্ঞাপন স্লট তৈরি করুন
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        স্লট অবস্থান (Slot Position)
                      </label>
                      <select
                        value={newAdSlotId}
                        onChange={(e) =>
                          setNewAdSlotId(
                            e.target.value as Advertisement['slotId']
                          )
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="header-leaderboard">
                          হোমপেজ লিডারবোর্ড (header-leaderboard)
                        </option>
                        <option value="sidebar-rectangle">
                          সাইডবার রেকট্যাঙ্গেল (sidebar-rectangle)
                        </option>
                        <option value="mid-page-banner">
                          মিড-পেজ ব্যানার (mid-page-banner)
                        </option>
                        <option value="article-inline">
                          আর্টিকেল ইনলাইন (article-inline)
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        বিজ্ঞাপনের শিরোনাম *
                      </label>
                      <input
                        type="text"
                        value={newAdTitleBn}
                        onChange={(e) => setNewAdTitleBn(e.target.value)}
                        placeholder="যেমন: সুবিদখালী বইমেলা ২০২৬..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        স্পনসর প্রতিষ্ঠান
                      </label>
                      <input
                        type="text"
                        value={newAdSponsorBn}
                        onChange={(e) => setNewAdSponsorBn(e.target.value)}
                        placeholder="মির্জাগঞ্জ চেম্বার..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        মাপ (Dimensions)
                      </label>
                      <input
                        type="text"
                        value={newAdDimensions}
                        onChange={(e) => setNewAdDimensions(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNewAdOpen(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      বিজ্ঞাপন সক্রিয় করুন
                    </button>
                  </div>
                </form>
              )}

              {/* Existing Advertisements List */}
              <div className="grid grid-cols-1 gap-5">
                {advertisements.map((ad) => (
                  <div
                    key={ad.id}
                    className={`p-5 rounded-xl border transition-colors ${
                      ad.isActive
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-100/60 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-3 mb-4 border-b border-slate-200">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900">
                          {ad.formatLabel}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-slate-500">
                          {ad.slotId}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-slate-600">
                          {ad.dimensions}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Upload Ad Banner Image Button */}
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>ব্যানার ছবি আপলোড</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAdBannerUpload(ad, e)}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            onUpdateAd({ ...ad, isActive: !ad.isActive });
                            showToast(
                              !ad.isActive
                                ? 'বিজ্ঞাপন স্লটটি সক্রিয় (Active) করা হয়েছে!'
                                : 'বিজ্ঞাপন স্লটটি সাময়িক বিরত (Paused) করা হয়েছে।'
                            );
                          }}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                            ad.isActive
                              ? 'bg-emerald-700 text-white'
                              : 'bg-slate-300 text-slate-800'
                          }`}
                        >
                          {ad.isActive
                            ? 'সক্রিয় আছে (Active)'
                            : 'নিষ্ক্রিয় (Paused)'}
                        </button>

                        {onDeleteAd && advertisements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteAd(ad.id);
                              showToast('বিজ্ঞাপন স্লটটি মুছে ফেলা হয়েছে।');
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                            title="বিজ্ঞাপন মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {ad.bannerImageUrl && (
                      <div className="mb-4 relative rounded-lg overflow-hidden border border-slate-300 bg-white">
                        <img
                          src={ad.bannerImageUrl}
                          alt={ad.titleBn}
                          className="w-full max-h-36 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateAd({ ...ad, bannerImageUrl: undefined })
                          }
                          className="absolute top-2 right-2 px-2 py-1 text-[11px] font-bold bg-red-700 text-white rounded shadow-xs"
                        >
                          ব্যানার ছবি সরান
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          বিজ্ঞাপন শিরোনাম (Title)
                        </label>
                        <input
                          type="text"
                          value={ad.titleBn}
                          onChange={(e) =>
                            onUpdateAd({ ...ad, titleBn: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          স্পনসর নাম (Sponsor)
                        </label>
                        <input
                          type="text"
                          value={ad.sponsorNameBn}
                          onChange={(e) =>
                            onUpdateAd({ ...ad, sponsorNameBn: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          বাটন টেক্সট (CTA Label)
                        </label>
                        <input
                          type="text"
                          value={ad.ctaLabelBn}
                          onChange={(e) =>
                            onUpdateAd({ ...ad, ctaLabelBn: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================
              SECTION 5: BREAKINGS & HOMEPAGE HIGHLIGHTS (ব্রেকিং ও প্রচ্ছদ হাইলাইট)
             ================================================================ */}
          {activeSection === 'highlights' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="pb-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  প্রচ্ছদ হাইলাইট, এখন ট্রেন্ডিং ও ব্রেকিং নিউজ টিকার নিয়ন্ত্রণ
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  হোমপেজের লিড স্টোরি (Lead Story), নির্বাচিত ফিচার্ড সংবাদ এবং ব্রেকিং নিউজ টিকার ১-ক্লিকে নিয়ন্ত্রণ করুন।
                </p>
              </div>

              <form
                onSubmit={handleQuickBreakingSubmit}
                className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-3"
              >
                <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-red-700" />
                  <span>দ্রুত ব্রেকিং ও ট্রেন্ডিং সংবাদ টিকারে যুক্ত করুন</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <input
                    type="text"
                    value={quickBreakingTitle}
                    onChange={(e) => setQuickBreakingTitle(e.target.value)}
                    placeholder="সদ্যপ্রাপ্ত ব্রেকিং সংবাদের শিরোনাম লিখুন..."
                    className="sm:col-span-7 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                  <select
                    value={quickBreakingCategory}
                    onChange={(e) => setQuickBreakingCategory(e.target.value)}
                    className="sm:col-span-3 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.nameBn}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="sm:col-span-2 px-3 py-2 text-xs font-bold bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                  >
                    যুক্ত করুন
                  </button>
                </div>
              </form>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-3 px-4 font-bold">সংবাদ শিরোনাম</th>
                      <th className="py-3 px-3 font-bold text-center">
                        প্রধান সংবাদ (Lead)
                      </th>
                      <th className="py-3 px-3 font-bold text-center">
                        ফিচার্ড (Featured)
                      </th>
                      <th className="py-3 px-3 font-bold text-center">
                        এখন ট্রেন্ডিং
                      </th>
                      <th className="py-3 px-3 font-bold text-center">
                        ব্রেকিং টিকার
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {articles
                      .filter((a) => a.status === 'published')
                      .map((art) => (
                        <tr key={art.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {art.title}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                onToggleArticleFlag(art.id, 'isLeadStory');
                                showToast('প্রধান সংবাদ (Lead Story) হালনাগাদ হয়েছে!');
                              }}
                              className={`px-2.5 py-1 rounded text-xs font-bold ${
                                art.isLeadStory
                                  ? 'bg-red-700 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {art.isLeadStory ? 'প্রধান সংবাদ ✓' : 'নির্ধারণ করুন'}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={art.isFeatured}
                              onChange={() =>
                                onToggleArticleFlag(art.id, 'isFeatured')
                              }
                              className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(art.isTrending)}
                              onChange={() =>
                                onToggleArticleFlag(art.id, 'isTrending')
                              }
                              className="w-4 h-4 accent-amber-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={art.isBreaking}
                              onChange={() =>
                                onToggleArticleFlag(art.id, 'isBreaking')
                              }
                              className="w-4 h-4 accent-red-700 cursor-pointer"
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              SECTION 6: UNION & AREA PERFORMANCE (ইউনিয়ন পারফরম্যান্স)
             ================================================================ */}
          {activeSection === 'area-performance' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="pb-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  মির্জাগঞ্জ উপজেলার ৬টি ইউনিয়ন ও জনপদ পারফরম্যান্স
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  ইউনিয়নভিত্তিক প্রকাশিত প্রতিবেদন, পাঠক সংযোগ ও ট্রাফিক রিটেনশন পরিসংখ্যান (ডেমো)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: 'দেউলী সুবিদখালী ইউনিয়ন ও সদর',
                    spots: 'সুবিদখালী সরকারি কলেজ, পাইলট স্কুল, শ্রীমন্ত সেতু ও সদর বাজার',
                    retention: '৫০%',
                    views: '৯৮,৪০০',
                    badge: 'সর্বোচ্চ পাঠক প্রবাহ',
                  },
                  {
                    name: 'মির্জাগঞ্জ ইউনিয়ন',
                    spots: 'হযরত ইয়ার উদ্দিন খলিফা (রহ.) মাজার শরীফ, পায়রা ও শ্রীমন্ত নদী পাড়',
                    retention: '২৫%',
                    views: '৬৩,৮৫০',
                    badge: 'ঐতিহ্য ও নদীভাঙন বিট',
                  },
                  {
                    name: 'মজিদবাড়িয়া ইউনিয়ন',
                    spots: 'সুলতানি আমলের মজিদবাড়িয়া শাহী মসজিদ (১৪৬৫ খ্রি.) ও কৃষি জনপদ',
                    retention: '১৫%',
                    views: '৪২,১০০',
                    badge: 'দর্শনীয় স্থান বিট',
                  },
                  {
                    name: 'মাধবখালী ইউনিয়ন',
                    spots: 'পায়রা নদী উপকূল, আমন ধান ও সড়ক সংযোগ এলাকা',
                    retention: '১০%',
                    views: '২৮,৫০০',
                    badge: 'কৃষি ও নদী বিট',
                  },
                  {
                    name: 'আমড়াগাছিয়া ইউনিয়ন',
                    spots: 'আমড়াগাছিয়া বাজার, কৃষকের হাট ও শিক্ষাপ্রতিষ্ঠান',
                    retention: '৮%',
                    views: '২৪,২০০',
                    badge: 'বাজারদর বিট',
                  },
                  {
                    name: 'কাকড়াবুনিয়া ইউনিয়ন',
                    spots: 'গ্রামীণ সড়ক, সৌর সেচ ও নাগরিক হেল্পডেস্ক সেবা',
                    retention: '৭%',
                    views: '১৯,৬০০',
                    badge: 'গ্রামীণ উন্নয়ন বিট',
                  },
                ].map((u, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-blue-700">
                        {u.badge}
                      </span>
                      <span className="text-xs font-bold font-sans tabular-nums bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {u.retention} ট্রাফিক
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {u.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      প্রধান স্থান: {u.spots}
                    </p>
                    <div className="pt-2 border-t border-slate-200 text-xs font-bold text-slate-700">
                      মোট পাঠসংখ্যা: {u.views} (ডেমো)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================
              SECTION 7: ALL MENU CONTROL & CATEGORIES (অল মেনু কন্ট্রোল: যোগ করা, মুছা ও কমানো)
             ================================================================ */}
          {activeSection === 'categories-tags' && (
            <div className="space-y-6">
              {/* Top Banner: All Menu & Sub-Menu Master Board (সকল মেনু ও সাব-মেনু দেখা, কাটা ও যোগ করা) */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-blue-600">
                      মেনু ও সাব-মেনু মাস্টার কন্ট্রোল সেন্টার
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                      সকল মেনু ও সাব-মেনু একনজরে দেখুন — সাব-মেনু কাটা (মুছা) ও যোগ করা
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      নিচের তালিকা থেকে পোর্টালের প্রতিটি মেইন মেনু এবং তার ভেতরের সকল সাব-মেনু দেখতে পারবেন, যেকোনো সাব-মেনু কাটতে (মুছে ফেলতে) পারবেন এবং নতুন সাব-মেনু যোগ করতে পারবেন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSettings({
                        ...settings,
                        navigationMenus: undefined,
                      });
                      showToast('সকল মেনু ও সাব-মেনু ডিফল্ট অবস্থায় রিসেট করা হয়েছে!');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ডিফল্ট মেনু ফিরিয়ে আনুন</span>
                  </button>
                </div>

                {/* UNIFIED TREE OF ALL MENUS & THEIR SUB-MENUS (সকল মেনু ও সাব-মেনু) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span>সকল মেনু ও সাব-মেনু ট্রি ভিউ (সাব-মেনু কাটুন অথবা নতুন সাব-মেনু যোগ করুন):</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuConfig.mainNavItems.map((navItem) => {
                      const isUnionMenu = navItem.dropdownType === 'union';
                      const isEduMenu = navItem.dropdownType === 'education';
                      const isHealthMenu = navItem.dropdownType === 'health';
                      const draftVal = inlineSubMenuDrafts[navItem.id] || '';

                      return (
                        <div
                          key={navItem.id}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            {/* Main Menu Header */}
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">
                                  {navItem.labelBn}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                                  {navItem.slug}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = menuConfig.mainNavItems.map((m) =>
                                      m.id === navItem.id ? { ...m, visible: !m.visible } : m
                                    );
                                    updateNavigationMenus(
                                      { ...menuConfig, mainNavItems: updated },
                                      `"${navItem.labelBn}" মেনু ${navItem.visible ? 'লুকানো' : 'সক্রিয়'} করা হয়েছে!`
                                    );
                                  }}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                                    navItem.visible
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {navItem.visible ? 'সক্রিয়' : 'লুকানো'}
                                </button>
                                {navItem.slug !== 'trending' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = menuConfig.mainNavItems.filter(
                                        (m) => m.id !== navItem.id
                                      );
                                      updateNavigationMenus(
                                        { ...menuConfig, mainNavItems: updated },
                                        `"${navItem.labelBn}" মেইন মেনুটি কেটে দেওয়া হয়েছে!`
                                      );
                                      onDeleteCategory?.(navItem.slug);
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                    <span>মেনু কাটুন</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Sub-Menus List inside this Main Menu */}
                            <div className="space-y-1.5">
                              <div className="text-[11px] font-bold text-slate-600">
                                সাব-মেনু তালিকা:
                              </div>

                              {isUnionMenu && (
                                <div className="flex flex-wrap gap-1.5">
                                  {menuConfig.unionItems.map((u) => (
                                    <span
                                      key={u.slug}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                                    >
                                      <span>{u.fullNameBn || u.nameBn}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = menuConfig.unionItems.filter(
                                            (item) => item.slug !== u.slug
                                          );
                                          updateNavigationMenus(
                                            { ...menuConfig, unionItems: updated },
                                            `সাব-মেনু "${u.fullNameBn || u.nameBn}" কেটে দেওয়া হয়েছে!`
                                          );
                                        }}
                                        aria-label={`${u.fullNameBn || u.nameBn} কাটুন`}
                                        className="text-red-600 hover:text-red-800 font-bold cursor-pointer inline-flex items-center"
                                        title="এই সাব-মেনুটি কেটে ফেলুন"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}

                              {isEduMenu && (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                  {menuConfig.educationItems.map((edu) => (
                                    <div
                                      key={edu.slug}
                                      className="p-2 rounded-lg bg-white border border-slate-200 space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-slate-800">
                                          {edu.labelBn || edu.nameBn}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = menuConfig.educationItems.filter(
                                              (item) => item.slug !== edu.slug
                                            );
                                            updateNavigationMenus(
                                              { ...menuConfig, educationItems: updated },
                                              `শিক্ষা সাব-মেনু "${edu.labelBn || edu.nameBn}" কেটে দেওয়া হয়েছে!`
                                            );
                                          }}
                                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 cursor-pointer"
                                        >
                                          <X className="w-3 h-3" />
                                          <span>কাটুন</span>
                                        </button>
                                      </div>
                                      {edu.subItems && edu.subItems.length > 0 && (
                                        <div className="pl-2.5 border-l-2 border-blue-400 flex flex-wrap gap-1.5 pt-1">
                                          {edu.subItems.map((sub) => (
                                            <span
                                              key={sub.slug}
                                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-950"
                                            >
                                              <span>• {sub.labelBn || sub.nameBn}</span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const updatedEdu = menuConfig.educationItems.map(
                                                    (item) =>
                                                      item.slug === edu.slug
                                                        ? {
                                                            ...item,
                                                            subItems: (item.subItems || []).filter(
                                                              (s) => s.slug !== sub.slug
                                                            ),
                                                          }
                                                        : item
                                                  );
                                                  updateNavigationMenus(
                                                    { ...menuConfig, educationItems: updatedEdu },
                                                    `"${sub.labelBn || sub.nameBn}" সাব-মেনু থেকে কেটে দেওয়া হয়েছে!`
                                                  );
                                                }}
                                                aria-label={`${sub.labelBn || sub.nameBn} কাটুন`}
                                                className="text-red-600 hover:text-red-800 font-bold cursor-pointer inline-flex items-center"
                                                title="সাব-মেনু কাটুন"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {isHealthMenu && (
                                <div className="flex flex-wrap gap-1.5">
                                  {menuConfig.healthItems.map((hl) => (
                                    <span
                                      key={hl.slug}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                                    >
                                      <span>{hl.labelBn || hl.nameBn}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = menuConfig.healthItems.filter(
                                            (item) => item.slug !== hl.slug
                                          );
                                          updateNavigationMenus(
                                            { ...menuConfig, healthItems: updated },
                                            `স্বাস্থ্য সাব-মেনু "${hl.labelBn || hl.nameBn}" কেটে দেওয়া হয়েছে!`
                                          );
                                        }}
                                        aria-label={`${hl.labelBn || hl.nameBn} কাটুন`}
                                        className="text-red-600 hover:text-red-800 font-bold cursor-pointer inline-flex items-center"
                                        title="এই সাব-মেনুটি কেটে ফেলুন"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}

                              {!isUnionMenu && !isEduMenu && !isHealthMenu && (
                                <div className="flex flex-wrap gap-1.5">
                                  {(navItem.subItems || []).length === 0 ? (
                                    <span className="text-[11px] text-slate-400 italic">
                                      কোনো সাব-মেনু নেই (নিচে নাম লিখে যোগ করুন)
                                    </span>
                                  ) : (
                                    (navItem.subItems || []).map((sub) => (
                                      <span
                                        key={sub.slug}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                                      >
                                        <span>{sub.labelBn || sub.nameBn}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updatedMain = menuConfig.mainNavItems.map((m) =>
                                              m.id === navItem.id
                                                ? {
                                                    ...m,
                                                    subItems: (m.subItems || []).filter(
                                                      (s) => s.slug !== sub.slug
                                                    ),
                                                  }
                                                : m
                                            );
                                            updateNavigationMenus(
                                              { ...menuConfig, mainNavItems: updatedMain },
                                              `সাব-মেনু "${sub.labelBn || sub.nameBn}" কেটে দেওয়া হয়েছে!`
                                            );
                                          }}
                                          aria-label={`${sub.labelBn || sub.nameBn} কাটুন`}
                                          className="text-red-600 hover:text-red-800 font-bold cursor-pointer inline-flex items-center"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </span>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Inline Quick Sub-Menu Adder for this Main Menu */}
                          <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                            <input
                              type="text"
                              value={draftVal}
                              onChange={(e) =>
                                setInlineSubMenuDrafts((prev) => ({
                                  ...prev,
                                  [navItem.id]: e.target.value,
                                }))
                              }
                              placeholder={`"${navItem.labelBn}"-এ নতুন সাব-মেনু নাম...`}
                              className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const text = draftVal.trim();
                                if (!text) return;
                                if (isUnionMenu) {
                                  const nextU = {
                                    id: `union-${Date.now().toString(36)}`,
                                    slug: `union-${Date.now().toString(36)}`,
                                    nameBn: text,
                                    fullNameBn: text.includes('ইউনিয়ন') ? text : `${text} ইউনিয়ন`,
                                    keywordsBn: [text],
                                  };
                                  updateNavigationMenus(
                                    {
                                      ...menuConfig,
                                      unionItems: [...menuConfig.unionItems, nextU],
                                    },
                                    `ইউনিয়ন সাব-মেনু "${nextU.fullNameBn}" যোগ করা হয়েছে!`
                                  );
                                } else if (isEduMenu) {
                                  const nextE = {
                                    id: `edu-${Date.now().toString(36)}`,
                                    slug: `edu-${Date.now().toString(36)}`,
                                    labelBn: text,
                                    nameBn: text,
                                    descriptionBn: `${text} সংক্রান্ত সংবাদ ও বিজ্ঞপ্তি।`,
                                  };
                                  updateNavigationMenus(
                                    {
                                      ...menuConfig,
                                      educationItems: [...menuConfig.educationItems, nextE],
                                    },
                                    `শিক্ষা সাব-মেনু "${text}" যোগ করা হয়েছে!`
                                  );
                                } else if (isHealthMenu) {
                                  const nextH = {
                                    id: `health-${Date.now().toString(36)}`,
                                    slug: `health-${Date.now().toString(36)}`,
                                    labelBn: text,
                                    nameBn: text,
                                    descriptionBn: `${text} সংক্রান্ত স্বাস্থ্যসেবা ও সংবাদ।`,
                                  };
                                  updateNavigationMenus(
                                    {
                                      ...menuConfig,
                                      healthItems: [...menuConfig.healthItems, nextH],
                                    },
                                    `স্বাস্থ্য সাব-মেনু "${text}" যোগ করা হয়েছে!`
                                  );
                                } else {
                                  const nextSub = {
                                    id: `${navItem.slug}-${Date.now().toString(36)}`,
                                    slug: `${navItem.slug}-${Date.now().toString(36)}`,
                                    labelBn: text,
                                    nameBn: text,
                                    descriptionBn: `${navItem.labelBn} — ${text} সংক্রান্ত সংবাদ।`,
                                  };
                                  const updatedMain = menuConfig.mainNavItems.map((m) =>
                                    m.id === navItem.id
                                      ? { ...m, subItems: [...(m.subItems || []), nextSub] }
                                      : m
                                  );
                                  updateNavigationMenus(
                                    { ...menuConfig, mainNavItems: updatedMain },
                                    `"${navItem.labelBn}" মেনুতে সাব-মেনু "${text}" যোগ করা হয়েছে!`
                                  );
                                }
                                setInlineSubMenuDrafts((prev) => ({
                                  ...prev,
                                  [navItem.id]: '',
                                }));
                              }}
                              className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer shrink-0"
                            >
                              + সাব-মেনু যোগ
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add New Main Menu Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newMainMenuLabelBn.trim()) return;
                    const slug =
                      newMainMenuSlug.trim().toLowerCase().replace(/\s+/g, '-') ||
                      `menu-${Date.now().toString(36)}`;
                    const nextItem = {
                      id: `nav-${Date.now()}`,
                      slug,
                      labelBn: newMainMenuLabelBn.trim(),
                      visible: true,
                      dropdownType: 'none' as const,
                    };
                    updateNavigationMenus(
                      {
                        ...menuConfig,
                        mainNavItems: [...menuConfig.mainNavItems, nextItem],
                      },
                      `নতুন মেইন মেনু "${nextItem.labelBn}" যুক্ত করা হয়েছে!`
                    );
                    setNewMainMenuLabelBn('');
                    setNewMainMenuSlug('');
                  }}
                  className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-center gap-3"
                >
                  <span className="text-xs font-bold text-blue-950 shrink-0">
                    + নতুন মেইন মেনু যোগ করুন:
                  </span>
                  <input
                    type="text"
                    value={newMainMenuLabelBn}
                    onChange={(e) => setNewMainMenuLabelBn(e.target.value)}
                    placeholder="মেনুর বাংলা নাম (যেমন: প্রবাসী সংবাদ)"
                    className="flex-1 w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={newMainMenuSlug}
                    onChange={(e) => setNewMainMenuSlug(e.target.value)}
                    placeholder="ইংরেজি স্লাগ (ঐচ্ছিক)"
                    className="w-full sm:w-44 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer shrink-0"
                  >
                    + মেইন মেনু যোগ করুন
                  </button>
                </form>
              </div>

              {/* 2. EDUCATION & COLLEGE SUB-MENU CONTROL (শিক্ষা সংক্রান্ত ও কলেজ বালিকা -> মহিলা কলেজ) */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div className="pb-3 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">
                    ২. শিক্ষা সংক্রান্ত ও কলেজ সাব-মেনু কন্ট্রোল ({toBengaliDigits(menuConfig.educationItems.length)}টি শিক্ষা বিভাগ)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    কলেজ (বালিকা)-এর ভেতরে “সুবিদখালী মহিলা ডিগ্রি কলেজ (মহিলা কলেজ)” সহ যেকোনো স্কুল, মাদ্রাসা বা কলেজ সাব-মেনু যোগ কিংবা কেটে ফেলতে পারবেন।
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-3">
                    {menuConfig.educationItems.map((edu) => (
                      <div
                        key={edu.slug}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {edu.labelBn || edu.nameBn}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 ml-2">
                              ({edu.slug})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = menuConfig.educationItems.filter(
                                (item) => item.slug !== edu.slug
                              );
                              updateNavigationMenus(
                                { ...menuConfig, educationItems: updated },
                                `শিক্ষা সাব-মেনু "${edu.labelBn || edu.nameBn}" কেটে দেওয়া হয়েছে!`
                              );
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>কাটুন / মুছুন</span>
                          </button>
                        </div>

                        {/* Nested Sub-Items (e.g., সুবিদখালী মহিলা ডিগ্রি কলেজ under কলেজ বালিকা) */}
                        {edu.subItems && edu.subItems.length > 0 && (
                          <div className="pl-3 border-l-2 border-blue-400 space-y-1.5 pt-1">
                            <div className="text-[11px] font-bold text-blue-800">
                              অধীনস্থ কলেজ / প্রতিষ্ঠান সাব-মেনুসমূহ:
                            </div>
                            {edu.subItems.map((sub) => (
                              <div
                                key={sub.slug}
                                className="flex items-center justify-between gap-2 bg-white px-3 py-1.5 rounded border border-blue-200 text-xs"
                              >
                                <span className="font-bold text-slate-800">
                                  • {sub.labelBn || sub.nameBn}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedEdu = menuConfig.educationItems.map(
                                      (item) =>
                                        item.slug === edu.slug
                                          ? {
                                              ...item,
                                              subItems: (item.subItems || []).filter(
                                                (s) => s.slug !== sub.slug
                                              ),
                                            }
                                          : item
                                    );
                                    updateNavigationMenus(
                                      { ...menuConfig, educationItems: updatedEdu },
                                      `"${sub.labelBn || sub.nameBn}" সাব-মেনু থেকে কেটে দেওয়া হয়েছে!`
                                    );
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                  <span>কাটুন</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    {/* Add Nested College/Institution under an Education Item (e.g., কলেজ বালিকা) */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newCollegeLabelBn.trim()) return;
                        const cleanSubSlug =
                          newCollegeSlug.trim().toLowerCase().replace(/\s+/g, '-') ||
                          `inst-${Date.now().toString(36)}`;
                        const fullSubSlug = `${newCollegeParentSlug}:${cleanSubSlug}`;
                        const nextSubItem = {
                          id: fullSubSlug,
                          slug: fullSubSlug,
                          nameBn: newCollegeLabelBn.trim(),
                          labelBn: newCollegeLabelBn.trim(),
                          descriptionBn: `${newCollegeLabelBn.trim()}-এর শিক্ষা কার্যক্রম, ভর্তি, ফলাফল ও ক্যাম্পাস সংবাদ।`,
                        };
                        const updatedEdu = menuConfig.educationItems.map((item) =>
                          item.slug === newCollegeParentSlug
                            ? {
                                ...item,
                                subItems: [...(item.subItems || []), nextSubItem],
                              }
                            : item
                        );
                        updateNavigationMenus(
                          { ...menuConfig, educationItems: updatedEdu },
                          `"${newCollegeLabelBn.trim()}" সফলভাবে সাব-মেনুতে যুক্ত হয়েছে!`
                        );
                        setNewCollegeLabelBn('');
                        setNewCollegeSlug('');
                      }}
                      className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3"
                    >
                      <h4 className="text-xs font-bold text-blue-950">
                        + কলেজ (বালিকা) বা অন্য শিক্ষা মেনুর ভেতরে সাব-মেনু যোগ করুন
                      </h4>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          কোন শিক্ষা মেনুর ভেতরে যোগ করবেন?
                        </label>
                        <select
                          value={newCollegeParentSlug}
                          onChange={(e) => setNewCollegeParentSlug(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg"
                        >
                          {menuConfig.educationItems.map((item) => (
                            <option key={item.slug} value={item.slug}>
                              {item.labelBn || item.nameBn}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        value={newCollegeLabelBn}
                        onChange={(e) => setNewCollegeLabelBn(e.target.value)}
                        placeholder="প্রতিষ্ঠানের নাম (যেমন: সুবিদখালী মহিলা ডিগ্রি কলেজ)"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={newCollegeSlug}
                        onChange={(e) => setNewCollegeSlug(e.target.value)}
                        placeholder="ইংরেজি স্লাগ (ঐচ্ছিক, যেমন: mahila-college)"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        + সাব-মেনুতে প্রতিষ্ঠান যুক্ত করুন
                      </button>
                    </form>

                    {/* Add Top-level Education Menu Item */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newEduLabelBn.trim()) return;
                        const slug =
                          newEduSlug.trim().toLowerCase().replace(/\s+/g, '-') ||
                          `edu-${Date.now().toString(36)}`;
                        const normalizedSlug = slug.startsWith('edu-')
                          ? slug
                          : `edu-${slug}`;
                        const nextEdu = {
                          id: normalizedSlug,
                          slug: normalizedSlug,
                          nameBn: newEduLabelBn.trim(),
                          labelBn: newEduLabelBn.trim(),
                          descriptionBn: `মির্জাগঞ্জ উপজেলার ${newEduLabelBn.trim()} সংক্রান্ত সংবাদ ও বিজ্ঞপ্তি।`,
                        };
                        updateNavigationMenus(
                          {
                            ...menuConfig,
                            educationItems: [...menuConfig.educationItems, nextEdu],
                          },
                          `নতুন শিক্ষা সাব-মেনু "${nextEdu.labelBn}" যুক্ত হয়েছে!`
                        );
                        setNewEduLabelBn('');
                        setNewEduSlug('');
                      }}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                    >
                      <h4 className="text-xs font-bold text-slate-900">
                        + শিক্ষা সংক্রান্ত মেনুতে নতুন সাব-মেনু যোগ করুন
                      </h4>
                      <input
                        type="text"
                        value={newEduLabelBn}
                        onChange={(e) => setNewEduLabelBn(e.target.value)}
                        placeholder="শিক্ষা সাব-মেনুর নাম (যেমন: কারিগরি কলেজ)"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={newEduSlug}
                        onChange={(e) => setNewEduSlug(e.target.value)}
                        placeholder="ইংরেজি স্লাগ (যেমন: edu-polytechnic)"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                      >
                        + শিক্ষা সাব-মেনু যোগ করুন
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* 3. HEALTH & UNION SUB-MENUS CONTROL */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Health Menu Control */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
                    ৩. স্বাস্থ্য সংক্রান্ত সাব-মেনু কন্ট্রোল ({toBengaliDigits(menuConfig.healthItems.length)}টি)
                  </h3>
                  <div className="space-y-2">
                    {menuConfig.healthItems.map((hl) => (
                      <div
                        key={hl.slug}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2"
                      >
                        <span className="text-xs font-bold text-slate-900">
                          {hl.labelBn || hl.nameBn}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = menuConfig.healthItems.filter(
                              (item) => item.slug !== hl.slug
                            );
                            updateNavigationMenus(
                              { ...menuConfig, healthItems: updated },
                              `স্বাস্থ্য সাব-মেনু "${hl.labelBn || hl.nameBn}" কেটে দেওয়া হয়েছে!`
                            );
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>কাটুন</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newHealthLabelBn.trim()) return;
                      const slug =
                        newHealthSlug.trim().toLowerCase().replace(/\s+/g, '-') ||
                        `health-${Date.now().toString(36)}`;
                      const normalizedSlug = slug.startsWith('health-')
                        ? slug
                        : `health-${slug}`;
                      const nextHealth = {
                        id: normalizedSlug,
                        slug: normalizedSlug,
                        nameBn: newHealthLabelBn.trim(),
                        labelBn: newHealthLabelBn.trim(),
                        descriptionBn: `মির্জাগঞ্জ উপজেলার ${newHealthLabelBn.trim()} সংক্রান্ত স্বাস্থ্যসেবা ও সংবাদ।`,
                      };
                      updateNavigationMenus(
                        {
                          ...menuConfig,
                          healthItems: [...menuConfig.healthItems, nextHealth],
                        },
                        `নতুন স্বাস্থ্য সাব-মেনু "${nextHealth.labelBn}" যুক্ত হয়েছে!`
                      );
                      setNewHealthLabelBn('');
                      setNewHealthSlug('');
                    }}
                    className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="text"
                      value={newHealthLabelBn}
                      onChange={(e) => setNewHealthLabelBn(e.target.value)}
                      placeholder="নতুন স্বাস্থ্য সাব-মেনুর নাম..."
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer shrink-0"
                    >
                      + সাব-মেনু যোগ করুন
                    </button>
                  </form>
                </div>

                {/* Union Menu Control */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
                    ৪. ইউনিয়ন সাব-মেনু কন্ট্রোল ({toBengaliDigits(menuConfig.unionItems.length)}টি ইউনিয়ন)
                  </h3>
                  <div className="space-y-2">
                    {menuConfig.unionItems.map((u) => (
                      <div
                        key={u.slug}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2"
                      >
                        <span className="text-xs font-bold text-slate-900">
                          {u.fullNameBn}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = menuConfig.unionItems.filter(
                              (item) => item.slug !== u.slug
                            );
                            updateNavigationMenus(
                              { ...menuConfig, unionItems: updated },
                              `ইউনিয়ন সাব-মেনু "${u.fullNameBn}" কেটে দেওয়া হয়েছে!`
                            );
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>কাটুন</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newUnionNameBn.trim()) return;
                      const slug =
                        newUnionSlug.trim().toLowerCase().replace(/\s+/g, '-') ||
                        `union-${Date.now().toString(36)}`;
                      const normalizedSlug = slug.startsWith('union-')
                        ? slug
                        : `union-${slug}`;
                      const nextUnion = {
                        id: normalizedSlug,
                        slug: normalizedSlug,
                        nameBn: newUnionNameBn.trim(),
                        fullNameBn: newUnionNameBn.trim().includes('ইউনিয়ন')
                          ? newUnionNameBn.trim()
                          : `${newUnionNameBn.trim()} ইউনিয়ন`,
                        descriptionBn: `মির্জাগঞ্জ উপজেলার ${newUnionNameBn.trim()} ইউনিয়নের ১নং থেকে ৯নং ওয়ার্ডের সংবাদ।`,
                        keywordsBn: [newUnionNameBn.trim()],
                      };
                      updateNavigationMenus(
                        {
                          ...menuConfig,
                          unionItems: [...menuConfig.unionItems, nextUnion],
                        },
                        `নতুন ইউনিয়ন সাব-মেনু "${nextUnion.fullNameBn}" যুক্ত হয়েছে!`
                      );
                      setNewUnionNameBn('');
                      setNewUnionSlug('');
                    }}
                    className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="text"
                      value={newUnionNameBn}
                      onChange={(e) => setNewUnionNameBn(e.target.value)}
                      placeholder="নতুন ইউনিয়ন সাব-মেনুর নাম..."
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer shrink-0"
                    >
                      + সাব-মেনু যোগ করুন
                    </button>
                  </form>
                </div>
              </div>

              {/* 5. MAIN NEWS CATEGORIES (যোগ ও মুছা) */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                <div className="pb-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">
                    ৫. সংবাদ বিভাগ ও ট্যাগ ব্যবস্থাপনা ({toBengaliDigits(categories.length)}টি বিভাগ)
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-2.5">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {cat.nameBn}{' '}
                            <span className="text-xs font-normal text-slate-500">
                              ({cat.slug})
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {cat.descriptionBn}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-semibold text-emerald-700">
                            সক্রিয়
                          </span>
                          {onDeleteCategory && categories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteCategory(cat.id);
                                showToast(`"${cat.nameBn}" বিভাগটি মুছে ফেলা হয়েছে!`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>কাটুন</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handleAddCategorySubmit}
                    className="lg:col-span-5 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 self-start"
                  >
                    <h3 className="text-sm font-bold text-slate-900">
                      নতুন সংবাদ বিভাগ যোগ করুন
                    </h3>
                    <input
                      type="text"
                      value={newCatNameBn}
                      onChange={(e) => setNewCatNameBn(e.target.value)}
                      placeholder="বিভাগের বাংলা নাম (যেমন: কৃষি ও নদী)"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      placeholder="ইংরেজি স্লাগ (যেমন: river-agri)"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newCatDescBn}
                      onChange={(e) => setNewCatDescBn(e.target.value)}
                      placeholder="বিভাগের সংক্ষিপ্ত বিবরণ"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      + বিভাগ যুক্ত করুন
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              SECTION 8: ADMIN & PUBLIC ACCOUNTS (অ্যাডমিন ও পাবলিক যোগ করার অপশন)
             ================================================================ */}
          {activeSection === 'admin-roles' && (
            <div className="space-y-6">
              {/* Top Card: Create / Manage Admin (Name, Phone, Password) & Public (Phone, Password) */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>অ্যাডমিন ও পাবলিক অ্যাকাউন্ট কন্ট্রোল সেন্টার</span>
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                      অ্যাডমিন ও পাবলিক যোগ করার অপশন ({toBengaliDigits(adminAccounts.length)}টি অ্যাকাউন্ট)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      <strong>অ্যাডমিনের জন্য:</strong> নাম, ফোন নাম্বার ও পাসওয়ার্ড · <strong>পাবলিকের জন্য:</strong> শুধু নাম্বার ও পাসওয়ার্ড। লিংকে ঢুকলে পাবলিক ও অ্যাডমিন দুই অপশনই দেখাবে।
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginTab('public');
                        handleAdminLogout();
                      }}
                      className="px-3 py-2 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 cursor-pointer"
                    >
                      লিংক ভিউ দেখুন (পাবলিক | অ্যাডমিন)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left 7 Cols: Existing Admin & Public Accounts List */}
                  <div className="lg:col-span-7 space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        নিবন্ধিত অ্যাডমিন ও পাবলিক তালিকা
                      </h3>
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        {[
                          { id: 'all' as const, label: 'সকল' },
                          { id: 'admin' as const, label: 'অ্যাডমিন' },
                          { id: 'public' as const, label: 'পাবলিক' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setAccountListFilter(tab.id)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${
                              accountListFilter === tab.id
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {adminAccounts
                      .filter((acc) => {
                        if (accountListFilter === 'public') return acc.accountType === 'public';
                        if (accountListFilter === 'admin') return acc.accountType !== 'public';
                        return true;
                      })
                      .map((acc) => {
                        const isCurrentLoggedIn = adminSession?.id === acc.id;
                        const isPublic = acc.accountType === 'public';
                        return (
                          <div
                            key={acc.id}
                            className={`p-4 rounded-xl border transition-all space-y-3 ${
                              isCurrentLoggedIn
                                ? 'bg-blue-50/50 border-blue-400'
                                : isPublic
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-10 h-10 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 ${
                                    isPublic ? 'bg-emerald-700' : 'bg-slate-900'
                                  }`}
                                >
                                  {acc.avatarInitials}
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900">
                                      {acc.nameBn}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        isPublic
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-blue-600 text-white'
                                      }`}
                                    >
                                      {isPublic ? 'পাবলিক (Public)' : 'অ্যাডমিন (Admin)'}
                                    </span>
                                    {isCurrentLoggedIn && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white">
                                        বর্তমানে লগইনকৃত
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 font-mono mt-1">
                                    {!isPublic && (
                                      <span>👤 নাম: <strong>{acc.nameBn}</strong></span>
                                    )}
                                    <span>📱 নাম্বার: <strong>{acc.phone}</strong></span>
                                    <span>🔑 পাসওয়ার্ড: <strong>{acc.password}</strong></span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {!isCurrentLoggedIn && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickProfileLogin(acc)}
                                    className="px-2.5 py-1.5 text-[11px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                                  >
                                    লগইন
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleStartEditAdminAccount(acc)}
                                  className="px-2.5 py-1.5 text-[11px] font-bold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                  সম্পাদনা
                                </button>
                                {!acc.isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAdminAccount(acc.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                                    title="মুছে ফেলুন"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Permissions Badges */}
                            <div className="pt-2 border-t border-slate-200/80">
                              <div className="text-[11px] font-bold text-slate-600 mb-1.5">
                                প্রদত্ত পারমিশনসমূহ ({toBengaliDigits(acc.permissions.length)}টি):
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {ADMIN_PERMISSION_DEFINITIONS.map((permDef) => {
                                  const hasIt = acc.permissions.includes(permDef.key);
                                  return (
                                    <span
                                      key={permDef.key}
                                      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-semibold ${
                                        hasIt
                                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                          : 'bg-slate-100 text-slate-400 line-through'
                                      }`}
                                    >
                                      {hasIt ? (
                                        <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                                      ) : (
                                        <X className="w-3 h-3 text-slate-400 shrink-0" />
                                      )}
                                      <span>{permDef.labelBn}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Right 5 Cols: Dual Creator Panel — 1. অ্যাডমিন যোগ (নাম, ফোন ও পাসওয়ার্ড) | 2. পাবলিক যোগ (নাম্বার ও পাসওয়ার্ড) */}
                  <div className="lg:col-span-5 space-y-5 self-start">
                    {/* Mode Switcher Tabs */}
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setCreatorAccountType('admin')}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          creatorAccountType === 'admin'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>অ্যাডমিন যোগ করুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreatorAccountType('public')}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          creatorAccountType === 'public'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        <span>পাবলিক যোগ করুন</span>
                      </button>
                    </div>

                    {/* FORM A: PUBLIC ACCOUNT CREATOR (পাবলিকের জন্য নাম্বার ও পাসওয়ার্ড) */}
                    {creatorAccountType === 'public' ? (
                      <form
                        onSubmit={handleSavePublicAccountSubmit}
                        className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-4"
                      >
                        <div className="border-b border-emerald-200 pb-3">
                          <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                            <UserPlus className="w-4 h-4 text-emerald-700" />
                            <span>নতুন পাবলিক (Public) যোগ করুন</span>
                          </h3>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            পাবলিকের জন্য শুধু মোবাইল নাম্বার ও পাসওয়ার্ড দিলেই অ্যাকাউন্ট তৈরি হয়ে যাবে।
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            পাবলিক মোবাইল নাম্বার (Number) *
                          </label>
                          <input
                            type="text"
                            value={newPublicPhone}
                            onChange={(e) => setNewPublicPhone(e.target.value)}
                            placeholder="016XXXXXXXX"
                            className="w-full px-3 py-2.5 text-xs font-mono bg-white border border-emerald-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            পাসওয়ার্ড (Password) *
                          </label>
                          <input
                            type="text"
                            value={newPublicPassword}
                            onChange={(e) => setNewPublicPassword(e.target.value)}
                            placeholder="যেমন: 123456"
                            className="w-full px-3 py-2.5 text-xs font-mono bg-white border border-emerald-300 rounded-lg"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 px-4 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                        >
                          + পাবলিক অ্যাকাউন্ট যোগ করুন (নাম্বার ও পাসওয়ার্ড)
                        </button>
                      </form>
                    ) : (
                      /* FORM B: ADMIN ACCOUNT CREATOR (অ্যাডমিনের জন্য নাম, ফোন ও পাসওয়ার্ড) */
                      <form
                        onSubmit={handleSaveAdminAccountSubmit}
                        className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              <UserPlus className="w-4 h-4 text-blue-600" />
                              <span>
                                {editingAdminId
                                  ? 'অ্যাডমিন নাম, ফোন ও পাসওয়ার্ড সম্পাদনা'
                                  : 'নতুন অ্যাডমিন (Admin) যোগ করুন'}
                              </span>
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              অ্যাডমিনের জন্য নাম, ফোন নাম্বার এবং পাসওয়ার্ড দিন।
                            </p>
                          </div>
                          {editingAdminId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAdminId(null);
                                setNewAdminNameBn('');
                                setNewAdminRoleBn('সহযোগী অ্যাডমিন (Sub-Admin)');
                                setNewAdminPhone('');
                                setNewAdminPassword('');
                                setNewAdminPermissions(['compose_news', 'manage_articles']);
                              }}
                              className="text-[11px] font-bold text-red-600 hover:underline"
                            >
                              বাতিল করুন
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            অ্যাডমিনের নাম (Name) *
                          </label>
                          <input
                            type="text"
                            value={newAdminNameBn}
                            onChange={(e) => setNewAdminNameBn(e.target.value)}
                            placeholder="যেমন: মো. রফিকুল ইসলাম"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              ফোন নাম্বার (Phone) *
                            </label>
                            <input
                              type="text"
                              value={newAdminPhone}
                              onChange={(e) => setNewAdminPhone(e.target.value)}
                              placeholder="017XXXXXXXX"
                              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              পাসওয়ার্ড (Password) *
                            </label>
                            <input
                              type="text"
                              value={newAdminPassword}
                              onChange={(e) => setNewAdminPassword(e.target.value)}
                              placeholder="যেমন: 123456"
                              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            পদবি / পরিচয় (ঐচ্ছিক)
                          </label>
                          <input
                            type="text"
                            value={newAdminRoleBn}
                            onChange={(e) => setNewAdminRoleBn(e.target.value)}
                            placeholder="যেমন: সুবিদখালী প্রতিনিধি ও অ্যাডমিন"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                          />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800">
                              এই অ্যাডমিনকে যে যে পারমিশন দিতে চান টিক দিন: *
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setNewAdminPermissions(
                                  newAdminPermissions.length === ADMIN_PERMISSION_DEFINITIONS.length
                                    ? ['compose_news']
                                    : ADMIN_PERMISSION_DEFINITIONS.map((p) => p.key)
                                )
                              }
                              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                              {newAdminPermissions.length === ADMIN_PERMISSION_DEFINITIONS.length
                                ? 'শুধু সংবাদ লেখা রাখুন'
                                : 'সব পারমিশন দিন'}
                            </button>
                          </div>

                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {ADMIN_PERMISSION_DEFINITIONS.map((perm) => {
                              const checked = newAdminPermissions.includes(perm.key);
                              return (
                                <label
                                  key={perm.key}
                                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                    checked
                                      ? 'bg-blue-50/70 border-blue-300'
                                      : 'bg-white border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleToggleNewAdminPerm(perm.key)}
                                    className="mt-0.5 accent-blue-600"
                                  />
                                  <div>
                                    <div className="text-xs font-bold text-slate-900">
                                      {perm.labelBn}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                      {perm.descBn}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 px-4 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                        >
                          {editingAdminId
                            ? 'অ্যাডমিন আপডেট করুন'
                            : '+ অ্যাডমিন যোগ করুন (নাম, ফোন ও পাসওয়ার্ড)'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Card: Reporters Directory */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                <div className="pb-4 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900">
                    সংবাদ প্রতিবেদক তালিকা ({toBengaliDigits(effectiveAuthors.length)} জন প্রতিবেদক)
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-3">
                    {effectiveAuthors.map((au) => (
                      <div
                        key={au.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {au.avatarInitials}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">
                              {au.nameBn}
                            </div>
                            <div className="text-xs text-red-700 font-medium">
                              {au.roleBn}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              বিট: {au.beatBn} · কর্মক্ষেত্র: {au.locationBn}
                            </div>
                          </div>
                        </div>
                        {au.id !== 'author-1' && effectiveAuthors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReporterProfile(au.id, au.nameBn)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer shrink-0"
                            title={`${au.nameBn} মুছে ফেলুন`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>নাম মুছুন</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handleAddAuthorSubmit}
                    className="lg:col-span-5 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 self-start"
                  >
                    <h3 className="text-sm font-bold text-slate-900">
                      নতুন প্রতিবেদক বা ইউনিয়ন প্রতিনিধি যুক্ত করুন
                    </h3>
                    <input
                      type="text"
                      value={newAuthorNameBn}
                      onChange={(e) => setNewAuthorNameBn(e.target.value)}
                      placeholder="প্রতিবেদকের নাম *"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newAuthorRoleBn}
                      onChange={(e) => setNewAuthorRoleBn(e.target.value)}
                      placeholder="পদবি (যেমন: সুবিদখালী প্রতিনিধি) *"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newAuthorBeatBn}
                      onChange={(e) => setNewAuthorBeatBn(e.target.value)}
                      placeholder="বিট (যেমন: শিক্ষাঙ্গন ও ক্রীড়া)"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newAuthorLocationBn}
                      onChange={(e) => setNewAuthorLocationBn(e.target.value)}
                      placeholder="কর্মক্ষেত্র"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      + প্রতিবেদক যুক্ত করুন
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              SECTION 9: READER MESSAGES INBOX (পাঠক বার্তা ও মন্তব্য)
             ================================================================ */}
          {activeSection === 'inbox' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="pb-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  পাঠক বার্তা ও স্থানীয় সংবাদের তথ্য ইনবক্স ({toBengaliDigits(contactMessages.length)})
                </h2>
              </div>

              {contactMessages.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  ইনবক্সে কোনো বার্তা নেই।
                </div>
              ) : (
                <div className="space-y-4">
                  {contactMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl border ${
                        msg.status === 'unread'
                          ? 'bg-amber-50/40 border-amber-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {msg.senderName}
                          </span>
                          <span className="text-slate-500">
                            ({msg.senderEmail})
                          </span>
                          <span>·</span>
                          <span className="text-slate-500">
                            {msg.submittedAtBn}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleMessageStatus(msg.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100"
                          >
                            {msg.status === 'unread'
                              ? 'পঠিত হিসেবে চিহ্নিত করুন'
                              : 'অপঠিত করুন'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteMessage(msg.id)}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {msg.subject}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              SECTION 10: PORTAL SETTINGS, DEVELOPER & ADMIN PHOTO + LOGS
             ================================================================ */}
          {activeSection === 'settings-logs' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      পোর্টাল সেটিংস, ডেভেলপার ও অ্যাডমিনের ছবি এবং ফেসবুক লিঙ্ক
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ডেভেলপারের ছবি, অ্যাডমিনের ছবি এবং ডেভেলপারের ফেসবুক আইডি লিঙ্ক পরিবর্তন বা নতুন ছবি আপলোড করুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onResetDemoData();
                      showToast('সম্পূর্ণ ডেমো ডাটাবেস পুনরায় ডিফল্ট অবস্থায় রিসেট করা হয়েছে!');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ডেমো ডাটা রিসেট করুন</span>
                  </button>
                </div>

                <form onSubmit={handleSaveSettingsSubmit} className="space-y-6">
                  {/* DEVELOPER & ADMIN PHOTO UPLOAD CARDS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Developer Photo & Facebook ID Card */}
                    <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={developerPhotoUrl || '/assets/aistudio/____6f31a55b.png'}
                          alt={developerNameBn}
                          className="w-20 h-20 rounded-full object-cover border-3 border-amber-500 shadow-sm shrink-0 bg-slate-900"
                        />
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            ডেভেলপারের ছবি ও প্রোফাইল
                          </span>
                          <h3 className="text-base font-bold text-slate-900">
                            {developerNameBn || 'মোঃ আঃ কাইয়ূম'}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <input
                              ref={developerPhotoInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleDeveloperPhotoFileUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => developerPhotoInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>ডেভেলপারের ছবি আপলোড</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-amber-200/70">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            ডেভেলপারের নাম
                          </label>
                          <input
                            type="text"
                            value={developerNameBn}
                            onChange={(e) => setDeveloperNameBn(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            ডেভেলপার ফেইসবুক আইডি লিঙ্ক (Facebook Profile URL)
                          </label>
                          <input
                            type="url"
                            value={developerFacebookUrl}
                            onChange={(e) => setDeveloperFacebookUrl(e.target.value)}
                            placeholder="https://www.facebook.com/freelancerkaium143/"
                            className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            ডেভেলপার ছবির লিঙ্ক বা প্রিসেট নির্বাচন
                          </label>
                          <input
                            type="text"
                            value={developerPhotoUrl}
                            onChange={(e) => setDeveloperPhotoUrl(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg mb-2"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDeveloperPhotoUrl('/assets/aistudio/____6f31a55b.png')
                              }
                              className="px-2.5 py-1 text-[11px] font-bold bg-white border border-amber-300 rounded hover:bg-amber-100 cursor-pointer"
                            >
                              প্রিসেট ছবি ১ (স্টুডিও পোর্ট্রেট)
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeveloperPhotoUrl(
                                  '/assets/aistudio/c86a50b4-d4d1-4994-b557-8e1f3319ba81_e3e38474.jfif'
                                )
                              }
                              className="px-2.5 py-1 text-[11px] font-bold bg-white border border-amber-300 rounded hover:bg-amber-100 cursor-pointer"
                            >
                              প্রিসেট ছবি ২ (আউটডোর পোর্ট্রেট)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Admin Photo Card */}
                    <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            adminPhotoUrl ||
                            '/assets/aistudio/c86a50b4-d4d1-4994-b557-8e1f3319ba81_e3e38474.jfif'
                          }
                          alt={editorNameBn}
                          className="w-20 h-20 rounded-full object-cover border-3 border-emerald-500 shadow-sm shrink-0 bg-slate-900"
                        />
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            প্রধান অ্যাডমিনের ছবি ও প্রোফাইল
                          </span>
                          <h3 className="text-base font-bold text-slate-900">
                            {editorNameBn}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <input
                              ref={adminPhotoInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleAdminPhotoFileUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => adminPhotoInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>অ্যাডমিনের ছবি আপলোড</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-emerald-200/70">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            প্রধান অ্যাডমিন / ভারপ্রাপ্ত সম্পাদকের নাম
                          </label>
                          <input
                            type="text"
                            value={editorNameBn}
                            onChange={(e) => setEditorNameBn(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            অ্যাডমিনের ছবির লিঙ্ক বা প্রিসেট নির্বাচন
                          </label>
                          <input
                            type="text"
                            value={adminPhotoUrl}
                            onChange={(e) => setAdminPhotoUrl(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg mb-2"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setAdminPhotoUrl(
                                  '/assets/aistudio/c86a50b4-d4d1-4994-b557-8e1f3319ba81_e3e38474.jfif'
                                )
                              }
                              className="px-2.5 py-1 text-[11px] font-bold bg-white border border-emerald-300 rounded hover:bg-emerald-100 cursor-pointer"
                            >
                              প্রিসেট ছবি ১ (আউটডোর পোর্ট্রেট)
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setAdminPhotoUrl('/assets/aistudio/____6f31a55b.png')
                              }
                              className="px-2.5 py-1 text-[11px] font-bold bg-white border border-emerald-300 rounded hover:bg-emerald-100 cursor-pointer"
                            >
                              প্রিসেট ছবি ২ (স্টুডিও পোর্ট্রেট)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        পোর্টালের নাম (বাংলা)
                      </label>
                      <input
                        type="text"
                        value={portalNameBn}
                        onChange={(e) => setPortalNameBn(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ট্যাগলাইন / স্লোগান
                      </label>
                      <input
                        type="text"
                        value={taglineBn}
                        onChange={(e) => setTaglineBn(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer shadow-xs"
                  >
                    সকল সেটিংস ও ছবি সংরক্ষণ করুন
                  </button>
                </form>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-200">
                  সম্পাদকীয় অ্যাক্টিভিটি লগ (Editorial Audit Log)
                </h3>
                <div className="space-y-3">
                  {editorialActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-slate-900">
                          {act.actorNameBn}
                        </span>{' '}
                        <span className="text-slate-500">
                          ({act.actorRoleBn})
                        </span>{' '}
                        —{' '}
                        <span className="font-semibold text-blue-700">
                          {act.targetTitleBn}
                        </span>
                        <p className="text-slate-600 mt-0.5">{act.notesBn}</p>
                      </div>
                      <span className="text-slate-500 shrink-0 tabular-nums">
                        {act.timestampBn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
