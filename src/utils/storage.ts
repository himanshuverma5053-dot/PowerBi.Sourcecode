/**
 * Utility for safe localStorage access that prevents QuotaExceededError crashes
 */

export function safeSetLocalStorage(key: string, data: any): boolean {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.warn(`localStorage quota exceeded for key "${key}". Attempting optimization...`, err);

    // If data is an array of objects (like products or orders with large data URLs)
    if (Array.isArray(data)) {
      try {
        const cleanedData = data.map((item: any) => {
          if (item && typeof item === 'object') {
            const newItem = { ...item };
            // Replace large base64 data URLs with standard placeholder URL to reduce footprint
            if (typeof newItem.image === 'string' && newItem.image.startsWith('data:image')) {
              newItem.image = 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800';
            }
            if (Array.isArray(newItem.images)) {
              newItem.images = newItem.images.map((img: any) =>
                typeof img === 'string' && img.startsWith('data:image')
                  ? 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800'
                  : img
              );
            }
            return newItem;
          }
          return item;
        });

        localStorage.setItem(key, JSON.stringify(cleanedData));
        return true;
      } catch (innerErr) {
        console.warn(`Cleaned save failed for key "${key}". Attempting cache prune...`, innerErr);
      }
    }

    // Try clearing less critical cache items if full
    try {
      localStorage.removeItem('magadh_orders_temp');
      localStorage.removeItem('magadh_coupons_temp');
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (finalErr) {
      console.warn(`Unable to save "${key}" to localStorage (QuotaExceeded). State will persist in memory and backend storage.`, finalErr);
      return false;
    }
  }
}

export function safeGetLocalStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed;
    }
  } catch (e) {
    console.warn(`Error reading "${key}" from localStorage:`, e);
  }
  return fallback;
}
