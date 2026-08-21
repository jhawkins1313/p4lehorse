/**
 * Migration index. Payload runs these itself on init in production, because the
 * adapter is given `prodMigrations` in payload.config.ts. Regenerate after any
 * schema change:
 *
 *   npx payload migrate:create <name>
 *
 * then add the import and the entry below.
 */
import * as migration_20260821_183527_initial from './20260821_183527_initial'

export const migrations = [
  {
    up: migration_20260821_183527_initial.up,
    down: migration_20260821_183527_initial.down,
    name: '20260821_183527_initial',
  },
]
