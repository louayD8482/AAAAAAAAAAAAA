/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AdhanVoiceOption {
  id: string;
  nameAr: string;
  nameEn: string;
  muezzin: string;
  description: string;
  audioUrls: string[];
  nativeFile: string;
}

export const ADHAN_VOICES_LIST: AdhanVoiceOption[] = [
  {
    id: 'makkah',
    nameAr: 'أذان الحرم المكي الشريف',
    nameEn: 'Makkah Al-Mukarramah Adhan',
    muezzin: 'الشيخ علي ملا ومؤذنو الحرم المكي',
    description: 'الأذان المكي الخاشع من الكعبة المشرفة بمقام البياتي والحجاز',
    audioUrls: [
      'https://www.islamcan.com/audio/adhan/azan1.mp3',
      'https://server8.mp3quran.net/afs/athan1.mp3',
      'https://download.quranicaudio.com/athan/makkah.mp3'
    ],
    nativeFile: 'adhan_makkah.wav'
  },
  {
    id: 'madinah',
    nameAr: 'أذان المسجد النبوي الشريف',
    nameEn: 'Madinah Al-Munawwarah Adhan',
    muezzin: 'الشيخ عصام بخاري ومؤذنو المسجد النبوي',
    description: 'أذان طيبة الطيبة الندي من روضة النبي ﷺ بمقام الرست',
    audioUrls: [
      'https://www.islamcan.com/audio/adhan/azan2.mp3',
      'https://download.quranicaudio.com/athan/madinah.mp3',
      'https://server8.mp3quran.net/afs/athan2.mp3'
    ],
    nativeFile: 'adhan_madinah.wav'
  },
  {
    id: 'alafasy',
    nameAr: 'أذان الشيخ مشاري بن راشد العفاسي',
    nameEn: 'Sheikh Mishary Rashid Alafasy Adhan',
    muezzin: 'الشيخ مشاري راشد العفاسي',
    description: 'أذان شجي ونقي بصوت الشيخ مشاري راشد العفاسي',
    audioUrls: [
      'https://www.islamcan.com/audio/adhan/azan3.mp3',
      'https://server8.mp3quran.net/afs/athan.mp3',
      'https://download.quranicaudio.com/athan/alafasy.mp3'
    ],
    nativeFile: 'adhan_alafasy.wav'
  },
  {
    id: 'abdulbasit',
    nameAr: 'أذان الشيخ عبد الباسط عبد الصمد',
    nameEn: 'Sheikh Abdulbasit Abdulsamad Adhan',
    muezzin: 'فضيلة الشيخ عبد الباسط عبد الصمد',
    description: 'الأذان التاريخي الخالد بصوت كروان القرآن',
    audioUrls: [
      'https://www.islamcan.com/audio/adhan/azan6.mp3',
      'https://download.quranicaudio.com/athan/abdulbasit.mp3',
      'https://server8.mp3quran.net/afs/athan_abdulbasit.mp3'
    ],
    nativeFile: 'adhan_abdulbasit.wav'
  },
  {
    id: 'alaqsa',
    nameAr: 'أذان المسجد الأقصى المبارك',
    nameEn: 'Al-Aqsa Mosque Adhan',
    muezzin: 'مؤذنو المسجد الأقصى الشريف (القدس)',
    description: 'الأذان المبارك من مسرى رسول الله ﷺ',
    audioUrls: [
      'https://www.islamcan.com/audio/adhan/azan5.mp3',
      'https://download.quranicaudio.com/athan/alaqsa.mp3',
      'https://server8.mp3quran.net/afs/athan_alaqsa.mp3'
    ],
    nativeFile: 'adhan_alaqsa.wav'
  },
  {
    id: 'qatami',
    nameAr: 'أذان الشيخ ناصر القطامي',
    nameEn: 'Sheikh Nasser Al-Qatami Adhan',
    muezzin: 'الشيخ ناصر القطامي',
    description: 'تأدية خاشعة ومؤثرة تفيض بالسكينة',
    audioUrls: [
      'https://www.islamcan.com/audio/adhan/azan7.mp3',
      'https://download.quranicaudio.com/athan/qatami.mp3'
    ],
    nativeFile: 'adhan_qatami.wav'
  },
  {
    id: 'ghamdi',
    nameAr: 'أذان الشيخ سعد الغامدي',
    nameEn: 'Sheikh Saad Al-Ghamdi Adhan',
    muezzin: 'الشيخ سعد الغامدي',
    description: 'أذان متميز بالخشوع والوضوح',
    audioUrls: [
      'https://www.islamcan.com/audio/adhan/azan8.mp3',
      'https://download.quranicaudio.com/athan/ghamdi.mp3'
    ],
    nativeFile: 'adhan_ghamdi.wav'
  },
  {
    id: 'takbeer',
    nameAr: 'تكبيرات الأذان فقط (تنبيه ميسر)',
    nameEn: 'Takbeerat Only (Short Alert)',
    muezzin: 'تكبيرات الحرمين الشريفين',
    description: 'الله أكبر الله أكبر (مقطع قصير ومناسب لبيئات العمل)',
    audioUrls: [
      'https://www.islamcan.com/audio/adhan/azan10.mp3',
      'https://www.islamcan.com/audio/adhan/azan1.mp3'
    ],
    nativeFile: 'adhan_takbeer.wav'
  }
];
