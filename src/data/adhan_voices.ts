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
      '/audio/makkah.mp3',
      'https://raw.githubusercontent.com/abodehq/Athan-MP3/master/Sounds/Athan%20Makkah.mp3'
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
      '/audio/madinah.mp3',
      'https://raw.githubusercontent.com/wsalahuddin/adhan/main/adhan-madina-001.mp3'
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
      '/audio/alafasy.mp3',
      'https://raw.githubusercontent.com/abodehq/Athan-MP3/master/Sounds/Athan%20Mishary%20Alafasi.mp3'
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
      '/audio/abdulbasit.mp3',
      'https://raw.githubusercontent.com/abodehq/Athan-MP3/master/Sounds/Athan%20Abed%20Albase6.mp3'
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
      '/audio/alaqsa.mp3',
      'https://raw.githubusercontent.com/IslamAlorabI/SalatTimes-MP3Adhan/main/Adhan/ebrahim_silawi.mp3'
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
      '/audio/qatami.mp3',
      'https://raw.githubusercontent.com/abodehq/Athan-MP3/master/Sounds/Athan%20Nasser%20Alqatami.mp3'
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
      '/audio/ghamdi.mp3',
      'https://raw.githubusercontent.com/IslamAlorabI/SalatTimes-MP3Adhan/main/Adhan/saad_alghamedi_.mp3'
    ],
    nativeFile: 'adhan_ghamdi.wav'
  },
  {
    id: 'menshawy',
    nameAr: 'أذان الشيخ محمد صديق المنشاوي',
    nameEn: 'Sheikh Mohammad Siddiq Al-Menshawy Adhan',
    muezzin: 'الشيخ محمد صديق المنشاوي',
    description: 'تلاوة وأذان خاشع يبكي القلوب',
    audioUrls: [
      '/audio/menshawy.mp3',
      'https://raw.githubusercontent.com/abodehq/Athan-MP3/master/Sounds/Athan%20Mohammad%20Almenshawy.mp3'
    ],
    nativeFile: 'adhan_menshawy.wav'
  },
  {
    id: 'islam_sobhi',
    nameAr: 'أذان القارئ إسلام صبحي',
    nameEn: 'Islam Sobhi Adhan',
    muezzin: 'القارئ إسلام صبحي',
    description: 'صوت هادئ ونغم عذب يجلب الطمأنينة',
    audioUrls: [
      '/audio/islam_sobhi.mp3',
      'https://raw.githubusercontent.com/IslamAlorabI/SalatTimes-MP3Adhan/main/Adhan/islam_sobhi.mp3'
    ],
    nativeFile: 'adhan_islam_sobhi.wav'
  },
  {
    id: 'takbeer',
    nameAr: 'تكبيرات الأذان فقط (تنبيه ميسر)',
    nameEn: 'Takbeerat Only (Short Alert)',
    muezzin: 'تكبيرات الحرمين الشريفين',
    description: 'الله أكبر الله أكبر (مقطع قصير ومناسب لبيئات العمل)',
    audioUrls: [
      '/audio/takbeer.mp3',
      'https://raw.githubusercontent.com/IslamAlorabI/SalatTimes-MP3Adhan/main/Adhan/hamd_aldaghiri.mp3'
    ],
    nativeFile: 'adhan_takbeer.wav'
  }
];
