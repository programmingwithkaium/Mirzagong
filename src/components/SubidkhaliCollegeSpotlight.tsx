import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  MapPin,
  Users,
} from 'lucide-react';

interface SubidkhaliCollegeSpotlightProps {
  onSelectArticle: (slug: string) => void;
}

const COLLEGE_PHOTOS = [
  {
    url: '/assets/aistudio/images__1__d94b78a3.jpg',
    titleBn: 'সরকারি সুবিদখালী কলেজের মূল একাডেমিক ভবন (EIIN: ১০২৪৭১)',
    captionBn:
      'সুবিদখালী শহরের প্রাণকেন্দ্রে অবস্থিত সরকারি সুবিদখালী কলেজের সাইনবোর্ডসহ মূল দুইতলা একাডেমিক ভবন ও খেলার মাঠ।',
    badgeBn: 'মূল একাডেমিক ভবন',
  },
  {
    url: '/assets/aistudio/images_18ce5d28.jpg',
    titleBn: 'সুবিদখালী সরকারি কলেজের চারতলা আধুনিক ভবন ও সবুজ খেলার মাঠ',
    captionBn:
      'উচ্চ মাধ্যমিক, ডিগ্রি (পাস) ও স্নাতক (সম্মান) শিক্ষার্থীদের পাঠদানে ব্যবহৃত চারতলা একাডেমিক ভবন ও সুবিস্তৃত মাঠ।',
    badgeBn: 'চারতলা নতুন ভবন',
  },
  {
    url: '/assets/aistudio/maxresdefault_8b160eb4.jpg',
    titleBn: '৬.১৩ একর ক্যাম্পাসের সুবিশাল পুকুর ও প্রাকৃতিক দৃশ্য',
    captionBn:
      'কলেজ ক্যাম্পাসের ভেতরে অবস্থিত স্বচ্ছ পানির বিশাল পুকুর এবং চারপাশের একাডেমিক ভবনসমূহের মনোরম দৃশ্য।',
    badgeBn: 'ক্যাম্পাস ও পুকুর (৬.১৩ একর)',
  },
  {
    url: '/assets/aistudio/images__2__eb278632.jpg',
    titleBn: 'সুবিদখালী সরকারি রহমান ইসহাক পাইলট মাধ্যমিক উচ্চ বিদ্যালয় (গেইট নং-২)',
    captionBn:
      'কলেজ সংলগ্ন সুবিদখালী সদরের ঐতিহ্যবাহী সুবিদখালী সরকারি রহমান ইসহাক পাইলট মাধ্যমিক উচ্চ বিদ্যালয়ের প্রবেশদ্বার।',
    badgeBn: 'সরকারি পাইলট উচ্চ বিদ্যালয়',
  },
  {
    url: '/assets/aistudio/images__3__ea59c5ae.jpg',
    titleBn: 'সুবিদখালী মহিলা (ডিগ্রী) কলেজ — স্থাপিত: ১৯৯৫ খ্রিস্টাব্দ',
    captionBn:
      'পটুয়াখালীর মির্জাগঞ্জ উপজেলার সুবিদখালীতে নারী শিক্ষার শীর্ষ প্রতিষ্ঠান সুবিদখালী মহিলা (ডিগ্রী) কলেজের প্রধান তোরণ।',
    badgeBn: 'সুবিদখালী মহিলা ডিগ্রি কলেজ',
  },
];

export const SubidkhaliCollegeSpotlight: React.FC<
  SubidkhaliCollegeSpotlightProps
