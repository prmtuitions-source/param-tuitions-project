import { useEffect } from 'react';
import { supabase } from '../shared/utils/supabaseClient';
import logger from '../shared/utils/logger';

const useLocationTracker = (userId, role) => {
  useEffect(() => {
    if (!userId || !role) {
      return;
    }

    // Only track location for these roles.
    if (!['parent', 'teacher', 'institute'].includes(role)) {
      return;
    }

    const saveLocation = async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const { error } = await supabase.rpc('update_user_location', {
          p_id: userId,
          p_lat: latitude,
          p_lng: longitude,
        });

        if (error) {
          logger.warn('Failed to save location:', error.message);
        }
      } catch (e) {
        logger.error('RPC call to update location failed:', e);
      }
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(saveLocation, (err) => logger.warn(`Location tracking error: ${err.message}`));
    } else {
      logger.warn('Geolocation is not supported by this browser.');
    }
  }, [userId, role]);
};

export default useLocationTracker;