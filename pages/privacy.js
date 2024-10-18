import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Legal.module.css';

export default function Privacy() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Privacy Policy - Image Metadata Extractor</title>
        <meta name="description" content="Privacy Policy for Image Metadata Extractor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>PRIVACY POLICY</h1>
        <p className={styles.lastUpdated}>Last updated September 06, 2024</p>

        <section className={styles.content}>
          <p>This Privacy Notice for <Link href="https://imagedataextract.com/">https://imagedataextract.com/</Link> ("we," "us," or "our"), describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you:</p>
          
          <ul>
            <li>Visit our website at <Link href="https://imagedataextract.com">https://imagedataextract.com</Link>, or any website of ours that links to this Privacy Notice</li>
            <li>Engage with us in other related ways, including any sales, marketing, or events</li>
          </ul>

          <p><strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at info@imagedataextract.com.</p>
          
          {/* Add more sections here */}
          
        </section>

        <section className={styles.content}>
          <h2>CONTACT US</h2>
          <p>If you have questions or comments about this notice, you may email us at info@imagedataextract.com or contact us by post at:</p>
          
          <p><strong><Link href="https://imagedataextract.com/">https://imagedataextract.com/</Link></strong></p>
    
        </section>
      </main>
    </div>
  );
}
