export type ArticleStatus = 'published' | 'draft' | 'scheduled';

export type VisualTheme =
  | 'payra_river'
  | 'subidkhali_college'
  | 'pilot_school'
  | 'mirzaganj_shrine_mosque'
  | 'subidkhali_bazar'
  | 'mirzaganj_tourism'
  | 'metro'
  | 'agriculture'
  | 'tech'
  | 'sundarbans'
  | 'port'
  | 'cricket'
  | 'culture'
  | 'education'
  | 'energy'
  | 'diplomacy'
  | 'parliament'
  | 'economy';

export interface ArticleGalleryItem {
  theme: VisualTheme;
  imageUrl?: string;
  titleBn: string;
  captionBn: string;
  locationBn: string;
}

export interface ArticleSeoMeta {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImageAlt: string;
  keywords: string[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string[];
  pullQuote?: {
    quote: string;
    attribution: string;
  };
  keyTakeaways: string[];
  categorySlug: string;
  categoryNameBn: string;
  tags: string[];
  authorId: string;
  publishedAtIso: string;
  publishedAtBn: string;
  updatedAtBn: string;
  locationBn: string;
  readingTimeMinutes: number;
  viewCount: number;
  isFeatured: boolean;
  isLeadStory: boolean;
  isBreaking: boolean;
  isTrending?: boolean;
  isVideo: boolean;
  videoDurationBn?: string;
  videoTranscriptBn?: string;
  isOpinion?: boolean;
  isDemoContent: boolean;
  demoDisclaimerBn: string;
  status: ArticleStatus;
  scheduledForIso?: string;
  visualTheme: VisualTheme;
  imageUrl?: string;
  imageCaptionBn: string;
  galleryImages?: ArticleGalleryItem[];
  seoMeta: ArticleSeoMeta;
}

export interface Category {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  order: number;
  featuredInNav: boolean;
}

export interface Tag {
  id: string;
  slug: string;
  nameBn: string;
  articleCount: number;
}

export interface Author {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  roleBn: string;
  beatBn: string;
  bioBn: string;
  email: string;
  locationBn: string;
  avatarInitials: string;
  avatarUrl?: string;
  articlesCount: number;
}

export interface Advertisement {
  id: string;
  slotId: 'header-leaderboard' | 'sidebar-rectangle' | 'mid-page-banner' | 'article-inline';
  titleBn: string;
  sponsorNameBn: string;
  formatLabel: string;
  dimensions: string;
  ctaLabelBn: string;
  targetUrl: string;
  bannerImageUrl?: string;
  isActive: boolean;
  isDemoPlaceholder: boolean;
}

export interface NavSubMenuItem {
  id?: string;
  slug: string;
  labelBn: string;
  nameBn?: string;
  badgeBn?: string;
  descriptionBn: string;
  subItems?: NavSubMenuItem[];
}

export interface MainNavMenuItem {
  id: string;
  slug: string;
  labelBn: string;
  visible: boolean;
  dropdownType?: 'none' | 'union' | 'education' | 'health';
  subItems?: NavSubMenuItem[];
}

export interface PortalUnionMenuItem {
  id?: string;
  slug: string;
  nameBn: string;
  fullNameBn: string;
  descriptionBn?: string;
  keywordsBn?: string[];
}

export interface PortalMenuConfig {
  mainNavItems: MainNavMenuItem[];
  unionItems: PortalUnionMenuItem[];
  educationItems: NavSubMenuItem[];
  healthItems: NavSubMenuItem[];
}

export interface SiteSettings {
  portalNameBn: string;
  portalNameEn: string;
  taglineBn: string;
  editionDateBn: string;
  bengaliCalendarDateBn: string;
  editionLocationBn: string;
  breakingTickerActive: boolean;
  demoNoticeTextBn: string;
  editorNameBn: string;
  editorialEmail: string;
  newsroomPhoneBn: string;
  officeAddressBn: string;
  adminPhotoUrl?: string;
  developerNameBn?: string;
  developerRoleBn?: string;
  developerPhotoUrl?: string;
  developerFacebookUrl?: string;
  navigationMenus?: PortalMenuConfig;
  firebaseStatus: {
    connected: false;
    phaseNote: string;
    plannedServices: ('Authentication' | 'Firestore' | 'Cloud Storage')[];
  };
}

export interface EditorialActivity {
  id: string;
  actionType:
    | 'published'
    | 'draft_saved'
    | 'scheduled'
    | 'breaking_updated'
    | 'settings_updated'
    | 'article_created'
    | 'article_updated'
    | 'article_deleted'
    | 'ad_updated';
  actorNameBn: string;
  actorRoleBn: string;
  targetTitleBn: string;
  timestampBn: string;
  notesBn: string;
}

export interface ContactMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  category: 'news_tip' | 'correction' | 'advertising' | 'general';
  message: string;
  submittedAtBn: string;
  status: 'unread' | 'reviewed';
}

export interface NewsPortalDataStore {
  settings: SiteSettings;
  categories: Category[];
  tags: Tag[];
  authors: Author[];
  articles: Article[];
  advertisements: Advertisement[];
  editorialActivities: EditorialActivity[];
  contactMessages: ContactMessage[];
}

export type PortalPublicView =
  | 'home'
  | 'category'
  | 'article'
  | 'author'
  | 'archive'
  | 'about'
  | 'contact'
  | 'editorial-policy'
  | 'privacy-policy'
  | 'terms'
  | 'admin';
