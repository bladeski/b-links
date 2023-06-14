import { TextDecoder, TextEncoder } from 'util';

global.TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;