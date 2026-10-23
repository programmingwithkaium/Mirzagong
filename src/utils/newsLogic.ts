import type {
  Article,
  Author,
  Category,
  MainNavMenuItem,
  NavSubMenuItem,
  PortalMenuConfig,
  SiteSettings,
} from '../types/news.ts';

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliDigits(input: number | string): string {
  return String(input).replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)] ?? digit);
}

export function formatBengaliNumber(num: number): string {
  return toBengaliDigits(num.toLocaleString('en-IN'));
}

export function estimateReadingTimeMinutes(paragraphs: string[]): number {
  const totalWords = paragraphs
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(totalWords / 140));
}

export interface MirzaganjUnionInfo {
  slug: string;
  nameBn: string;
  fullNameBn: string;
  keywordsBn: string[];
}

export const MIRZAGANJ_UNIONS: MirzaganjUnionInfo[] = [
  {
    slug: 'union-mirzaganj',
    nameBn: 'মির্জাগঞ্জ',
    fullNameBn: 'মির্জাগঞ্জ ইউনিয়ন',
    keywordsBn: ['মির্জাগঞ্জ ইউনিয়ন', 'মির্জাগঞ্জ সদর', 'পায়রা', 'মাজার শরীফ'],
  },
  {
    slug: 'union-madhabkhali',
    nameBn: 'মাধবখালী',
    fullNameBn: 'মাধবখালী ইউনিয়ন',
    keywordsBn: ['মাধবখালী', 'চৈতা', 'রামপুর', 'কাঁঠালতলী'],
  },
  {
    slug: 'union-amragachhia',
    nameBn: 'আমড়াগাছিয়া',
    fullNameBn: 'আমড়াগাছিয়া ইউনিয়ন',
    keywordsBn: ['আমড়াগাছিয়া', 'শ্রীমন্ত', 'ময়দান'],
  },
  {
    slug: 'union-deuli',
    nameBn: 'দেউলী',
    fullNameBn: 'দেউলী ইউনিয়ন',
    keywordsBn: ['দেউলী', 'দেউলী সুবিদখালী'],
  },
  {
    slug: 'union-subidkhali',
    nameBn: 'সুবিদখালী',
    fullNameBn: 'সুবিদখালী ইউনিয়ন',
    keywordsBn: ['সুবিদখালী', 'কলেজ রোড', 'পাইলট স্কুল', 'বন্দর'],
  },
  {
    slug: 'union-kakrabunia',
    nameBn: 'কাকড়াবুনিয়া',
    fullNameBn: 'কাকড়াবুনিয়া ইউনিয়ন',
    keywordsBn: ['কাকড়াবুনিয়া', 'গাবুয়া'],
  },
  {
    slug: 'union-majidbaria',
    nameBn: 'মসজিদবাড়ীয়া',
    fullNameBn: 'মসজিদবাড়ীয়া ইউনিয়ন',
    keywordsBn: ['মসজিদবাড়ীয়া', 'মজিদবাড়িয়া', 'শাহী মসজিদ'],
  },
];

export interface MirzaganjWardInfo {
  id: string;
  number: number;
  labelBn: string;
}

export const MIRZAGANJ_WARDS: MirzaganjWardInfo[] = [
  { id: 'ward-1', number: 1, labelBn: '১নং ওয়ার্ড' },
  { id: 'ward-2', number: 2, labelBn: '২নং ওয়ার্ড' },
  { id: 'ward-3', number: 3, labelBn: '৩নং ওয়ার্ড' },
  { id: 'ward-4', number: 4, labelBn: '৪নং ওয়ার্ড' },
  { id: 'ward-5', number: 5, labelBn: '৫নং ওয়ার্ড' },
  { id: 'ward-6', number: 6, labelBn: '৬নং ওয়ার্ড' },
  { id: 'ward-7', number: 7, labelBn: '৭নং ওয়ার্ড' },
  { id: 'ward-8', number: 8, labelBn: '৮নং ওয়ার্ড' },
  { id: 'ward-9', number: 9, labelBn: '৯নং ওয়ার্ড' },
];

export type SubMenuItemInfo = NavSubMenuItem;

