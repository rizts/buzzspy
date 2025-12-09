import type { Tweet } from '../types/index.js';
import { CONFIG } from '../config/index.js';

// Realistic Indonesian political topics
const TOPICS = [
  { hashtags: ['SubsidiBBM', 'PolitikIndonesia', 'APBN2024'], keywords: ['subsidi', 'BBM', 'pemerintah', 'kebijakan'] },
  { hashtags: ['PemilihanPresiden', 'Pilpres2024', 'Demokrasi'], keywords: ['calon', 'presiden', 'pemilu', 'koalisi'] },
  { hashtags: ['IKN', 'NusantaraBaru', 'PindahIbukota'], keywords: ['ibu kota', 'Nusantara', 'Kalimantan', 'pembangunan'] },
  { hashtags: ['UUCipta Kerja', 'OmnibusLaw', 'BuruhIndonesia'], keywords: ['buruh', 'upah', 'PHK', 'demonstrasi'] },
  { hashtags: ['KorupsiIndonesia', 'KPK', 'AntiKorupsi'], keywords: ['korupsi', 'KPK', 'gratifikasi', 'penyidikan'] },
];

const BUZZER_PATTERNS = {
  usernames: ['politikupdate_', 'rakyatbicara_', 'faktaindonesia_', 'suaranetizen_', 'infoakurat_'],
  phrases: [
    'BREAKING: ',
    'URGENT: ',
    'VIRAL: ',
    'THREAD 🧵: ',
    'Ini yang perlu kalian tahu: ',
  ],
  emojis: ['🔥', '⚠️', '🚨', '📢', '‼️', '✅', '❌'],
};

const NORMAL_USERS = [
  { username: 'budi_jakarta', name: 'Budi Santoso', followers: 450, following: 320 },
  { username: 'siti_bandung', name: 'Siti Nurhaliza', followers: 1200, following: 890 },
  { username: 'agus_pemuda', name: 'Agus Wijaya', followers: 350, following: 420 },
  { username: 'rina_mahasiswa', name: 'Rina Kartika', followers: 680, following: 550 },
  { username: 'joko_entrepreneur', name: 'Joko Susilo', followers: 2300, following: 1100 },
];

export class MockDataGenerator {
  private tweetCounter = 0;
  private buzzerAccounts: Map<string, any> = new Map();

  constructor() {
    // Generate buzzer accounts
    for (let i = 0; i < 20; i++) {
      const username = BUZZER_PATTERNS.usernames[i % BUZZER_PATTERNS.usernames.length] + this.randomId();
      this.buzzerAccounts.set(username, {
        id: this.randomId(),
        username,
        display_name: username.replace('_', ' ').toUpperCase(),
        followers: this.randomInt(800, 2000),
        following: this.randomInt(1800, 3500),
        verified: false,
        created_at: this.recentDate(90), // Account created in last 3 months
        postCount: 0,
      });
    }
  }

  generateTweet(forceBuzzer: boolean = false): Tweet {
    const isBuzzer = forceBuzzer || Math.random() < CONFIG.mock.buzzerRate;
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    
    let author;
    if (isBuzzer) {
      const buzzerUsername = Array.from(this.buzzerAccounts.keys())[
        Math.floor(Math.random() * this.buzzerAccounts.size)
      ];
      author = this.buzzerAccounts.get(buzzerUsername)!;
      author.postCount++;
    } else {
      const normalUser = NORMAL_USERS[Math.floor(Math.random() * NORMAL_USERS.length)];
      author = {
        id: this.randomId(),
        username: normalUser.username,
        display_name: normalUser.name,
        followers: normalUser.followers,
        following: normalUser.following,
        verified: Math.random() > 0.9,
        created_at: this.recentDate(365 * 3), // Account 1-3 years old
      };
    }

    const text = this.generateTweetText(topic, isBuzzer);
    const hashtags = this.selectHashtags(topic.hashtags, isBuzzer);

    return {
      id: `${Date.now()}_${this.tweetCounter++}`,
      text: text + ' ' + hashtags.map(h => '#' + h).join(' '),
      author,
      created_at: new Date().toISOString(),
      metrics: {
        likes: this.randomInt(isBuzzer ? 10 : 1, isBuzzer ? 150 : 50),
        retweets: this.randomInt(isBuzzer ? 20 : 2, isBuzzer ? 300 : 80),
        replies: this.randomInt(0, isBuzzer ? 50 : 20),
        views: this.randomInt(isBuzzer ? 500 : 100, isBuzzer ? 5000 : 1000),
      },
      entities: {
        hashtags,
        mentions: [],
        urls: Math.random() > 0.7 ? ['https://example.com/article'] : [],
      },
    };
  }

  private generateTweetText(topic: any, isBuzzer: boolean): string {
    const keyword = topic.keywords[Math.floor(Math.random() * topic.keywords.length)];
    
    if (isBuzzer) {
      const prefix = BUZZER_PATTERNS.phrases[Math.floor(Math.random() * BUZZER_PATTERNS.phrases.length)];
      const emoji = BUZZER_PATTERNS.emojis[Math.floor(Math.random() * BUZZER_PATTERNS.emojis.length)];
      
      const templates = [
        `${prefix}Kebijakan baru tentang ${keyword} akan segera diumumkan! ${emoji}`,
        `${prefix}Pemerintah berhasil ${keyword} dengan hasil luar biasa! ${emoji}`,
        `WAJIB TAHU! Ini fakta sebenarnya tentang ${keyword} ${emoji}`,
        `Jangan percaya hoax! Ini data resmi tentang ${keyword} ${emoji}`,
      ];
      
      return templates[Math.floor(Math.random() * templates.length)];
    } else {
      const templates = [
        `Menurut saya kebijakan ${keyword} ini perlu dikaji lebih dalam lagi.`,
        `Gimana pendapat kalian tentang ${keyword}? Apa dampaknya ke kita?`,
        `Baru baca berita tentang ${keyword}, semoga ada solusi terbaiknya.`,
        `Sebagai warga negara, kita harus kritis terhadap ${keyword}.`,
      ];
      
      return templates[Math.floor(Math.random() * templates.length)];
    }
  }

  private selectHashtags(hashtags: string[], isBuzzer: boolean): string[] {
    if (isBuzzer) {
      // Buzzers use more hashtags (3-5)
      const count = this.randomInt(3, Math.min(5, hashtags.length));
      return hashtags.slice(0, count);
    } else {
      // Normal users use fewer hashtags (1-2)
      const count = this.randomInt(1, 2);
      return hashtags.slice(0, count);
    }
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private recentDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - this.randomInt(0, daysAgo));
    return date.toISOString();
  }

  getBuzzerAccountStats() {
    return Array.from(this.buzzerAccounts.values()).map(acc => ({
      username: acc.username,
      postCount: acc.postCount,
      accountAge: Math.floor(
        (Date.now() - new Date(acc.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));
  }
}

export const mockDataGenerator = new MockDataGenerator();