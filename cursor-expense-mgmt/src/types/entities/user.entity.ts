/**
 * User Entity Types
 *
 * Extended user types with relations.
 */

import type { Tenant, User } from './base.entity';

/**
 * User with tenant information
 */
export interface UserWithTenant extends User {
  tenant: Pick<Tenant, 'id' | 'name' | 'slug'>;
}