export const MIRZAGANJ_EDUCATION_ITEMS: SubMenuItemInfo[] = [
  {
    slug: 'edu-primary',
    labelBn: 'সরকারী প্রাথমিক বিদ্যালয়',
    badgeBn: 'প্রাথমিক শিক্ষা',
    descriptionBn:
      'মির্জাগঞ্জ উপজেলার সকল সরকারি প্রাথমিক বিদ্যালয়ের শিক্ষা কার্যক্রম, বৃত্তি, মিড-ডে মিল ও অবকাঠামো উন্নয়ন সংবাদ।',
  },
  {
    slug: 'edu-junior-high',
    labelBn: 'জুনিয়র উচ্চ বিদ্যালয়',
    badgeBn: 'নিম্ন মাধ্যমিক',
    descriptionBn:
      'মির্জাগঞ্জ উপজেলার জুনিয়র উচ্চ বিদ্যালয়সমূহের একাডেমিক কার্যক্রম, পাঠদান ও সহশিক্ষা কার্যক্রমের সংবাদ।',
  },
  {
    slug: 'edu-high-coed',
    labelBn: 'উচ্চ বিদ্যালয় (সহশিক্ষা)',
    badgeBn: 'পাইলট ও মাধ্যমিক',
    descriptionBn:
      'সুবিদখালী রইচ উদ্দিন পাইলট উচ্চ বিদ্যালয়সহ মির্জাগঞ্জের সকল সহশিক্ষা মাধ্যমিক বিদ্যালয়ের বিজ্ঞানাগার, ফলাফল ও ক্রীড়া সংবাদ।',
    subItems: [
      {
        slug: 'edu-high-coed:subidkhali-pilot-school',
        labelBn: 'সুবিদখালী সরকারি রহমান ইসহাক পাইলট উচ্চ বিদ্যালয়',
        badgeBn: 'পাইলট স্কুল',
        descriptionBn:
          'সুবিদখালী সরকারি রহমান ইসহাক পাইলট মাধ্যমিক উচ্চ বিদ্যালয়ের একাডেমিক, বিজ্ঞানাগার ও ক্রীড়া সংবাদ।',
      },
    ],
  },
  {
    slug: 'edu-high-girls',
    labelBn: 'উচ্চ বিদ্যালয় (বালিকা)',
    badgeBn: 'বালিকা বিদ্যালয়',
    descriptionBn:
      'সুবিদখালী ও মির্জাগঞ্জের বালিকা উচ্চ বিদ্যালয়সমূহের নারী শিক্ষা, উপবৃত্তি, আইসিটি ল্যাব ও সাংস্কৃতিক সংবাদ।',
  },
  {
    slug: 'edu-dakhil',
    labelBn: 'দাখিল মাদ্রাসা',
    badgeBn: 'মাদ্রাসা শিক্ষা',
    descriptionBn:
      'মির্জাগঞ্জ উপজেলার দাখিল মাদ্রাসাসমূহের পাঠদান, দাখিল পরীক্ষা ও ডিজিটাল ল্যাব সংক্রান্ত সংবাদ।',
  },
  {
    slug: 'edu-alim',
    labelBn: 'আলিম মাদ্রাসা',
    badgeBn: 'মাদ্রাসা শিক্ষা',
    descriptionBn:
      'মির্জাগঞ্জ উপজেলার আলিম মাদ্রাসাসমূহের উচ্চতর দ্বীনি ও আধুনিক শিক্ষা কার্যক্রমের সংবাদ।',
  },
  {
    slug: 'edu-fazil',
    labelBn: 'ফাজিল মাদ্রাসা',
    badgeBn: 'স্নাতক সমমান',
    descriptionBn:
      'মির্জাগঞ্জ দরবার শরীফ সংলগ্ন ও উপজেলার ফাজিল মাদ্রাসাসমূহের একাডেমিক ও ক্যাম্পাস প্রতিবেদন।',
  },
  {
    slug: 'edu-kamil',
    labelBn: 'কামিল মাদ্রাসা',
    badgeBn: 'উচ্চতর মাদ্রাসা',
    descriptionBn:
      'কামিল মাদ্রাসা ও উচ্চতর ইসলামি শিক্ষা প্রতিষ্ঠানের গবেষণা, সেমিনার ও ফলাফল সংক্রান্ত সংবাদ।',
  },
  {
    slug: 'edu-college-coed',
    labelBn: 'কলেজ (সহপাঠ)',
    badgeBn: 'সরকারি ও ডিগ্রি কলেজ',
    descriptionBn:
      'ঐতিহ্যবাহী সুবিদখালী সরকারি কলেজ ও আখতার হোসেন চৌধুরী মেমোরিয়াল ডিগ্রি কলেজসহ মির্জাগঞ্জের সহপাঠ কলেজসমূহের সংবাদ।',
    subItems: [
      {
        slug: 'edu-college-coed:subidkhali-govt-college',
        labelBn: 'সুবিদখালী সরকারি কলেজ',
        badgeBn: 'EIIN: ১০২৪৭১',
        descriptionBn:
          '১৯৭২ সালে প্রতিষ্ঠিত ঐতিহ্যবাহী সুবিদখালী সরকারি কলেজের একাডেমিক ভবন, অনার্স-ডিগ্রি ও এইচএসসি সংবাদ।',
      },
      {
        slug: 'edu-college-coed:akhtar-hossain-college',
        labelBn: 'আখতার হোসেন চৌধুরী মেমোরিয়াল ডিগ্রি কলেজ',
        badgeBn: 'কাঁঠালতলী',
        descriptionBn:
          'মাধবখালী ইউনিয়নের কাঁঠালতলীতে অবস্থিত আখতার হোসেন চৌধুরী মেমোরিয়াল ডিগ্রি কলেজের সংবাদ।',
      },
    ],
  },
  {
    slug: 'edu-college-girls',
    labelBn: 'কলেজ (বালিকা)',
    badgeBn: 'মহিলা কলেজ',
    descriptionBn:
      'সুবিদখালী মহিলা ডিগ্রি কলেজ (মহিলা কলেজ) ও ছাত্রীদের উচ্চশিক্ষা প্রতিষ্ঠানের ভর্তি, নবীন বরণ ও একাডেমিক সাফল্যের সংবাদ।',
    subItems: [
      {
        slug: 'edu-college-girls:subidkhali-mahila-college',
        labelBn: 'সুবিদখালী মহিলা ডিগ্রি কলেজ (মহিলা কলেজ)',
        badgeBn: 'স্থাপিত: ১৯৯৫',
        descriptionBn:
          'পটুয়াখালী মির্জাগঞ্জের সুবিদখালী মহিলা ডিগ্রি কলেজের একাদশ শ্রেণির নবীন বরণ, ভর্তি ও একাডেমিক কার্যক্রমের সংবাদ।',
      },
    ],
  },
];

