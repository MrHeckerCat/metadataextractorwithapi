import Head from 'next/head';
import Link from 'next/link';
import styles from '/styles/Layout.module.css';

export default function Layout({ children }) {
  return (
    <div className={styles.pageWrapper}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header className={styles.fixedHeader}>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/blog">Blog</Link>
        </nav>
      </header>
      <main className={styles.scrollableContent}>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.socialIcons}>
          {/* Add social media icons here */}
        </div>
        <p>© 2024 Image Metadata Extractor. All rights reserved.</p>
        <Link href="/terms">Terms of Use</Link> | <Link href="/privacy">Privacy Policy</Link>
      </footer>
    </div>
  );
}
