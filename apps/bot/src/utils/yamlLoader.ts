import fs from 'fs';
import yaml from 'js-yaml';
import dotenv from 'dotenv';
dotenv.config();

export function loadConfig() {
  const raw = fs.readFileSync('config/config.yaml', 'utf8');
  const cfg = yaml.load(raw) as any;
  // 必要に応じて環境変数の上書き処理を追加
  return cfg;
}

export function loadYaml<T = any>(path: string): T {
  const raw = fs.readFileSync(path, 'utf8');
  return yaml.load(raw) as T;
} 