export const MIRZAGANJ_HEALTH_ITEMS: SubMenuItemInfo[] = [
  {
    slug: 'health-upazila-complex',
    labelBn: 'উপজেলা স্বাস্থ্য কমপ্লেক্স',
    badgeBn: '৫০ শয্যা',
    descriptionBn:
      'মির্জাগঞ্জ উপজেলা স্বাস্থ্য কমপ্লেক্সের জরুরি বিভাগ, বহির্বিভাগ, মাতৃস্বাস্থ্য, এক্স-রে ও প্যাথলজি সেবার সর্বশেষ সংবাদ।',
  },
  {
    slug: 'health-family-welfare',
    labelBn: 'উপজেলা স্বাস্থ্য ও পরিবার কল্যাণ কেন্দ্র',
    badgeBn: 'ইউনিয়ন স্বাস্থ্যকেন্দ্র',
    descriptionBn:
      'মির্জাগঞ্জের ইউনিয়ন পর্যায়ের স্বাস্থ্য ও পরিবার কল্যাণ কেন্দ্রসমূহে মা ও শিশু স্বাস্থ্যসেবা এবং বিনামূল্যে ওষুধ বিতরণ সংবাদ।',
  },
  {
    slug: 'health-upazila-beds',
    labelBn: 'বেডের সংখ্যা (উপজেলা স্বাস্থ্য কমপ্লেক্স)',
    badgeBn: '৫০টি বেড',
    descriptionBn:
      'মির্জাগঞ্জ উপজেলা স্বাস্থ্য কমপ্লেক্সের অনুমোদিত ৫০টি বেড, কেবিন সুবিধা, অক্সিজেন সরবরাহ ও রোগীদের শয্যা ব্যবস্থাপনার তথ্য ও প্রতিবেদন।',
  },
  {
    slug: 'health-kathaltoli-complex',
    labelBn: 'কাঁঠালতলী স্বাস্থ্য কমপ্লেক্স',
    badgeBn: 'আঞ্চলিক স্বাস্থ্যকেন্দ্র',
    descriptionBn:
      'কাঁঠালতলী স্বাস্থ্য কমপ্লেক্স ও উপ-স্বাস্থ্যকেন্দ্রের চিকিৎসা সেবা, চিকিৎসক উপস্থিতি এবং গ্রামীণ রোগীদের সেবা সংক্রান্ত সংবাদ।',
  },
  {
    slug: 'health-kathaltoli-beds',
    labelBn: 'বেডের সংখ্যা (কাঁঠালতলী স্বাস্থ্য কমপ্লেক্স)',
    badgeBn: '১০-২০ শয্যা',
    descriptionBn:
      'কাঁঠালতলী স্বাস্থ্য কমপ্লেক্সের পর্যবেক্ষণ ও ভর্তি শয্যা (বেডের সংখ্যা), প্রসূতি সেবা বেড ও জরুরি চিকিৎসা সুবিধার বিস্তারিত তথ্য।',
  },
  {
    slug: 'health-community-clinic',
    labelBn: 'কমিউনিটি ক্লিনিক',
    badgeBn: 'গ্রামীণ স্বাস্থ্যসেবা',
    descriptionBn:
      'মির্জাগঞ্জ উপজেলার ৬টি ইউনিয়নের ওয়ার্ড পর্যায়ে অবস্থিত কমিউনিটি ক্লিনিকসমূহের প্রাথমিক চিকিৎসা ও টিকাদান কর্মসূচির সংবাদ।',
  },
];

