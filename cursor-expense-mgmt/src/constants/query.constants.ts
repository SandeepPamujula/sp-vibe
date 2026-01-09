/**
 * Query & Pagination Constants
 *
 * Default values for pagination, sorting, and query limits.
 */

/**
 * Default pagination values
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Sort order options
 */
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

/**
 * Default sort configuration
 */
export const SORT_DEFAULTS = {
  EXPENSES: {
    FIELD: 'createdAt',
    ORDER: SORT_ORDER.DESC,
  },
  AUDIT_TRAIL: {
    FIELD: 'createdAt',
    ORDER: SORT_ORDER.DESC,
  },
} as const;

/**
 * Search configuration
 */
export const SEARCH_CONFIG = {
  /** Minimum characters to trigger search */
  MIN_LENGTH: 2,
  /** Maximum results for autocomplete */
  MAX_RESULTS: 10,
  /** Debounce delay in milliseconds */
  DEBOUNCE_MS: 300,
} as const;
