import { getDate } from 'japanese-date';

const samples = [
  '明日',
  '来週月曜日',
  '25日',
  '5月19日',
  '明後日の13時',
  '来週の予定',
  'カレン、来週月曜日の予定を教えて',
  'カレン、19日（月）の予定を確認して',
  'カレン、5月19日の予定を押せて',
  'カレン、明後日の予定を教えて。',
  'カレン、来週の予定を教えて',
  '来月の第三金曜日',
  '去年のクリスマスイブ',
  '来年の大晦日'
];

console.log('=== japanese-date 日本語日付パーステスト ===');
for (const text of samples) {
  const dates = getDate(text);
  if (dates && dates.length > 0) {
    console.log(`"${text}" → ${dates.map(d => d.toString()).join(' / ')}`);
  } else {
    console.log(`"${text}" → パースできず`);
  }
} 