export const DEFAULT_MAIN_NAV_ITEMS: MainNavMenuItem[] = [
  {
    id: 'nav-trending',
    slug: 'trending',
    labelBn: 'সর্বশেষ',
    visible: true,
    dropdownType: 'none',
  },
  {
    id: 'nav-union',
    slug: 'mirzaganj',
    labelBn: 'ইউনিয়ন',
    visible: true,
    dropdownType: 'union',
  },
  {
    id: 'nav-education',
    slug: 'education',
    labelBn: 'শিক্ষা সংক্রান্ত',
    visible: true,
    dropdownType: 'education',
  },
  {
    id: 'nav-health',
    slug: 'health',
    labelBn: 'স্বাস্থ্য সংক্রান্ত',
    visible: true,
    dropdownType: 'health',
  },
  {
    id: 'nav-sports',
    slug: 'sports',
    labelBn: 'খেলাধুলা',
    visible: true,
    dropdownType: 'none',
  },
  {
    id: 'nav-technology',
    slug: 'technology',
    labelBn: 'প্রযুক্তি',
    visible: true,
    dropdownType: 'none',
  },
  {
    id: 'nav-culture',
    slug: 'culture',
    labelBn: 'দর্শনীয় স্থান',
    visible: true,
    dropdownType: 'none',
  },
];

export function getEffectiveMenuConfig(settings?: SiteSettings): PortalMenuConfig {
  const custom = settings?.navigationMenus;
  return {
    mainNavItems: Array.isArray(custom?.mainNavItems)
      ? custom.mainNavItems
      : DEFAULT_MAIN_NAV_ITEMS,
    unionItems: Array.isArray(custom?.unionItems)
      ? custom.unionItems
      : MIRZAGANJ_UNIONS,
    educationItems: Array.isArray(custom?.educationItems)
      ? custom.educationItems
      : MIRZAGANJ_EDUCATION_ITEMS,
    healthItems: Array.isArray(custom?.healthItems)
      ? custom.healthItems
      : MIRZAGANJ_HEALTH_ITEMS,
  };
}

