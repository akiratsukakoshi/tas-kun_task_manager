import 'dotenv/config';
import { loadConfig } from './utils/yamlLoader.js';
import { makeDiscordGateway } from './discord/discordGateway.js';

const cfg = loadConfig();
const gateway = makeDiscordGateway(cfg);
gateway.start(); 