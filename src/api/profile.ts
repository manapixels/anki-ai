'use server';

import { createClient } from '@/utils/supabase/server';
import { Profile } from '@/types/profile';

/**
 * Fetches a single user profile by user ID.
 * @param {number} userId - The ID of the user.
 * @returns The user profile data or error.
 */
export const fetchUserProfile = async userId => {
  const supabase = createClient();
  try {
    let { data } = await supabase
      .from('profiles')
      .select(`*, preferred_unit_system`)
      .eq('id', userId)
      .single();

    return data as Profile;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

/**
 * Updates a user profile.
 * @param {Profile} profileData - The user profile data to update.
 * @returns The updated user profile data or an error object.
 */
export const updateUserProfile = async (profileData: Profile) => {
  const supabase = createClient();
  try {
    if (!profileData.id) {
      // Return a plain error object for client components
      return {
        error: true,
        message: 'Profile ID is required for an update.',
        name: 'ValidationError',
      };
    }

    // Separate preferred_unit_system for clarity, though it's part of profileData
    const { id, preferred_unit_system, ...otherProfileData } = profileData;

    const updatePayload: Partial<Profile> & { updated_at: string; id: string } = {
      id,
      ...otherProfileData,
      updated_at: new Date().toISOString(),
    };

    // Only include preferred_unit_system in the payload if it's explicitly passed
    // This allows clearing it by passing null, or leaving it unchanged by not passing it in profileData
    // However, our current UserContext always sends it.
    if (profileData.hasOwnProperty('preferred_unit_system')) {
      updatePayload.preferred_unit_system = preferred_unit_system;
    }

    const { data: updatedProfile, error: dbError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      console.error('Error updating profile in DB:', dbError);
      // Return a plain error object using PostgrestError properties
      return {
        error: true,
        message: dbError.message,
        name: 'DatabaseError',
        code: dbError.code,
        details: dbError.details,
        hint: dbError.hint,
      };
    }

    // If you also store preferred_unit_system in auth.users.user_metadata, update it here.
    // Otherwise, this part might be unnecessary for just this preference.
    if (profileData.hasOwnProperty('preferred_unit_system')) {
      const { error: authUserError } = await supabase.auth.updateUser({
        data: { preferred_unit_system: profileData.preferred_unit_system },
      });
      if (authUserError) {
        console.warn('Error updating user metadata in auth:', authUserError);
        // This is a warning, so we don't return an error object here,
        // the main operation (profile update) succeeded.
      }
    }

    return updatedProfile as Profile; // Success case
  } catch (error: any) {
    console.error('updateUserProfile service error:', error);
    // Return a plain error object for client components
    return {
      error: true,
      message: error.message || 'An unknown error occurred',
      name: error.name || 'ServiceError',
    };
  }
};