export function resolveCategoryMeta(
  categorySlug: string,
  categories: Category[],
  menuConfigOrSettings?: PortalMenuConfig | SiteSettings
): {
  titleBn: string;
  descriptionBn: string;
  unionInfo?: MirzaganjUnionInfo;
  wardInfo?: MirzaganjWardInfo;
} {
  const menuConfig: PortalMenuConfig | undefined =
    menuConfigOrSettings && 'mainNavItems' in menuConfigOrSettings
      ? menuConfigOrSettings
      : menuConfigOrSettings
      ? getEffectiveMenuConfig(menuConfigOrSettings)
      : undefined;

  const unionsList = menuConfig?.unionItems ?? MIRZAGANJ_UNIONS;
  const eduList = menuConfig?.educationItems ?? MIRZAGANJ_EDUCATION_ITEMS;
  const healthList = menuConfig?.healthItems ?? MIRZAGANJ_HEALTH_ITEMS;

  if (categorySlug.startsWith('union-')) {
    const [unionSlug, wardId] = categorySlug.split(':');
    const unionInfo = unionsList.find((u) => u.slug === unionSlug);
    const wardInfo = wardId ? MIRZAGANJ_WARDS.find((w) => w.id === wardId) : undefined;

    if (unionInfo && wardInfo) {
      return {
        titleBn: `${unionInfo.fullNameBn} · ${wardInfo.labelBn}-এর সংবাদ`,
        descriptionBn: `মির্জাগঞ্জ উপজেলার ${unionInfo.fullNameBn}-এর অন্তর্গত ${wardInfo.labelBn} এলাকার উন্নয়ন, জনদুর্ভোগ, শিক্ষা, কৃষি ও সর্বশেষ স্থানীয় সংবাদ।`,
        unionInfo,
        wardInfo,
      };
    }
    if (unionInfo) {
      return {
        titleBn: `${unionInfo.fullNameBn}-এর সকল সংবাদ (১নং - ৯নং ওয়ার্ড)`,
        descriptionBn: `মির্জাগঞ্জ উপজেলার ${unionInfo.fullNameBn}-এর ১নং থেকে ৯নং ওয়ার্ডের গ্রাম, বাজার, রাস্তাঘাট, শিক্ষাপ্রতিষ্ঠান ও জনপদের ছবিসহ সংবাদ।`,
        unionInfo,
      };
    }
  }

  for (const eduItem of eduList) {
    if (eduItem.slug === categorySlug) {
      return {
        titleBn: `শিক্ষা সংক্রান্ত · ${eduItem.labelBn}`,
        descriptionBn: eduItem.descriptionBn,
      };
    }
    if (eduItem.subItems) {
      const subMatch = eduItem.subItems.find((s) => s.slug === categorySlug);
      if (subMatch) {
        return {
          titleBn: `${eduItem.labelBn} · ${subMatch.labelBn}`,
          descriptionBn: subMatch.descriptionBn,
        };
      }
    }
  }

  for (const healthItem of healthList) {
    if (healthItem.slug === categorySlug) {
      return {
        titleBn: `স্বাস্থ্য সংক্রান্ত · ${healthItem.labelBn}`,
        descriptionBn: healthItem.descriptionBn,
      };
    }
    if (healthItem.subItems) {
      const subMatch = healthItem.subItems.find((s) => s.slug === categorySlug);
      if (subMatch) {
        return {
          titleBn: `${healthItem.labelBn} · ${subMatch.labelBn}`,
          descriptionBn: subMatch.descriptionBn,
        };
      }
    }
  }

  if (categorySlug === 'health') {
    return {
      titleBn: 'স্বাস্থ্য সংক্রান্ত সকল সংবাদ ও হাসপাতালের তথ্য',
      descriptionBn:
        'মির্জাগঞ্জ উপজেলা স্বাস্থ্য কমপ্লেক্স, পরিবার কল্যাণ কেন্দ্র, কাঁঠালতলী স্বাস্থ্য কমপ্লেক্স, বেডের সংখ্যা ও কমিউনিটি ক্লিনিকের সর্বশেষ সংবাদ।',
    };
  }

  if (categorySlug === 'college') {
    return {
      titleBn: 'কলেজ সংবাদ (সুবিদখালী সরকারি কলেজ ও মহিলা কলেজ)',
      descriptionBn:
        'সুবিদখালী সরকারি কলেজ, সুবিদখালী মহিলা কলেজসহ মির্জাগঞ্জ উপজেলার সকল কলেজের ভর্তি, পরীক্ষা, বিজ্ঞান ভবন, আইসিটি ল্যাব ও ক্যাম্পাস সংবাদ।',
    };
  }

  if (categorySlug === 'school') {
    return {
      titleBn: 'স্কুল সংবাদ (সুবিদখালী পাইলট স্কুল ও সকল বিদ্যালয়)',
      descriptionBn:
        'সুবিদখালী রইচ উদ্দিন পাইলট উচ্চ বিদ্যালয়, মাধ্যমিক ও প্রাথমিক বিদ্যালয়সমূহের একাডেমিক কার্যক্রম, ক্রীড়া ও শিক্ষা সংবাদ।',
    };
  }

  if (categorySlug === 'trending') {
    return {
      titleBn: 'সর্বশেষ ও ট্রেন্ডিং সংবাদ',
      descriptionBn:
        'মির্জাগঞ্জ জনপদ, পায়রা উপকূল এবং সারাদেশের এই মুহূর্তের সর্বশেষ ও সবচেয়ে আলোচিত সংবাদসমূহ।',
    };
  }

  if (categorySlug === 'video') {
    return {
      titleBn: 'ভিডিও সংবাদ ও প্রামাণ্যচিত্র',
      descriptionBn:
        'মাঠপর্যায়ের প্রামাণ্যচিত্র ও মাল্টিমিডিয়া ভিডিও প্রতিবেদন (ডেমো)।',
    };
  }

  const mainNavMatch = menuConfig?.mainNavItems.find((m) => m.slug === categorySlug);
  const activeCategoryObj = categories.find((c) => c.slug === categorySlug);
  return {
    titleBn: activeCategoryObj?.nameBn ?? mainNavMatch?.labelBn ?? 'সকল সংবাদ',
    descriptionBn:
      activeCategoryObj?.descriptionBn ??
      'নিউজ মির্জাগঞ্জের বিভাগীয় সংবাদ সংগ্রহশালা।',
  };
}

