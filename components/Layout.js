import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/layout.module.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function Layout({ children }) {
  return (
    <div className={styles.pageWrapper}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header className={styles.fixedHeader}>
        <nav>
          <Link href="/">
            <a>Home</a>
          </Link>
          <Link href="/blog">
            <a>Blog</a>
          </Link>
        </nav>
      </header>
      <main className={styles.scrollableContent}>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.socialIcons}>
          {/* Add social media icons here */}
        </div>
        <p>© 2025 Image Metadata Extractor. All rights reserved.</p>
        <Link href="/terms">
          <a>Terms of Use</a>
        </Link>{' '}
        | <Link href="/privacy">
          <a>Privacy Policy</a>
        </Link>
      </footer>
      <Analytics />
    </div>
  );
}
