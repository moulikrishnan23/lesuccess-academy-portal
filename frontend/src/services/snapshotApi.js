let snapshotPromise = null;

/**
 * Loads the static published snapshot from /data/snapshot.json.
 * Served directly from Vercel's CDN edge (<100ms response).
 */
export function loadSnapshot() {
  if (snapshotPromise) return snapshotPromise;
  if (typeof window === "undefined") return Promise.resolve(null);

  snapshotPromise = fetch("/data/snapshot.json", { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) return null;
      return res.json();
    })
    .catch((err) => {
      console.warn("Could not load /data/snapshot.json:", err);
      return null;
    });

  return snapshotPromise;
}

export default { loadSnapshot };