export interface ArticleFilterOptions {
  categorySlug?: string;
  tag?: string;
  authorId?: string;
  searchQuery?: string;
  onlyPublished?: boolean;
  onlyTrending?: boolean;
}

export function filterArticles(articles: Article[], options: ArticleFilterOptions): Article[] {
  const {
    categorySlug,
    tag,
    authorId,
    searchQuery,
    onlyPublished = true,
    onlyTrending = false,
  } = options;
  const normalizedQuery = searchQuery?.trim().toLowerCase() ?? '';

  const basePublished = articles.filter((article) => {
    if (onlyPublished && article.status !== 'published') return false;
    if (onlyTrending && !article.isTrending) return false;
    if (authorId && article.authorId !== authorId) return false;
    if (tag && !article.tags.includes(tag)) return false;

    if (normalizedQuery.length > 0) {
      const searchableText = [
        article.title,
        article.subtitle,
        article.summary,
        article.categoryNameBn,
        article.locationBn,
        ...article.tags,
        ...article.content,
      ]
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });

  if (!categorySlug || categorySlug === 'all') {
    return basePublished;
  }

  if (categorySlug === 'video') {
    return basePublished.filter((a) => a.isVideo);
  }

  if (categorySlug === 'trending') {
    return basePublished.filter((a) => a.isTrending);
  }

  if (categorySlug === 'opinion') {
    return basePublished.filter((a) => a.isOpinion || a.categorySlug === 'opinion');
  }

  // १. শিক্ষা সংক্রান্ত (সামগ্রিক শিক্ষা বিভাগ)
  if (categorySlug === 'education') {
    return basePublished.filter(
      (a) =>
        a.categorySlug === 'education' ||
        a.categorySlug.startsWith('edu-') ||
        a.visualTheme === 'subidkhali_college' ||
        a.visualTheme === 'pilot_school'
    );
  }

  // ২. কলেজ (বালিকা) এবং সুবিদখালী মহিলা ডিগ্রি কলেজ (মহিলা কলেজ)
  if (
    categorySlug === 'edu-college-girls' ||
    categorySlug === 'edu-college-girls:subidkhali-mahila-college'
  ) {
    return basePublished.filter(
      (a) =>
        a.categorySlug === categorySlug ||
        a.categorySlug === 'edu-college-girls' ||
        a.slug.includes('womens-degree-college') ||
        a.title.includes('মহিলা ডিগ্রি কলেজ') ||
        a.title.includes('মহিলা কলেজ') ||
        a.tags.some((t) => t.includes('মহিলা-ডিগ্রি-কলেজ') || t.includes('মহিলা-কলেজ'))
    );
  }

  // ৩. কলেজ (সহপাঠ) এবং এর অধীনস্থ কলেজসমূহ
  if (categorySlug === 'edu-college-coed') {
    return basePublished.filter(
      (a) =>
        a.categorySlug === 'edu-college-coed' ||
        a.categorySlug.startsWith('edu-college-coed:') ||
        ((a.title.includes('সুবিদখালী সরকারি কলেজ') ||
          a.title.includes('আখতার হোসেন চৌধুরী')) &&
          !a.title.includes('মহিলা ডিগ্রি কলেজ'))
    );
  }

  if (categorySlug === 'edu-college-coed:subidkhali-govt-college') {
    return basePublished.filter(
      (a) =>
        a.categorySlug === categorySlug ||
        (a.title.includes('সুবিদখালী সরকারি কলেজ') &&
          !a.title.includes('মহিলা ডিগ্রি কলেজ'))
    );
  }

  if (categorySlug === 'edu-college-coed:akhtar-hossain-college') {
    return basePublished.filter(
      (a) =>
        a.categorySlug === categorySlug ||
        a.title.includes('আখতার হোসেন চৌধুরী')
    );
  }

  if (categorySlug === 'college') {
    return basePublished.filter(
      (a) =>
        a.categorySlug === 'college' ||
        a.categorySlug.startsWith('edu-college') ||
        a.visualTheme === 'subidkhali_college' ||
        a.title.includes('কলেজ') ||
        a.tags.some((t) => t.includes('কলেজ'))
    );
  }

  // ৪. উচ্চ বিদ্যালয় (সহশিক্ষা) ও পাইলট স্কুল
  if (
    categorySlug === 'school' ||
    categorySlug === 'edu-high-coed' ||
    categorySlug === 'edu-high-coed:subidkhali-pilot-school'
  ) {
    return basePublished.filter(
      (a) =>
        a.categorySlug === categorySlug ||
        a.categorySlug === 'edu-high-coed' ||
        a.visualTheme === 'pilot_school' ||
        a.title.includes('পাইলট মাধ্যমিক উচ্চ বিদ্যালয়') ||
        a.title.includes('পাইলট উচ্চ বিদ্যালয়')
    );
  }

  // ৫. অন্যান্য সুনির্দিষ্ট শিক্ষা সাব-মেনু (কোনো খবর না থাকলে খালি অ্যারে [] রিটার্ন করবে যাতে "কোনো খবর নেই!" দেখায়)
  if (categorySlug.startsWith('edu-')) {
    const specificKeywordsMap: Record<string, string[]> = {
      'edu-primary': ['প্রাথমিক বিদ্যালয়', ' সরকারি প্রাথমিক'],
      'edu-junior-high': ['জুনিয়র উচ্চ বিদ্যালয়', 'নিম্ন মাধ্যমিক'],
      'edu-high-girls': ['বালিকা উচ্চ বিদ্যালয়', 'বালিকা বিদ্যালয়'],
      'edu-dakhil': ['দাখিল মাদ্রাসা'],
      'edu-alim': ['আলিম মাদ্রাসা'],
      'edu-fazil': ['ফাজিল মাদ্রাসা'],
      'edu-kamil': ['কামিল মাদ্রাসা'],
    };
    const kws = specificKeywordsMap[categorySlug];
    return basePublished.filter((a) => {
      if (a.categorySlug === categorySlug) return true;
      if (!kws) return false;
      const hay = `${a.title} ${a.subtitle} ${a.tags.join(' ')}`;
      return kws.some((kw) => hay.includes(kw));
    });
  }

  // ৬. স্বাস্থ্য সংক্রান্ত মূল বিভাগ ও সাব-মেনু (কোনো খবর না থাকলে [] রিটার্ন করবে)
  if (categorySlug === 'health') {
    return basePublished.filter(
      (a) =>
        a.categorySlug === 'health' ||
        a.categorySlug.startsWith('health-') ||
        a.title.includes('স্বাস্থ্য কমপ্লেক্স') ||
        a.title.includes('স্বাস্থ্যসেবা')
    );
  }

  if (categorySlug === 'health-upazila-complex') {
    return basePublished.filter(
      (a) =>
        a.categorySlug === 'health-upazila-complex' ||
        a.title.includes('উপজেলা স্বাস্থ্য কমপ্লেক্স')
    );
  }

  if (categorySlug.startsWith('health-')) {
    const specificHealthKeywords: Record<string, string[]> = {
      'health-family-welfare': ['পরিবার কল্যাণ কেন্দ্র'],
      'health-upazila-beds': ['বেডের সংখ্যা', '৫০টি বেড'],
      'health-kathaltoli-complex': ['কাঁঠালতলী স্বাস্থ্য কমপ্লেক্স'],
      'health-kathaltoli-beds': ['কাঁঠালতলী স্বাস্থ্য কমপ্লেক্সের বেড'],
      'health-community-clinic': ['কমিউনিটি ক্লিনিক'],
    };
    const kws = specificHealthKeywords[categorySlug];
    return basePublished.filter((a) => {
      if (a.categorySlug === categorySlug) return true;
      if (!kws) return false;
      const hay = `${a.title} ${a.subtitle} ${a.tags.join(' ')}`;
      return kws.some((kw) => hay.includes(kw));
    });
  }

  // ৭. ইউনিয়ন ও ১নং-৯নং ওয়ার্ড ফিল্টারিং
  if (categorySlug.startsWith('union-')) {
    const [unionSlug, wardId] = categorySlug.split(':');
    const unionInfo = MIRZAGANJ_UNIONS.find((u) => u.slug === unionSlug);
    const wardInfo = wardId ? MIRZAGANJ_WARDS.find((w) => w.id === wardId) : undefined;

    // Direct match by categorySlug always included
    const directMatches = basePublished.filter((a) => a.categorySlug === categorySlug);
    if (directMatches.length > 0) {
      return directMatches;
    }

    if (unionInfo && wardInfo) {
      return basePublished.filter((a) => {
        const hay = `${a.title} ${a.subtitle} ${a.summary} ${a.locationBn} ${a.tags.join(' ')} ${a.content.join(' ')}`;
        return (
          hay.includes(wardInfo.labelBn) &&
          unionInfo.keywordsBn.some((kw) => hay.includes(kw))
        );
      });
    }

    if (unionInfo) {
      return basePublished.filter((a) => {
        if (a.categorySlug === unionSlug) return true;
        const hay = `${a.title} ${a.subtitle} ${a.summary} ${a.locationBn} ${a.tags.join(' ')} ${a.content.join(' ')}`;
        return unionInfo.keywordsBn.some((kw) => hay.includes(kw));
      });
    }

    return [];
  }

  if (categorySlug === 'mirzaganj') {
    return basePublished.filter(
      (a) =>
        a.categorySlug === 'mirzaganj' ||
        a.categorySlug.startsWith('union-') ||
        a.locationBn.includes('মির্জাগঞ্জ') ||
        a.tags.some((t) => t.includes('মির্জাগঞ্জ') || t.includes('সুবিদখালী'))
    );
  }

  return basePublished.filter((a) => a.categorySlug === categorySlug);
}

export function sortArticles(articles: Article[], mode: 'latest' | 'popular'): Article[] {
  const copy = [...articles];
  if (mode === 'popular') {
    return copy.sort((a, b) => b.viewCount - a.viewCount);
  }
  return copy.sort(
    (a, b) => new Date(b.publishedAtIso).getTime() - new Date(a.publishedAtIso).getTime()
  );
}

export function buildCanonicalUrl(
  origin: string,
  params?: { articleSlug?: string; categorySlug?: string; view?: string }
): string {
  const cleanOrigin = origin.replace(/\/+$/, '');
  if (params?.articleSlug) {
    return `${cleanOrigin}/?article=${encodeURIComponent(params.articleSlug)}`;
  }
  if (params?.categorySlug && params.categorySlug !== 'all') {
    return `${cleanOrigin}/?view=category&category=${encodeURIComponent(params.categorySlug)}`;
  }
  if (params?.view && params.view !== 'home') {
    return `${cleanOrigin}/?view=${encodeURIComponent(params.view)}`;
  }
  return `${cleanOrigin}/`;
}

export function buildNewsArticleJsonLd(
  article: Article,
  author: Author | undefined,
  origin: string,
  portalNameBn = 'নিউজ মির্জাগঞ্জ (News Mirzaganj — Demo Portal)'
): Record<string, unknown> {
  const canonicalUrl = buildCanonicalUrl(origin, { articleSlug: article.slug });
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: `[ডেমো] ${article.title}`,
    alternativeHeadline: article.subtitle,
    description: article.summary,
    inLanguage: 'bn-BD',
    isAccessibleForFree: true,
    datePublished: article.publishedAtIso,
    dateModified: article.publishedAtIso,
    articleSection: article.categoryNameBn,
    keywords: article.tags.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    author: {
      '@type': 'Person',
      name: author ? author.nameBn : 'নিউজ মির্জাগঞ্জ ডেস্ক (ডেমো)',
      jobTitle: author ? author.roleBn : 'প্রতিবেদক',
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: portalNameBn,
      url: origin,
    },
    disclaimer: article.demoDisclaimerBn,
  };
}

