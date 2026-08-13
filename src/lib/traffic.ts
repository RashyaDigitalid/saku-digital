import { 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  serverTimestamp, 
  increment, 
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface TrafficData {
  liveVisitors: number;
  totalProcessed: number;
  totalVisits: number;
}

// Generate or retrieve persistent session ID for current browser tab
function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem('kreasika_session_id');
    if (!sid) {
      sid = 'kreasika_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('kreasika_session_id', sid);
    }
    return sid;
  } catch {
    return 'kreasika_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
  }
}

// Format current date in WIB (UTC+7) as YYYY-MM-DD
function getTodayString(): string {
  try {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const wibTime = new Date(utcTime + 7 * 3600000);
    return wibTime.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Starts real-time presence heartbeat and listens for active users.
 * Returns an unsubscribe cleanup function.
 */
export function startPresenceTracker(onCountUpdate: (count: number) => void): () => void {
  const sessionId = getSessionId();
  const presenceDocRef = doc(db, 'realtime_presence', sessionId);

  const device = typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop';
  const activePage = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Send initial presence ping
  const sendHeartbeat = async () => {
    try {
      await setDoc(presenceDocRef, {
        sessionId,
        lastSeen: serverTimestamp(),
        localTimestamp: Date.now(),
        device,
        activePage,
      }, { merge: true });
    } catch (err) {
      // Non-blocking catch for network glitches
      console.warn('Realtime presence heartbeat error:', err);
    }
  };

  // Immediate ping
  sendHeartbeat();

  // Periodic heartbeat every 20 seconds
  const intervalId = setInterval(sendHeartbeat, 20000);

  // Subscribe to realtime_presence collection to compute actual online users
  const presenceColRef = collection(db, 'realtime_presence');
  const unsubscribeSnapshot = onSnapshot(presenceColRef, (snapshot) => {
    try {
      const now = Date.now();
      const cutoffTime = now - 90000; // Active within last 90 seconds

      let activeCount = 0;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let lastSeenMs = data.localTimestamp || 0;

        if (data.lastSeen instanceof Timestamp) {
          lastSeenMs = data.lastSeen.toMillis();
        }

        // If active recently, count as live visitor
        if (lastSeenMs > cutoffTime || docSnap.id === sessionId) {
          activeCount++;
        }
      });

      // Always guarantee at least 1 (the current user itself)
      onCountUpdate(Math.max(1, activeCount));
    } catch (e) {
      console.warn('Error reading presence snapshot:', e);
      onCountUpdate(1);
    }
  }, (err) => {
    console.warn('Presence listener error:', err);
    onCountUpdate(1);
  });

  // Cleanup on tab close / unload
  const cleanupPresence = () => {
    try {
      deleteDoc(presenceDocRef).catch(() => {});
    } catch {
      // ignore
    }
  };

  window.addEventListener('beforeunload', cleanupPresence);
  window.addEventListener('pagehide', cleanupPresence);

  return () => {
    clearInterval(intervalId);
    unsubscribeSnapshot();
    cleanupPresence();
    window.removeEventListener('beforeunload', cleanupPresence);
    window.removeEventListener('pagehide', cleanupPresence);
  };
}

/**
 * Tracks and listens to actual traffic statistics (processed count and total visits).
 */
export function startTrafficStatsTracker(onStatsUpdate: (stats: { totalProcessed: number; totalVisits: number }) => void): () => void {
  const globalStatRef = doc(db, 'traffic_stats', 'global');
  const todayStr = getTodayString();
  const dailyStatRef = doc(db, 'traffic_stats', `daily_${todayStr}`);

  // Record 1 visit per browser session
  const recordVisitOnce = async () => {
    try {
      const visitRecorded = sessionStorage.getItem('kreasika_visit_recorded');
      if (!visitRecorded) {
        sessionStorage.setItem('kreasika_visit_recorded', 'true');
        
        await setDoc(globalStatRef, {
          totalVisits: increment(1),
          lastUpdated: serverTimestamp()
        }, { merge: true });

        await setDoc(dailyStatRef, {
          date: todayStr,
          totalVisits: increment(1),
          lastUpdated: serverTimestamp()
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Error recording visit:', err);
    }
  };

  recordVisitOnce();

  // Listen to live global stats
  const unsubscribe = onSnapshot(globalStatRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      onStatsUpdate({
        totalProcessed: typeof data.totalProcessed === 'number' ? data.totalProcessed : 0,
        totalVisits: typeof data.totalVisits === 'number' ? data.totalVisits : 1,
      });
    } else {
      // Initialize if document does not exist yet
      setDoc(globalStatRef, {
        totalProcessed: 1,
        totalVisits: 1,
        lastUpdated: serverTimestamp()
      }, { merge: true }).catch(() => {});
      
      onStatsUpdate({
        totalProcessed: 1,
        totalVisits: 1
      });
    }
  }, (err) => {
    console.warn('Traffic stats listener error:', err);
  });

  return unsubscribe;
}

/**
 * Call this function whenever a user completes an action / processes a tool
 * to increment real-time processed statistics.
 */
export async function trackToolAction(toolId?: string): Promise<void> {
  try {
    const globalStatRef = doc(db, 'traffic_stats', 'global');
    const todayStr = getTodayString();
    const dailyStatRef = doc(db, 'traffic_stats', `daily_${todayStr}`);

    await Promise.all([
      setDoc(globalStatRef, {
        totalProcessed: increment(1),
        lastUpdated: serverTimestamp()
      }, { merge: true }),
      setDoc(dailyStatRef, {
        date: todayStr,
        totalProcessed: increment(1),
        lastUpdated: serverTimestamp()
      }, { merge: true })
    ]);
  } catch (err) {
    console.warn('Failed to increment tool action traffic:', err);
  }
}
