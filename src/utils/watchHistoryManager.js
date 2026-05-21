/**
 * Watch History Manager
 * Quản lý lịch sử xem phim trong localStorage
 */

const WATCH_HISTORY_KEY = 'ophim_watch_history:v1';
const LEGACY_WATCH_HISTORY_KEY = 'ophim_watch_history';
const MAX_HISTORY_ITEMS = 100; // Giới hạn số lượng phim lưu

/**
 * Lấy toàn bộ watch history
 * @returns {Array} Array of watch history items
 */
export const getWatchHistory = () => {
  try {
    const history = localStorage.getItem(WATCH_HISTORY_KEY) || localStorage.getItem(LEGACY_WATCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting watch history:', error);
    return [];
  }
};

/**
 * Lưu thời lượng xem của một phim
 * @param {string} movieId - ID của phim
 * @param {string} episodeName - Tên tập phim
 * @param {number} currentTime - Thời gian hiện tại (giây)
 * @param {number} duration - Tổng thời lượng video (giây)
 * @param {object} movieInfo - Thông tin phim (title, poster, etc.)
 */
export const saveWatchProgress = (movieId, episodeName, currentTime, duration, movieInfo = {}) => {
  try {
    const history = getWatchHistory();
    const key = `${movieId}_${episodeName}`;
    
    // Tìm item đã tồn tại
    const existingIndex = history.findIndex(item => item.key === key);
    
    const watchItem = {
      key,
      movieId,
      episodeName,
      currentTime,
      duration,
      percentage: duration > 0 ? (currentTime / duration) * 100 : 0,
      timestamp: new Date().toISOString(),
      movieInfo: {
        title: movieInfo.title || '',
        poster: movieInfo.poster || '',
        slug: movieInfo.slug || ''
      }
    };
    
    if (existingIndex !== -1) {
      // Cập nhật item đã tồn tại
      history[existingIndex] = watchItem;
    } else {
      // Thêm item mới vào đầu array
      history.unshift(watchItem);
      
      // Giới hạn số lượng items
      if (history.length > MAX_HISTORY_ITEMS) {
        history.pop();
      }
    }
    
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving watch progress:', error);
  }
};

/**
 * Lấy thời lượng xem của một phim cụ thể
 * @param {string} movieId - ID của phim
 * @param {string} episodeName - Tên tập phim
 * @returns {object|null} Watch progress object hoặc null
 */
export const getWatchProgress = (movieId, episodeName) => {
  try {
    const history = getWatchHistory();
    const key = `${movieId}_${episodeName}`;
    return history.find(item => item.key === key) || null;
  } catch (error) {
    console.error('Error getting watch progress:', error);
    return null;
  }
};

/**
 * Xóa watch progress của một phim
 * @param {string} movieId - ID của phim
 * @param {string} episodeName - Tên tập phim
 */
export const removeWatchProgress = (movieId, episodeName) => {
  try {
    const history = getWatchHistory();
    const key = `${movieId}_${episodeName}`;
    const filteredHistory = history.filter(item => item.key !== key);
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error('Error removing watch progress:', error);
  }
};

/**
 * Xóa toàn bộ watch history
 */
export const clearWatchHistory = () => {
  try {
    localStorage.removeItem(WATCH_HISTORY_KEY);
    localStorage.removeItem(LEGACY_WATCH_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing watch history:', error);
  }
};

/**
 * Kiểm tra xem có nên hiển thị thông báo tiếp tục xem không
 * @param {number} currentTime - Thời gian đã xem (giây)
 * @param {number} duration - Tổng thời lượng (giây)
 * @returns {boolean}
 */
export const shouldShowContinueWatching = (currentTime, duration) => {
  if (!currentTime || !duration) return false;
  
  const percentage = (currentTime / duration) * 100;
  
  // Chỉ hiển thị nếu đã xem từ 1% đến 95%
  // Không hiển thị nếu mới bắt đầu hoặc đã xem gần hết
  return percentage >= 1 && percentage <= 95;
};

const getWatchPercentage = (item) => {
  const storedPercentage = Number(item.percentage);

  if (Number.isFinite(storedPercentage) && storedPercentage > 0) {
    return storedPercentage;
  }

  const currentTime = Number(item.currentTime);
  const duration = Number(item.duration);

  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  return (currentTime / duration) * 100;
};

const normalizeWatchItem = (item) => ({
  ...item,
  percentage: getWatchPercentage(item),
});

/**
 * Format thời gian từ giây sang HH:MM:SS hoặc MM:SS
 * @param {number} seconds - Số giây
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Lấy danh sách phim đang xem (chưa xem xong)
 * @returns {Array} Array of in-progress movies
 */
export const getInProgressMovies = () => {
  try {
    const history = getWatchHistory();
    return history.map(normalizeWatchItem).filter(item => {
      const percentage = getWatchPercentage(item);
      return percentage >= 1 && percentage <= 95;
    }).slice(0, 20); // Lấy tối đa 20 phim
  } catch (error) {
    console.error('Error getting in-progress movies:', error);
    return [];
  }
};

export const getRecentInProgressMovies = (limit = 10) => {
  try {
    const seenMovies = new Set();
    const getTimestampTime = item => {
      const time = new Date(item.timestamp).getTime();
      return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
    };

    return getWatchHistory()
      .map(normalizeWatchItem)
      .filter(item => {
        const percentage = getWatchPercentage(item);
        return percentage >= 1 && percentage <= 95;
      })
      .sort((a, b) => getTimestampTime(b) - getTimestampTime(a))
      .filter(item => {
        const movieKey = item.movieInfo?.slug || item.movieId;

        if (seenMovies.has(movieKey)) {
          return false;
        }

        seenMovies.add(movieKey);
        return true;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recent in-progress movies:', error);
    return [];
  }
};
