import { afterEach } from 'node:test';

import { cleanup } from '../react/render.js';
import { installJsdom } from './jsdom.js';

installJsdom();

afterEach(cleanup);
