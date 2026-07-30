import { rmSync, existsSync } from 'fs';
import { join } from 'path';

const exploreDir = join(import.meta.dirname, '..', 'src', 'app', '(explore)');
if (existsSync(exploreDir)) {
  rmSync(exploreDir, { recursive: true, force: true });
  console.log('Deleted (explore) route group');
} else {
  console.log('(explore) route group already deleted');
}