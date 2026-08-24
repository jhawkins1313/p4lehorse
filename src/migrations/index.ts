/**
 * Migration index. Payload runs these itself on init in production, because the
 * adapter is given `prodMigrations` in payload.config.ts. Regenerate after any
 * schema change:
 *
 *   npx payload migrate:create <name>
 *
 * then check the import and the entry below. The generator rewrites this file
 * and will drop this comment, so put it back when it does.
 */
import * as migration_20260821_183527_initial from './20260821_183527_initial'
import * as migration_20260824_142002_drop_sections from './20260824_142002_drop_sections'

export const migrations = [
  {
    up: migration_20260821_183527_initial.up,
    down: migration_20260821_183527_initial.down,
    name: '20260821_183527_initial',
  },
  {
    up: migration_20260824_142002_drop_sections.up,
    down: migration_20260824_142002_drop_sections.down,
    name: '20260824_142002_drop_sections',
  },
]
