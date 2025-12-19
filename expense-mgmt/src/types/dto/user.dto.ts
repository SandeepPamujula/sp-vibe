/**
 * User DTOs
 *
 * Data transfer objects for user profile operations.
 */

/**
 * User profile update
 */
export interface UpdateUserProfileDto {
  name?: string;
}

/**
 * User select option for dropdowns
 */
export interface UserSelectOption {
  value: string;
  label: string;
  email: string;
}
