import fs from 'fs';
import yaml from 'js-yaml';

export function loadConfig() {
  const raw = fs.readFileSync('config/config.yaml', 'utf8');
  const cfg = yaml.load(raw) as any;
  // 必要に応じて環境変数の上書き処理を追加
  return cfg;
} 