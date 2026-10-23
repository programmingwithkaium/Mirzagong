import React, { useState } from 'react';
import { Camera, MapPin, Play } from 'lucide-react';
import type { VisualTheme } from '../types/news.ts';

interface EditorialImageProps {
  theme: VisualTheme;
  imageUrl?: string;
  alt: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  isVideo?: boolean;
  videoDurationBn?: string;
  captionBn?: string;
  locationBadgeBn?: string;
  compact?: boolean;
  className?: string;
  priority?: boolean;
}

export const THEME_LABELS_BN: Record<VisualTheme, string> = {
  payra_river: 'পায়রা ও শ্রীমন্ত নদী · মির্জাগঞ্জ উপকূল চিত্র',
  subidkhali_college: 'সুবিদখালী সরকারি কলেজ ক্যাম্পাস · আলোকচিত্র',
  pilot_school: 'সুবিদখালী রইচ উদ্দিন পাইলট উচ্চ বিদ্যালয় · ক্যাম্পাস চিত্র',
  mirzaganj_shrine_mosque: 'মজিদবাড়িয়া শাহী মসজিদ ও মাজার শরীফ · ঐতিহ্য চিত্র',
  subidkhali_bazar: 'সুবিদখালী সদর বন্দর ও শ্রীমন্ত সেতু · জনপদ চিত্র',
  mirzaganj_tourism: 'মির্জাগঞ্জের দর্শনীয় স্থান ও পর্যটন · ফটো গ্যালারি',
  metro: 'ঢাকা-পটুয়াখালী-মির্জাগঞ্জ মহাসড়ক সংযোগ · চিত্র',
  port: 'বন্দর ও নৌ-বাণিজ্য · ডেমো চিত্র',
  tech: 'সুবিদখালী ডিজিটাল আইটি ও ফ্রিল্যান্সিং ল্যাব · চিত্র',
  agriculture: 'মির্জাগঞ্জের সোনালি আমন ক্ষেত ও সৌর সেচ · চিত্র',
  sundarbans: 'পায়রা নদীর সবুজ বেষ্টনী ও উপকূল · চিত্র',
  parliament: 'মির্জাগঞ্জ ৬টি ইউনিয়ন পরিষদ নাগরিক সেবা · চিত্র',
  diplomacy: 'আন্তর্জাতিক ও জলবায়ু কূটনীতি · ডেমো চিত্র',
  cricket: 'ক্রীড়াঙ্গন ও ক্রিকেট অনুশীলন · ডেমো চিত্র',
  culture: 'মির্জাগঞ্জের ঐতিহ্য ও লোকজ সংস্কৃতি · চিত্র',
  education: 'উপজেলা স্বাস্থ্য ও শিক্ষা অবকাঠামো · চিত্র',
  energy: 'উপকূলীয় সৌরশক্তি ও পরিবেশ · ডেমো চিত্র',
  economy: 'সুবিদখালী ও চৈতা বাজার দ্রব্যমূল্য চিত্র',
};

