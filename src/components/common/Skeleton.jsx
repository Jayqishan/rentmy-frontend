import styles from "./Skeleton.module.css";

export function SkeletonText({ width = "100%", height = 12 }) {
  return <div className={`${styles.shimmer} ${styles.skelLine}`} style={{ width, height }} />;
}

export function SkeletonCard() {
  return (
    <div className={styles.skelCard}>
      <div className={`${styles.shimmer} ${styles.skelImg}`} />
      <div className={styles.cardBody}>
        <SkeletonText width="72%" height={16} />
        <SkeletonText width="100%" />
        <SkeletonText width="84%" />
        <div className={styles.cardFooter}>
          <SkeletonText width="42%" height={16} />
          <SkeletonText width="24%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.shimmer} ${styles.statIcon}`} />
      <div className={styles.statBody}>
        <SkeletonText width="60%" />
        <SkeletonText width="40%" height={18} />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className={styles.tableRow}>
      <SkeletonText width="88%" />
      <SkeletonText width="70%" />
      <SkeletonText width="64%" />
      <SkeletonText width="68%" />
      <SkeletonText width="72%" />
    </div>
  );
}

export function SkeletonBanner() {
  return <div className={`${styles.shimmer} ${styles.banner}`} />;
}