export interface ContactFormInput {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}

export function validateContactForm(input: ContactFormInput): {
  valid: boolean;
  errors: Partial<Record<keyof ContactFormInput, string>>;
} {
  const errors: Partial<Record<keyof ContactFormInput, string>> = {};
  if (!input.senderName.trim()) {
    errors.senderName = 'আপনার নাম উল্লেখ করা আবশ্যক।';
  }
  const email = input.senderEmail.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.senderEmail = 'একটি সঠিক ইমেইল ঠিকানা প্রদান করুন।';
  }
  if (!input.subject.trim()) {
    errors.subject = 'বার্তার বিষয় উল্লেখ করুন।';
  }
  if (input.message.trim().length < 10) {
    errors.message = 'বার্তার বিবরণ অন্তত ১০ অক্ষরের হতে হবে।';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface ArticleDraftInput {
  title: string;
  subtitle?: string;
  summary: string;
  contentText: string;
  categorySlug: string;
  authorId: string;
}

export function validateArticleDraft(input: ArticleDraftInput): {
  valid: boolean;
  errorMessageBn?: string;
  errors: string[];
} {
  const errors: string[] = [];
  if (!input.title.trim()) {
    errors.push('সংবাদের শিরোনাম প্রদান করা আবশ্যক।');
  }
  if (!input.summary.trim()) {
    errors.push('সংবাদের সংক্ষিপ্ত সারসংক্ষেপ লিখুন।');
  }
  if (!input.contentText.trim()) {
    errors.push('সংবাদের মূল বিবরণ (অন্তত একটি অনুচ্ছেদ) লিখুন।');
  }
  return {
    valid: errors.length === 0,
    errorMessageBn: errors[0],
    errors,
  };
}

export function generateArticleSlug(title: string, suffixId?: string): string {
  const suffix = suffixId || Date.now().toString(36);
  const asciiPart = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 36);
  return asciiPart ? `${asciiPart}-${suffix}` : `mirzaganj-news-${suffix}`;
}