function buildEditorialSvgDataUri(theme: VisualTheme): string {
  const configs: Record<
    VisualTheme,
    {
      skyTop: string;
      skyBottom: string;
      accent: string;
      artwork: string;
    }
  > = {
    payra_river: {
      skyTop: '#0c4a6e',
      skyBottom: '#f59e0b',
      accent: '#dc2626',
      artwork: `
        <!-- Golden Sunset Sun & Clouds over Payra River -->
        <circle cx="610" cy="145" r="68" fill="#fef08a" fill-opacity="0.35"/>
        <circle cx="610" cy="145" r="42" fill="#fde047" fill-opacity="0.9"/>
        <path d="M90 95 Q130 78 175 92 Q210 82 245 96 Z" fill="#fed7aa" fill-opacity="0.45"/>
        <path d="M380 75 Q420 58 465 72 Q500 62 535 76 Z" fill="#fed7aa" fill-opacity="0.35"/>

        <!-- Distant Payra Bridge Silhouette on Horizon -->
        <path d="M0 232 L800 232" stroke="#7c2d12" stroke-width="3" stroke-opacity="0.5"/>
        <path d="M350 232 L365 168 L380 232 M510 232 L525 168 L540 232" stroke="#431407" stroke-width="3.5" fill="none" opacity="0.65"/>
        <path d="M290 230 Q365 185 445 230 Q525 185 600 230" stroke="#431407" stroke-width="2" fill="none" opacity="0.55"/>

        <!-- Distant Green Coastal Tree Line (Mirzaganj Char & Bank) -->
        <path d="M0 235 Q120 212 250 228 T520 225 T800 232 L800 250 L0 250 Z" fill="#064e3b"/>

        <!-- Wide Shimmering Payra River Water -->
        <rect x="0" y="242" width="800" height="208" fill="url(#waterPayra)"/>
        <!-- Sun Reflection on River -->
        <ellipse cx="610" cy="275" rx="52" ry="8" fill="#fde047" fill-opacity="0.55"/>
        <ellipse cx="610" cy="300" rx="40" ry="6" fill="#fef08a" fill-opacity="0.45"/>
        <ellipse cx="610" cy="325" rx="28" ry="5" fill="#fef08a" fill-opacity="0.35"/>
        <ellipse cx="610" cy="350" rx="18" ry="4" fill="#fef08a" fill-opacity="0.25"/>

        <!-- Concrete CC-Block & Geo-Bag Embankment Slope on Left Shore -->
        <polygon points="0,248 285,268 355,450 0,450" fill="#334155"/>
        <polygon points="0,235 265,258 285,268 0,252" fill="#15803d"/>
        <!-- Concrete Protection Blocks Grid -->
        <g fill="#94a3b8" stroke="#475569" stroke-width="1.5">
          <rect x="18" y="282" width="38" height="22" rx="3" transform="skewX(18)"/>
          <rect x="62" y="285" width="38" height="22" rx="3" transform="skewX(18)"/>
          <rect x="106" y="288" width="38" height="22" rx="3" transform="skewX(18)"/>
          <rect x="150" y="291" width="38" height="22" rx="3" transform="skewX(18)"/>
          <rect x="10" y="312" width="42" height="24" rx="4" transform="skewX(18)"/>
          <rect x="58" y="315" width="42" height="24" rx="4" transform="skewX(18)"/>
          <rect x="106" y="318" width="42" height="24" rx="4" transform="skewX(18)"/>
          <rect x="154" y="321" width="42" height="24" rx="4" transform="skewX(18)"/>
          <rect x="12" y="346" width="45" height="26" rx="4" transform="skewX(18)"/>
          <rect x="64" y="349" width="45" height="26" rx="4" transform="skewX(18)"/>
          <rect x="116" y="352" width="45" height="26" rx="4" transform="skewX(18)"/>
          <rect x="168" y="355" width="45" height="26" rx="4" transform="skewX(18)"/>
        </g>

        <!-- Palm & Coconut Trees on Mirzaganj Riverbank -->
        <path d="M72 245 Q65 180 52 135" stroke="#1e293b" stroke-width="6" fill="none"/>
        <path d="M52 135 Q20 125 8 148 M52 135 Q30 108 15 118 M52 135 Q78 108 95 125 M52 135 Q85 130 98 152" stroke="#064e3b" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M148 252 Q155 195 168 155" stroke="#1e293b" stroke-width="5" fill="none"/>
        <path d="M168 155 Q140 145 128 165 M168 155 Q150 132 138 140 M168 155 Q192 132 206 148 M168 155 Q198 148 210 168" stroke="#065f46" stroke-width="4.5" fill="none" stroke-linecap="round"/>

        <!-- Two-Deck White Bangladeshi Passenger Launch on Payra River -->
        <g transform="translate(345, 228)">
          <path d="M0 48 L155 48 L142 66 L12 66 Z" fill="#1e293b"/>
          <path d="M8 48 L148 48 L144 54 L10 54 Z" fill="#dc2626"/>
          <rect x="16" y="28" width="118" height="20" rx="2" fill="#f8fafc"/>
          <rect x="26" y="12" width="92" height="16" rx="2" fill="#e2e8f0"/>
          <rect x="42" y="3" width="28" height="9" rx="1" fill="#0284c7"/>
          <!-- Cabin Windows -->
          <rect x="24" y="33" width="12" height="8" rx="1" fill="#0f172a"/>
          <rect x="42" y="33" width="12" height="8" rx="1" fill="#0f172a"/>
          <rect x="60" y="33" width="12" height="8" rx="1" fill="#0f172a"/>
          <rect x="78" y="33" width="12" height="8" rx="1" fill="#0f172a"/>
          <rect x="96" y="33" width="12" height="8" rx="1" fill="#0f172a"/>
          <rect x="114" y="33" width="12" height="8" rx="1" fill="#0f172a"/>
        </g>

        <!-- Traditional Wooden Country Boat (ডিঙি নৌকা) in Foreground -->
        <g transform="translate(495, 342)">
          <path d="M0 28 Q75 46 155 24 L132 45 Q75 56 22 45 Z" fill="#451a03"/>
          <path d="M42 28 Q75 4 108 28 Z" fill="#b45309" stroke="#fde68a" stroke-width="1.5"/>
          <line x1="25" y1="30" x2="5" y2="52" stroke="#fde68a" stroke-width="2.5"/>
        </g>
      `,
    },

    subidkhali_college: {
      skyTop: '#0284c7',
      skyBottom: '#bae6fd',
      accent: '#b91c1c',
      artwork: `
        <!-- Bright Daylight Sky & Soft Clouds over Subidkhali Govt College -->
        <circle cx="680" cy="82" r="38" fill="#fef08a" fill-opacity="0.75"/>
        <ellipse cx="180" cy="78" rx="65" ry="20" fill="#ffffff" fill-opacity="0.65"/>
        <ellipse cx="220" cy="82" rx="48" ry="16" fill="#ffffff" fill-opacity="0.65"/>
        <ellipse cx="510" cy="68" rx="58" ry="18" fill="#ffffff" fill-opacity="0.55"/>

        <!-- Lush Green Campus Trees Behind Main Academic Building -->
        <circle cx="95" cy="235" r="55" fill="#14532d"/>
        <circle cx="145" cy="220" r="62" fill="#166534"/>
        <circle cx="665" cy="225" r="64" fill="#14532d"/>
        <circle cx="720" cy="240" r="52" fill="#15803d"/>

        <!-- Green College Field / Lawn -->
        <rect x="0" y="315" width="800" height="135" fill="#15803d"/>
        <path d="M0 315 L800 315 L800 332 L0 332 Z" fill="#166534"/>
        <!-- Red Brick Campus Walkway -->
        <polygon points="355,315 445,315 510,450 290,450" fill="#b45309"/>
        <polygon points="365,315 435,315 492,450 308,450" fill="#d97706"/>

        <!-- Subidkhali Govt. College 3-Story Main Academic Building -->
        <rect x="145" y="128" width="510" height="190" fill="#fffbeb" stroke="#d6d3d1" stroke-width="2"/>
        <!-- Red Brick Horizontal Fascia Bands (Classic Bangladeshi Govt College Style) -->
        <rect x="140" y="120" width="520" height="12" fill="#991b1b"/>
        <rect x="145" y="188" width="510" height="8" fill="#b91c1c"/>
        <rect x="145" y="250" width="510" height="8" fill="#b91c1c"/>

        <!-- Central Entrance Projection & Pediment -->
        <rect x="335" y="102" width="130" height="216" fill="#fef3c7" stroke="#b91c1c" stroke-width="2"/>
        <polygon points="328,102 400,66 472,102" fill="#991b1b"/>
        <circle cx="400" cy="88" r="10" fill="#fef08a"/>

        <!-- Arched Veranda Corridors Across 3 Floors -->
        <g fill="#1e293b">
          <!-- Top Floor Windows -->
          <rect x="168" y="142" width="28" height="34" rx="14"/>
          <rect x="212" y="142" width="28" height="34" rx="14"/>
          <rect x="256" y="142" width="28" height="34" rx="14"/>
          <rect x="300" y="142" width="24" height="34" rx="12"/>
          <rect x="358" y="138" width="34" height="38" rx="16"/>
          <rect x="408" y="138" width="34" height="38" rx="16"/>
          <rect x="476" y="142" width="24" height="34" rx="12"/>
          <rect x="516" y="142" width="28" height="34" rx="14"/>
          <rect x="560" y="142" width="28" height="34" rx="14"/>
          <rect x="604" y="142" width="28" height="34" rx="14"/>

          <!-- 2nd Floor Arches -->
          <rect x="168" y="204" width="28" height="36" rx="14"/>
          <rect x="212" y="204" width="28" height="36" rx="14"/>
          <rect x="256" y="204" width="28" height="36" rx="14"/>
          <rect x="300" y="204" width="24" height="36" rx="12"/>
          <rect x="358" y="202" width="34" height="38" rx="16"/>
          <rect x="408" y="202" width="34" height="38" rx="16"/>
          <rect x="476" y="204" width="24" height="36" rx="12"/>
          <rect x="516" y="204" width="28" height="36" rx="14"/>
          <rect x="560" y="204" width="28" height="36" rx="14"/>
          <rect x="604" y="204" width="28" height="36" rx="14"/>

          <!-- Ground Floor Arched Portico -->
          <rect x="168" y="268" width="28" height="50" rx="14"/>
          <rect x="212" y="268" width="28" height="50" rx="14"/>
          <rect x="256" y="268" width="28" height="50" rx="14"/>
          <rect x="300" y="268" width="24" height="50" rx="12"/>
          <rect x="366" y="264" width="68" height="54" rx="22" fill="#0f172a"/>
          <rect x="476" y="268" width="24" height="50" rx="12"/>
          <rect x="516" y="268" width="28" height="50" rx="14"/>
          <rect x="560" y="268" width="28" height="50" rx="14"/>
          <rect x="604" y="268" width="28" height="50" rx="14"/>
        </g>

        <!-- College Shaheed Minar Monument on Left Lawn -->
        <g transform="translate(155, 295)">
          <rect x="0" y="68" width="96" height="12" fill="#dc2626"/>
          <rect x="8" y="60" width="80" height="8" fill="#f8fafc"/>
          <circle cx="48" cy="34" r="18" fill="#dc2626"/>
          <rect x="22" y="20" width="5" height="40" fill="#f8fafc"/>
          <rect x="40" y="10" width="6" height="50" fill="#f8fafc"/>
          <rect x="52" y="10" width="6" height="50" fill="#f8fafc"/>
          <rect x="70" y="20" width="5" height="40" fill="#f8fafc"/>
        </g>

        <!-- National Flag of Bangladesh Flying on Campus Flagpole -->
        <line x1="575" y1="195" x2="575" y2="365" stroke="#f8fafc" stroke-width="4"/>
        <rect x="577" y="198" width="54" height="32" fill="#006a4e"/>
        <circle cx="601" cy="214" r="10" fill="#f42a41"/>
      `,
    },

    pilot_school: {
      skyTop: '#0369a1',
      skyBottom: '#e0f2fe',
      accent: '#dc2626',
      artwork: `
        <!-- Morning Sun & Sky over Subidkhali R.U. Pilot High School -->
        <circle cx="145" cy="85" r="40" fill="#fde047" fill-opacity="0.8"/>
        <ellipse cx="590" cy="82" rx="70" ry="20" fill="#ffffff" fill-opacity="0.7"/>

        <!-- Background Coconut & Mango Trees around Pilot School Ground -->
        <circle cx="85" cy="230" r="52" fill="#166534"/>
        <circle cx="135" cy="222" r="45" fill="#15803d"/>
        <circle cx="685" cy="225" r="58" fill="#166534"/>
        <circle cx="745" cy="235" r="48" fill="#14532d"/>

        <!-- Large Green School Sports Field (পাইলট স্কুল মাঠ) -->
        <rect x="0" y="302" width="800" height="148" fill="#16a34a"/>
        <rect x="0" y="302" width="800" height="16" fill="#15803d"/>
        <!-- Football / Sports Track Lines on Field -->
        <ellipse cx="400" cy="390" rx="280" ry="42" fill="none" stroke="#bbf7d0" stroke-width="2" stroke-dasharray="8 6"/>

        <!-- Historic L-Shaped Two-Story Pilot High School Building -->
        <rect x="115" y="152" width="570" height="152" fill="#fef9c3" stroke="#ca8a04" stroke-width="2"/>
        <!-- Classic Crimson Sloped Roof / Parapet -->
        <polygon points="105,152 140,122 660,122 695,152" fill="#991b1b"/>
        <rect x="115" y="226" width="570" height="7" fill="#b91c1c"/>

        <!-- Central Heritage Gate / Clock Tower Gable -->
        <rect x="348" y="112" width="104" height="192" fill="#fef08a" stroke="#991b1b" stroke-width="2"/>
        <polygon points="340,112 400,72 460,112" fill="#7f1d1d"/>
        <circle cx="400" cy="98" r="11" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
        <line x1="400" y1="98" x2="400" y2="91" stroke="#1e293b" stroke-width="1.5"/>
        <line x1="400" y1="98" x2="406" y2="98" stroke="#1e293b" stroke-width="1.5"/>

        <!-- School Veranda Pillars & Classroom Windows -->
        <g fill="#1e293b">
          <rect x="140" y="168" width="32" height="42" rx="4"/>
          <rect x="190" y="168" width="32" height="42" rx="4"/>
          <rect x="240" y="168" width="32" height="42" rx="4"/>
          <rect x="290" y="168" width="32" height="42" rx="4"/>
          <rect x="366" y="162" width="68" height="48" rx="8"/>
          <rect x="478" y="168" width="32" height="42" rx="4"/>
          <rect x="528" y="168" width="32" height="42" rx="4"/>
          <rect x="578" y="168" width="32" height="42" rx="4"/>
          <rect x="628" y="168" width="32" height="42" rx="4"/>

          <!-- Ground Floor Arched Doors -->
          <rect x="140" y="244" width="32" height="60" rx="16"/>
          <rect x="190" y="244" width="32" height="60" rx="16"/>
          <rect x="240" y="244" width="32" height="60" rx="16"/>
          <rect x="290" y="244" width="32" height="60" rx="16"/>
          <rect x="372" y="242" width="56" height="62" rx="20" fill="#7f1d1d"/>
          <rect x="478" y="244" width="32" height="60" rx="16"/>
          <rect x="528" y="244" width="32" height="60" rx="16"/>
          <rect x="578" y="244" width="32" height="60" rx="16"/>
          <rect x="628" y="244" width="32" height="60" rx="16"/>
        </g>

        <!-- School Assembly Flagpole in Front Courtyard -->
        <line x1="400" y1="215" x2="400" y2="375" stroke="#f8fafc" stroke-width="4"/>
        <rect x="402" y="218" width="48" height="28" fill="#006a4e"/>
        <circle cx="424" cy="232" r="9" fill="#f42a41"/>
        <rect x="382" y="372" width="36" height="10" fill="#dc2626"/>
      `,
    },

    mirzaganj_shrine_mosque: {
      skyTop: '#1e1b4b',
      skyBottom: '#d97706',
      accent: '#f59e0b',
      artwork: `
        <!-- Warm Golden Hour Sky over Historic Masjidbaria Shahi Mosque & Mirzaganj Shrine -->
        <circle cx="640" cy="115" r="52" fill="#fde68a" fill-opacity="0.35"/>
        <circle cx="640" cy="115" r="32" fill="#fef08a" fill-opacity="0.75"/>

        <!-- Lush Heritage Trees Framing the Mosque & Shrine -->
        <circle cx="95" cy="245" r="65" fill="#064e3b"/>
        <circle cx="155" cy="235" r="55" fill="#047857"/>
        <circle cx="665" cy="240" r="62" fill="#064e3b"/>
        <circle cx="725" cy="250" r="52" fill="#065f46"/>

        <!-- Serene Dighi / Reflection Pond in Foreground -->
        <rect x="0" y="330" width="800" height="120" fill="#0f172a"/>
        <rect x="85" y="335" width="630" height="115" fill="#1e3a8a" fill-opacity="0.55"/>
        <!-- Golden Water Reflections -->
        <line x1="280" y1="355" x2="520" y2="355" stroke="#fde68a" stroke-width="2" stroke-opacity="0.5"/>
        <line x1="310" y1="375" x2="490" y2="375" stroke="#fde68a" stroke-width="2" stroke-opacity="0.4"/>
        <line x1="340" y1="395" x2="460" y2="395" stroke="#fde68a" stroke-width="1.5" stroke-opacity="0.35"/>

        <!-- Sultanate Terracotta & White Mosque / Shrine Complex -->
        <rect x="175" y="195" width="450" height="135" fill="#9a3412" stroke="#fde68a" stroke-width="2"/>
        <rect x="205" y="208" width="390" height="122" fill="#fffbeb"/>

        <!-- Central Grand Sultanate Dome & Flanking Domes -->
        <path d="M320 195 Q400 92 480 195 Z" fill="#fef3c7" stroke="#d97706" stroke-width="3"/>
        <line x1="400" y1="115" x2="400" y2="88" stroke="#fbbf24" stroke-width="4"/>
        <circle cx="400" cy="84" r="6" fill="#fbbf24"/>

        <!-- Left & Right Smaller Domes -->
        <path d="M220 195 Q265 135 310 195 Z" fill="#fde68a" stroke="#b45309" stroke-width="2"/>
        <path d="M490 195 Q535 135 580 195 Z" fill="#fde68a" stroke="#b45309" stroke-width="2"/>

        <!-- Four Corner Minarets (মিনার) -->
        <rect x="162" y="105" width="22" height="225" fill="#ffedd5" stroke="#b45309" stroke-width="2"/>
        <path d="M160 105 Q173 78 186 105 Z" fill="#d97706"/>
        <rect x="616" y="105" width="22" height="225" fill="#ffedd5" stroke="#b45309" stroke-width="2"/>
        <path d="M614 105 Q627 78 640 105 Z" fill="#d97706"/>

        <!-- Three Classic Pointed Mihrab Arched Entrances -->
        <path d="M245 330 L245 255 Q275 222 305 255 L305 330 Z" fill="#451a03"/>
        <path d="M355 330 L355 238 Q400 198 445 238 L445 330 Z" fill="#451a03" stroke="#d97706" stroke-width="2"/>
        <path d="M495 330 L495 255 Q525 222 555 255 L555 330 Z" fill="#451a03"/>

        <!-- Stepped Ghat Stairs Leading to the Pond -->
        <rect x="315" y="330" width="170" height="8" fill="#d6d3d1"/>
        <rect x="300" y="338" width="200" height="8" fill="#a8a29e"/>
        <rect x="285" y="346" width="230" height="8" fill="#78716c"/>
      `,
    },

    subidkhali_bazar: {
      skyTop: '#0f172a',
      skyBottom: '#0284c7',
      accent: '#dc2626',
      artwork: `
        <!-- Daylight Sky over Subidkhali Sadar & Srimanta Canal Bridge -->
        <circle cx="670" cy="85" r="36" fill="#fde047" fill-opacity="0.8"/>

        <!-- Srimanta Canal / River Water in Foreground -->
        <rect x="0" y="320" width="800" height="130" fill="#0369a1"/>
        <path d="M0 345 Q200 335 400 345 T800 340 L800 450 L0 450 Z" fill="#075985"/>

        <!-- Subidkhali Commercial Buildings & Market Sheds on Both Banks -->
        <rect x="25" y="185" width="85" height="135" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="25" y="185" width="85" height="18" fill="#b91c1c"/>
        <rect x="120" y="210" width="95" height="110" fill="#fef3c7" stroke="#94a3b8" stroke-width="1.5"/>
        <polygon points="115,210 167,182 220,210" fill="#15803d"/>

        <rect x="585" y="195" width="90" height="125" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
        <rect x="585" y="195" width="90" height="16" fill="#0284c7"/>
        <rect x="685" y="215" width="90" height="105" fill="#fef9c3" stroke="#94a3b8" stroke-width="1.5"/>
        <polygon points="680,215 730,188 780,215" fill="#b91c1c"/>

        <!-- Subidkhali Arch Bridge over Srimanta Canal -->
        <path d="M185 320 Q400 225 615 320" stroke="#e2e8f0" stroke-width="14" fill="none"/>
        <path d="M210 292 Q400 175 590 292" stroke="#dc2626" stroke-width="6" fill="none"/>
        <line x1="280" y1="238" x2="280" y2="282" stroke="#f8fafc" stroke-width="3"/>
        <line x1="340" y1="215" x2="340" y2="270" stroke="#f8fafc" stroke-width="3"/>
        <line x1="400" y1="206" x2="400" y2="265" stroke="#f8fafc" stroke-width="3"/>
        <line x1="460" y1="215" x2="460" y2="270" stroke="#f8fafc" stroke-width="3"/>
        <line x1="520" y1="238" x2="520" y2="282" stroke="#f8fafc" stroke-width="3"/>
        <!-- Bridge Piers -->
        <rect x="215" y="295" width="24" height="55" fill="#64748b"/>
        <rect x="560" y="295" width="24" height="55" fill="#64748b"/>

        <!-- Colorful Farmer Fair-Price Canopies on Left Ghat -->
        <polygon points="35,285 95,285 105,305 25,305" fill="#16a34a"/>
        <polygon points="115,285 175,285 185,305 105,305" fill="#ea580c"/>
      `,
    },

    mirzaganj_tourism: {
      skyTop: '#064e3b',
      skyBottom: '#f59e0b',
      accent: '#10b981',
      artwork: `
        <!-- Panoramic Coastal & Heritage Tourism Collage of Mirzaganj -->
        <circle cx="400" cy="145" r="64" fill="#fde047" fill-opacity="0.4"/>
        <circle cx="400" cy="145" r="38" fill="#fef08a" fill-opacity="0.9"/>

        <!-- Left Horizon: Historic Shahi Mosque Silhouette -->
        <path d="M95 250 Q140 180 185 250 Z" fill="#042f2e"/>
        <rect x="75" y="250" width="130" height="55" fill="#042f2e"/>
        <rect x="65" y="195" width="12" height="110" fill="#042f2e"/>
        <rect x="205" y="195" width="12" height="110" fill="#042f2e"/>

        <!-- Right Horizon: Lush Green Mangrove & Char Island -->
        <circle cx="615" cy="235" r="55" fill="#064e3b"/>
        <circle cx="675" cy="225" r="65" fill="#047857"/>
        <circle cx="740" cy="240" r="50" fill="#065f46"/>

        <!-- Confluence of Payra & Srimanta Rivers -->
        <rect x="0" y="295" width="800" height="155" fill="#0f766e"/>
        <path d="M0 325 Q250 295 500 330 T800 315 L800 450 L0 450 Z" fill="#115e59"/>
        <!-- Golden Sunset Path on Water -->
        <polygon points="375,295 425,295 485,450 315,450" fill="#fde047" fill-opacity="0.32"/>

        <!-- Traditional Sailboat (পালতোলা নৌকা) on Payra Confluence -->
        <g transform="translate(345, 235)">
          <path d="M10 75 Q55 92 105 72 L90 88 Q55 96 22 88 Z" fill="#292524"/>
          <polygon points="52,10 52,72 95,65" fill="#fef3c7"/>
          <polygon points="48,18 48,72 18,68" fill="#fde68a"/>
        </g>

        <!-- Flying Birds in Sunset Sky -->
        <path d="M260 115 Q268 105 276 115 Q284 105 292 115" stroke="#1e293b" stroke-width="2.5" fill="none"/>
        <path d="M305 98 Q312 90 319 98 Q326 90 333 98" stroke="#1e293b" stroke-width="2" fill="none"/>
        <path d="M510 110 Q518 100 526 110 Q534 100 542 110" stroke="#1e293b" stroke-width="2.5" fill="none"/>
      `,
    },

    metro: {
      skyTop: '#1e293b',
      skyBottom: '#475569',
      accent: '#b91c1c',
      artwork: `
        <circle cx="660" cy="105" r="46" fill="#f59e0b" fill-opacity="0.45"/>
        <rect x="0" y="310" width="800" height="140" fill="#0f172a"/>
        <path d="M0 280 L800 280 L800 315 L0 315 Z" fill="#334155"/>
        <rect x="110" y="315" width="36" height="135" fill="#64748b"/>
        <rect x="380" y="315" width="36" height="135" fill="#64748b"/>
        <rect x="650" y="315" width="36" height="135" fill="#64748b"/>
        <rect x="60" y="232" width="640" height="46" rx="18" fill="#f8fafc"/>
        <path d="M60 256 L700 256" stroke="#b91c1c" stroke-width="6"/>
        <rect x="105" y="240" width="55" height="14" rx="3" fill="#1e293b"/>
        <rect x="180" y="240" width="55" height="14" rx="3" fill="#1e293b"/>
        <rect x="255" y="240" width="55" height="14" rx="3" fill="#1e293b"/>
        <rect x="330" y="240" width="55" height="14" rx="3" fill="#1e293b"/>
        <rect x="405" y="240" width="55" height="14" rx="3" fill="#1e293b"/>
        <rect x="480" y="240" width="55" height="14" rx="3" fill="#1e293b"/>
        <rect x="555" y="240" width="55" height="14" rx="3" fill="#1e293b"/>
      `,
    },
    port: {
      skyTop: '#0f172a',
      skyBottom: '#1e3a8a',
      accent: '#dc2626',
      artwork: `
        <rect x="0" y="310" width="800" height="140" fill="#0c4a6e"/>
        <path d="M80 290 L560 290 L520 335 L110 335 Z" fill="#334155"/>
        <rect x="150" y="245" width="75" height="45" fill="#b91c1c"/>
        <rect x="235" y="245" width="75" height="45" fill="#0284c7"/>
        <rect x="320" y="245" width="75" height="45" fill="#d97706"/>
        <rect x="190" y="200" width="75" height="42" fill="#15803d"/>
        <rect x="275" y="200" width="75" height="42" fill="#b91c1c"/>
        <path d="M580 310 L620 110 L665 110 L700 310" stroke="#f59e0b" stroke-width="8" fill="none"/>
        <path d="M470 140 L740 140" stroke="#f59e0b" stroke-width="8"/>
      `,
    },
    tech: {
      skyTop: '#0f172a',
      skyBottom: '#1e293b',
      accent: '#b91c1c',
      artwork: `
        <rect x="90" y="75" width="620" height="295" rx="12" fill="#0f172a" stroke="#475569" stroke-width="2"/>
        <circle cx="120" cy="102" r="6" fill="#ef4444"/>
        <circle cx="140" cy="102" r="6" fill="#f59e0b"/>
        <circle cx="160" cy="102" r="6" fill="#10b981"/>
        <rect x="125" y="140" width="240" height="18" rx="4" fill="#334155"/>
        <rect x="125" y="175" width="180" height="14" rx="4" fill="#b91c1c"/>
        <rect x="125" y="205" width="290" height="14" rx="4" fill="#1e293b"/>
        <rect x="125" y="235" width="210" height="14" rx="4" fill="#334155"/>
        <circle cx="560" cy="220" r="78" fill="#b91c1c" fill-opacity="0.22" stroke="#ef4444" stroke-width="2"/>
        <circle cx="560" cy="220" r="42" fill="none" stroke="#f8fafc" stroke-width="4"/>
      `,
    },
    agriculture: {
      skyTop: '#0284c7',
      skyBottom: '#fde047',
      accent: '#d97706',
      artwork: `
        <circle cx="640" cy="105" r="48" fill="#fef08a" fill-opacity="0.85"/>
        <circle cx="120" cy="235" r="48" fill="#14532d"/>
        <circle cx="175" cy="228" r="55" fill="#166534"/>
        <path d="M0 265 Q220 225 450 270 T800 250 L800 450 L0 450 Z" fill="#15803d"/>
        <path d="M0 315 Q260 275 520 320 T800 305 L800 450 L0 450 Z" fill="#ca8a04"/>
        <path d="M0 360 Q280 330 560 365 T800 350 L800 450 L0 450 Z" fill="#eab308"/>
        <!-- Solar Irrigation Panel in Field -->
        <polygon points="520,255 635,235 650,285 535,305" fill="#1e3a8a" stroke="#bae6fd" stroke-width="2"/>
        <line x1="585" y1="295" x2="585" y2="355" stroke="#475569" stroke-width="6"/>
      `,
    },
    sundarbans: {
      skyTop: '#064e3b',
      skyBottom: '#115e59',
      accent: '#10b981',
      artwork: `
        <path d="M0 295 L800 295 L800 450 L0 450 Z" fill="#042f2e"/>
        <path d="M280 295 Q380 340 220 450 L540 450 Q460 345 410 295 Z" fill="#0f766e"/>
        <circle cx="170" cy="195" r="65" fill="#065f46"/>
        <circle cx="250" cy="180" r="75" fill="#047857"/>
        <circle cx="570" cy="190" r="70" fill="#065f46"/>
        <circle cx="650" cy="175" r="80" fill="#047857"/>
        <path d="M330 365 L430 365 L410 382 L350 382 Z" fill="#78350f"/>
      `,
    },
    parliament: {
      skyTop: '#1e293b',
      skyBottom: '#475569',
      accent: '#b91c1c',
      artwork: `
        <rect x="0" y="340" width="800" height="110" fill="#1c1917"/>
        <rect x="210" y="130" width="380" height="210" fill="#78716c"/>
        <rect x="275" y="100" width="250" height="240" fill="#d6d3d1"/>
        <circle cx="400" cy="195" r="42" fill="#292524"/>
        <polygon points="335,285 400,225 465,285" fill="#292524"/>
      `,
    },
    diplomacy: {
      skyTop: '#1e1b4b',
      skyBottom: '#1e3a8a',
      accent: '#dc2626',
      artwork: `
        <circle cx="400" cy="225" r="115" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-opacity="0.55"/>
        <ellipse cx="400" cy="225" rx="60" ry="115" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-opacity="0.55"/>
        <line x1="285" y1="225" x2="515" y2="225" stroke="#60a5fa" stroke-width="2" stroke-opacity="0.55"/>
      `,
    },
    cricket: {
      skyTop: '#064e3b',
      skyBottom: '#022c22',
      accent: '#dc2626',
      artwork: `
        <ellipse cx="400" cy="340" rx="340" ry="95" fill="#15803d" fill-opacity="0.65"/>
        <rect x="365" y="280" width="70" height="95" fill="#d6d3d1" fill-opacity="0.75"/>
        <line x1="388" y1="235" x2="388" y2="285" stroke="#fef08a" stroke-width="4"/>
        <line x1="400" y1="235" x2="400" y2="285" stroke="#fef08a" stroke-width="4"/>
        <line x1="412" y1="235" x2="412" y2="285" stroke="#fef08a" stroke-width="4"/>
        <circle cx="515" cy="185" r="24" fill="#dc2626"/>
      `,
    },
    culture: {
      skyTop: '#451a03',
      skyBottom: '#9a3412',
      accent: '#d97706',
      artwork: `
        <circle cx="400" cy="225" r="115" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8 6"/>
        <circle cx="400" cy="225" r="82" fill="none" stroke="#fef3c7" stroke-width="2"/>
        <rect x="295" y="185" width="210" height="80" rx="6" fill="#fef3c7" fill-opacity="0.18" stroke="#fde68a" stroke-width="2"/>
      `,
    },
    education: {
      skyTop: '#0f172a',
      skyBottom: '#1e3a8a',
      accent: '#b91c1c',
      artwork: `
        <rect x="195" y="125" width="410" height="195" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
        <rect x="195" y="125" width="410" height="24" fill="#b91c1c"/>
        <rect x="378" y="155" width="44" height="14" fill="#dc2626"/>
        <rect x="393" y="140" width="14" height="44" fill="#dc2626"/>
        <rect x="235" y="195" width="55" height="45" rx="4" fill="#0284c7"/>
        <rect x="320" y="195" width="55" height="45" rx="4" fill="#0284c7"/>
        <rect x="425" y="195" width="55" height="45" rx="4" fill="#0284c7"/>
        <rect x="510" y="195" width="55" height="45" rx="4" fill="#0284c7"/>
      `,
    },
    energy: {
      skyTop: '#134e4a',
      skyBottom: '#0f172a',
      accent: '#0d9488',
      artwork: `
        <path d="M0 300 Q200 265 400 300 T800 290 L800 450 L0 450 Z" fill="#0d9488" fill-opacity="0.6"/>
        <circle cx="620" cy="130" r="46" fill="#5eead4" fill-opacity="0.35"/>
      `,
    },
    economy: {
      skyTop: '#1c1917',
      skyBottom: '#292524',
      accent: '#b91c1c',
      artwork: `
        <rect x="160" y="250" width="65" height="110" fill="#16a34a"/>
        <rect x="260" y="205" width="65" height="155" fill="#0284c7"/>
        <rect x="360" y="165" width="65" height="195" fill="#f59e0b"/>
        <rect x="460" y="120" width="65" height="240" fill="#dc2626"/>
        <polyline points="190,230 290,185 390,145 492,95" fill="none" stroke="#fef08a" stroke-width="5"/>
      `,
    },
  };

  const cfg = configs[theme] ?? configs.payra_river;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${cfg.skyTop}" />
        <stop offset="100%" stop-color="${cfg.skyBottom}" />
      </linearGradient>
      <linearGradient id="waterPayra" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0369a1" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#sky)" />
    ${cfg.artwork}
    <rect x="0" y="0" width="800" height="5" fill="${cfg.accent}" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const EditorialImage: React.FC<EditorialImageProps> = ({
  theme,
  imageUrl,
  alt,
  aspectRatio = '16:9',
  isVideo = false,
  videoDurationBn,
  captionBn,
  locationBadgeBn,
  compact = false,
  className = '',
  priority = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const src = imageUrl && imageUrl.trim() ? imageUrl.trim() : buildEditorialSvgDataUri(theme);
  const labelBn = THEME_LABELS_BN[theme] ?? THEME_LABELS_BN.payra_river;

  const aspectClass =
    aspectRatio === '16:9'
      ? 'aspect-video'
      : aspectRatio === '4:3'
      ? 'aspect-4/3'
      : 'aspect-square';

  return (
    <figure className={`w-full ${className}`}>
      <div
        className={`relative w-full overflow-hidden bg-stone-900 border border-stone-200 ${aspectClass}`}
      >
        {!imgError ? (
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-stone-900 text-stone-200 text-center">
            <span className="text-sm font-semibold text-red-400">নিউজ মির্জাগঞ্জ · ভিজ্যুয়াল</span>
            <span className="text-xs text-stone-400 mt-1 line-clamp-2">{alt}</span>
          </div>
        )}

        {/* Optional Bottom-Right Location Pin Overlay (only when not overlapped) */}
        {!compact && locationBadgeBn && !isVideo && captionBn && (
          <div className="absolute bottom-2.5 right-2.5 bg-stone-950/80 backdrop-blur-xs text-amber-200 text-[11px] font-medium px-2.5 py-0.5 rounded flex items-center gap-1 pointer-events-none">
            <MapPin className="w-3 h-3 text-red-400 shrink-0" />
            <span>{locationBadgeBn}</span>
          </div>
        )}

        {isVideo && (
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between ${
              compact ? 'p-2' : 'p-3.5'
            } pointer-events-none`}
          >
            <div className="flex items-center gap-2 text-white">
              <span
                className={`${
                  compact ? 'w-7 h-7' : 'w-9 h-9'
                } rounded-full bg-red-700 text-white flex items-center justify-center shadow-sm shrink-0`}
              >
                <Play className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} fill-current ml-0.5`} />
              </span>
              {!compact && (
                <span className="text-xs font-medium tracking-wide text-stone-100 whitespace-nowrap">
                  ভিডিও ও ফটো প্রতিবেদন
                </span>
              )}
            </div>
            {!compact && videoDurationBn && (
              <span className="text-xs font-sans tabular-nums text-stone-100 bg-black/75 px-2 py-0.5 rounded">
                {videoDurationBn}
              </span>
            )}
          </div>
        )}
      </div>

      {captionBn && (
        <figcaption className="text-xs text-stone-600 mt-2 leading-relaxed flex items-start gap-1.5">
          <Camera className="w-3.5 h-3.5 text-red-700 shrink-0 mt-0.5" />
          <span>{captionBn}</span>
        </figcaption>
      )}
    </figure>
  );
};