> = ({ onSelectArticle }) => {
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [activeInfoTab, setActiveInfoTab] = useState<
    'overview' | 'admission' | 'teachers' | 'results'
  >('overview');

  const activePhoto = COLLEGE_PHOTOS[selectedPhotoIdx] ?? COLLEGE_PHOTOS[0];

  return (
    <section
      aria-label="সুবিদখালী সরকারি কলেজ পরিচিতি ও গুরুত্বপূর্ণ তথ্যাদি"
      className="bg-white border-2 border-stone-900 shadow-sm overflow-hidden"
    >
      {/* Top Institutional Banner Header */}
      <div className="bg-gradient-to-r from-stone-950 via-red-950 to-stone-900 text-white px-5 sm:px-7 py-5 border-b border-stone-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-red-600 text-white text-[11px] font-bold tracking-wide">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>মির্জাগঞ্জের শীর্ষ সরকারি উচ্চশিক্ষা প্রতিষ্ঠান প্রোফাইল</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            সুবিদখালী সরকারি কলেজ (Subidkhali Government College)
          </h2>
          <p className="text-xs sm:text-sm text-stone-300">
            স্থাপিত: ১৯৭২ খ্রি. (প্রতিষ্ঠাতা: শিক্ষানুরাগী আব্দুল হামিদ খান) · জাতীয়করণ: ৮ আগস্ট ২০১৮ · EIIN কোড: ১০২৪৭১ · আয়তন: ৬.১৩ একর
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              onSelectArticle(
                'subidkhali-government-college-science-ict-campus-demo'
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>সরকারি কলেজ প্রতিবেদন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              onSelectArticle(
                'subidkhali-womens-degree-college-freshers-reception'
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-600 transition-colors cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>মহিলা ডিগ্রি কলেজ নবীন বরণ সংবাদ</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Grid: Left 7 Cols Detailed Info + Right 5 Cols Real Photo Showcase */}
      <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left 7 Cols: Exact Institutional Description, Key Facts & Interactive Tabs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Core Institutional Introduction */}
          <div className="bg-stone-50 border-l-4 border-red-600 p-4 sm:p-5 space-y-2.5">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600 shrink-0" />
              <span>প্রতিষ্ঠান পরিচিতি ও ইতিহাস</span>
            </h3>
            <p className="text-sm sm:text-[15px] text-stone-800 leading-relaxed">
              <strong>সুবিদখালী সরকারি কলেজ</strong> বাংলাদেশের পটুয়াখালী জেলার মির্জাগঞ্জ উপজেলার সুবিদখালীতে অবস্থিত একটি শীর্ষস্থানীয় এবং ঐতিহ্যবাহী সরকারি উচ্চশিক্ষা প্রতিষ্ঠান। <strong>১৯৭২ সালে</strong> শিক্ষানুরাগী <strong>আব্দুল হামিদ খানের</strong> উদ্যোগে কলেজটি প্রতিষ্ঠিত হয় এবং পরবর্তীতে <strong>২০১৮ সালের ৮ আগস্ট</strong> এটিকে জাতীয়করণ বা সরকারি কলেজ হিসেবে ঘোষণা করা হয়। প্রতিষ্ঠানটি বর্তমানে <strong>জাতীয় বিশ্ববিদ্যালয়</strong> ও <strong>বরিশাল মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ডের</strong> অধীনে শিক্ষাকার্যক্রম পরিচালনা করছে।
            </p>
          </div>

          {/* 4 Quick Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-stone-100 border border-stone-200">
              <div className="text-[11px] font-bold text-stone-500">EIIN কোড</div>
              <div className="text-lg sm:text-xl font-bold text-red-700 mt-0.5">
                ১০২৪৭১
              </div>
              <div className="text-[11px] text-stone-600">বরিশাল বোর্ড ও NU</div>
            </div>
            <div className="p-3 bg-stone-100 border border-stone-200">
              <div className="text-[11px] font-bold text-stone-500">ক্যাম্পাস আয়তন</div>
              <div className="text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
                ৬.১৩ একর
              </div>
              <div className="text-[11px] text-stone-600">সুবিদখালী প্রাণকেন্দ্র</div>
            </div>
            <div className="p-3 bg-stone-100 border border-stone-200">
              <div className="text-[11px] font-bold text-stone-500">প্রতিষ্ঠাকাল</div>
              <div className="text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
                ১৯৭২ সাল
              </div>
              <div className="text-[11px] text-stone-600">আব্দুল হামিদ খান</div>
            </div>
            <div className="p-3 bg-stone-100 border border-stone-200">
              <div className="text-[11px] font-bold text-stone-500">জাতীয়করণ</div>
              <div className="text-lg sm:text-xl font-bold text-emerald-800 mt-0.5">
                ৮ আগস্ট ২০১৮
              </div>
              <div className="text-[11px] text-stone-600">সরকারি কলেজ</div>
            </div>
          </div>

          {/* Interactive Tabs for Key Info, Admission Notice, Teachers & HSC Results */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 pb-2">
              {[
                {
                  id: 'overview' as const,
                  label: 'কলেজের গুরুত্বপূর্ণ তথ্যাদি',
                  icon: CheckCircle2,
                },
                {
                  id: 'admission' as const,
                  label: 'চলতি সেশনের ভর্তি বিজ্ঞপ্তি',
                  icon: Calendar,
                },
                {
                  id: 'teachers' as const,
                  label: 'বিভাগ ও শিক্ষক তথ্য',
                  icon: Users,
                },
                {
                  id: 'results' as const,
                  label: 'এইচএসসি ও স্নাতক ফলাফল',
                  icon: Award,
                },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeInfoTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveInfoTab(t.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {activeInfoTab === 'overview' && (
              <div className="bg-white border border-stone-200 p-4 space-y-3">
                <h4 className="text-sm font-bold text-stone-900 border-b border-stone-200 pb-2">
                  কলেজের গুরুত্বপূর্ণ তথ্যাদি (একনজরে)
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-stone-800">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span>
                      <strong>অবস্থান ও আয়তন:</strong> কলেজটির ক্যাম্পাসটি সুবিদখালী শহরের প্রাণকেন্দ্রে মোট <strong>৬.১৩ একর</strong> জমির ওপর বিস্তৃত।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span>
                      <strong>EIIN কোড:</strong> <strong>১০২৪৭১</strong>।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span>
                      <strong>চালু থাকা কোর্সসমূহ:</strong> এখানে উচ্চ মাধ্যমিক (<strong>HSC</strong> — বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা) স্তরের পাশাপাশি জাতীয় বিশ্ববিদ্যালয়ের অধীনে তিন বছর মেয়াদী <strong>ডিগ্রি (পাস) কোর্স (BA, BSS, BBS)</strong> এবং বেশ কিছু বিষয়ে <strong>স্নাতক (সম্মান/Honours)</strong> কোর্স চালু রয়েছে।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold mt-0.5">•</span>
                    <span>
                      <strong>ভর্তি প্রক্রিয়া:</strong> স্নাতক ও ডিগ্রি কোর্সে ভর্তির আবেদন জাতীয় বিশ্ববিদ্যালয়ের ভর্তি বিষয়ক ওয়েবসাইটের মাধ্যমে সম্পন্ন করা হয়।
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {activeInfoTab === 'admission' && (
              <div className="bg-stone-50 border border-stone-200 p-4 space-y-2.5 text-xs sm:text-sm text-stone-800">
                <h4 className="font-bold text-stone-900">
                  চলতি শিক্ষাবর্ষের ভর্তি তথ্য (HSC, ডিগ্রি পাস ও স্নাতক সম্মান)
                </h4>
                <p>
                  • <strong>উচ্চ মাধ্যমিক (HSC) একাদশ শ্রেণি ভর্তি:</strong> বরিশাল মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ডের অধীনে কেন্দ্রীয় অনলাইন ভর্তি সিস্টেমে (EIIN: ১০২৪৭১) বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা শাখায় আবেদন গ্রহণ করা হয়।
                </p>
                <p>
                  • <strong>ডিগ্রি (পাস — BA, BSS, BBS) ও স্নাতক (সম্মান/Honours):</strong> জাতীয় বিশ্ববিদ্যালয়ের ভর্তি বিষয়ক ওয়েবসাইটের মাধ্যমে অনলাইনে প্রাথমিক আবেদন ফরম পূরণ এবং নির্ধারিত মেধাতালিকা অনুযায়ী কলেজ অফিসে চূড়ান্ত ভর্তি সম্পন্ন করা হয়।
                </p>
              </div>
            )}

            {activeInfoTab === 'teachers' && (
              <div className="bg-stone-50 border border-stone-200 p-4 space-y-2.5 text-xs sm:text-sm text-stone-800">
                <h4 className="font-bold text-stone-900">
                  একাডেমিক বিভাগসমূহ ও শিক্ষকবৃন্দ
                </h4>
                <p>
                  সুবিদখালী সরকারি কলেজে বাংলা, ইংরেজি, অর্থনীতি, রাষ্ট্রবিজ্ঞান, ইতিহাস ও সংস্কৃতি, দর্শন, হিসাববিজ্ঞান, ব্যবস্থাপনা, পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, গণিত ও তথ্য ও যোগাযোগ প্রযুক্তি (ICT) বিভাগে অভিজ্ঞ শিক্ষকমণ্ডলী পাঠদান পরিচালনা করছেন।
                </p>
              </div>
            )}

            {activeInfoTab === 'results' && (
              <div className="bg-stone-50 border border-stone-200 p-4 space-y-2.5 text-xs sm:text-sm text-stone-800">
                <h4 className="font-bold text-stone-900">
                  এইচএসসি (HSC) ও জাতীয় বিশ্ববিদ্যালয় পরীক্ষার ফলাফল
                </h4>
                <p>
                  প্রতি বছর বরিশাল শিক্ষা বোর্ডের অধীনে অনুষ্ঠিত এইচএসসি পরীক্ষায় এবং জাতীয় বিশ্ববিদ্যালয়ের ডিগ্রি ও অনার্স পরীক্ষায় সুবিদখালী সরকারি কলেজের শিক্ষার্থীরা মির্জাগঞ্জ উপজেলায় শীর্ষ সাফল্যের ধারা বজায় রাখছে।
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Interactive 4-Photo Real Campus Gallery */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative border border-stone-300 bg-stone-950 overflow-hidden">
            <img
              src={activePhoto.url}
              alt={activePhoto.titleBn}
              className="w-full aspect-16/10 object-cover"
            />
            <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 flex items-center gap-1 shadow-xs">
              <Camera className="w-3 h-3" />
              <span>{activePhoto.badgeBn}</span>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3.5 text-white">
              <div className="text-xs sm:text-sm font-bold leading-snug">
                {activePhoto.titleBn}
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5 line-clamp-2">
                {activePhoto.captionBn}
              </p>
            </div>
          </div>

          {/* 5 Thumbnail Selector Buttons */}
          <div className="grid grid-cols-5 gap-1.5">
            {COLLEGE_PHOTOS.map((photo, idx) => {
              const isSelected = idx === selectedPhotoIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhotoIdx(idx)}
                  className={`group relative border overflow-hidden text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-red-600 ring-2 ring-red-600'
                      : 'border-stone-300 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.titleBn}
                    className="w-full h-14 sm:h-16 object-cover"
                  />
                  <div className="bg-stone-900 text-white text-[10px] font-semibold px-1.5 py-1 truncate">
                    {photo.badgeBn}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-700">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>সুবিদখালী, মির্জাগঞ্জ, পটুয়াখালী</span>
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onSelectArticle(
                    'subidkhali-womens-degree-college-freshers-reception'
                  )
                }
                className="text-red-700 font-bold hover:underline shrink-0 cursor-pointer"
              >
                মহিলা ডিগ্রি কলেজ নবীন বরণ →
              </button>
              <button
                type="button"
                onClick={() =>
                  onSelectArticle(
                    'subidkhali-pilot-high-school-heritage-science-sports-demo'
                  )
                }
                className="text-stone-800 font-bold hover:underline shrink-0 cursor-pointer"
              >
                পাইলট স্কুল →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
