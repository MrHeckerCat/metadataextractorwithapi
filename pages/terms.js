import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Legal.module.css';

export default function Terms() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Terms of Use - Image Metadata Extractor</title>
        <meta name="description" content="Terms of Use for Image Metadata Extractor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>TERMS OF USE</h1>
        <p className={styles.lastUpdated}>Last updated September 06, 2024</p>

        <section className={styles.content}>
          <h2>AGREEMENT TO OUR LEGAL TERMS</h2>
          
          <p>We are <Link href="https://imagedataextract.com/">https://imagedataextract.com/</Link> ("Company," "we," "us," "our"), a company registered in __________ at __________, __________.</p>
          
          <p>We operate the website <Link href="https://imagedataextract.com/">https://imagedataextract.com/</Link> (the "Site"), as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").</p>
          
          <p>You can contact us by email at info@imagedataextract.com or by mail to __________, __________, __________.</p>
          
          <p>These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and <Link href="https://imagedataextract.com/">https://imagedataextract.com/</Link>, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</p>
          
          {/* Add more sections here */}
          
        </section>

        <section className={styles.content}>
          <h2>CONTACT US</h2>
          <p>In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:</p>
          
          <p><strong><Link href="https://imagedataextract.com/">https://imagedataextract.com/</Link></strong></p>
          <p><strong>info@imagedataextract.com</strong></p>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 Image Metadata Extractor. All rights reserved.</p>
        <Link href="/privacy">Privacy Policy</Link>
      </footer>
    </div>
  );
}
