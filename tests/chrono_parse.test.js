import * as chrono from 'chrono-node';

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
  'カレン、来週の予定を教えて'
];

console.log('=== chrono-node 日本語日付パーステスト ===');
for (const text of samples) {
  const results = chrono.ja.parse(text, new Date(), { forwardDate: true });
  if (results.length > 0) {
    console.log(`"${text}" → "${results[0].text}" → ${results[0].date()}`);
  } else {
    console.log(`"${text}" → パースできず`);
  }
} 