/**
 * GL Code Entity Types
 *
 * Extended GL Code types with relations.
 */

import type { GlCode, Tenant } from './base.entity';

/**
 * GL Code with tenant info
 */
export interface GlCodeWithTenant extends GlCode {
  tenant: Pick<Tenant, 'id' | 'name'>;
}
