
import Link from 'next/link';
import styles from '../styles/404.module.css';

export default function Custom404() {
  return (
    <div className={styles.container}>
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <p>It seems you've stumbled upon a broken link or mistyped URL.</p>
      <p>Don't worry, you can always head back to our homepage and start fresh!</p>
      <Link href="/" className={styles.backLink}>
        Go to Homepage
      </Link>
    </div>
  );
}
