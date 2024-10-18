import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Blog.module.css';

const blogPosts = [
  {
    title: "Understanding EXIF Data",
    description: "Learn about EXIF data and how it affects your digital privacy.",
    link: "/blog/exif-data"
  },
  {
    title: "Metadata and Copyright",
    description: "Explore the relationship between image metadata and copyright protection.",
    link: "/blog/metadata-copyright"
  },
  {
    title: "Removing Sensitive Metadata",
    description: "Step-by-step guide on removing sensitive information from your images.",
    link: "/blog/remove-metadata"
  }
];

export default function Blog() {
  return (
    <>
      <Head>
        <title>Image Metadata Blog: EXIF Data, Copyright, and Privacy | Image Metadata Extractor</title>
        <meta name="description" content="Explore our blog for in-depth articles on image metadata, EXIF data, copyright protection, and digital privacy. Learn how to manage and understand your image information." />
        <meta name="keywords" content="image metadata, EXIF data, copyright protection, digital privacy, image forensics" />
        <link rel="canonical" href="https://imagedataextract.com/blog" />
        <meta property="og:title" content="Image Metadata Blog | Image Metadata Extractor" />
        <meta property="og:description" content="Discover insights on image metadata, EXIF data, and digital privacy in our comprehensive blog." />
        <meta property="og:url" content="https://imagedataextract.com/blog" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Image Metadata Blog | Image Metadata Extractor" />
        <meta name="twitter:description" content="Explore our blog for in-depth articles on image metadata, EXIF data, copyright protection, and digital privacy." />
      </Head>
      <div className={styles.container}>
        <h1>Image Metadata Extractor Blog</h1>
        <p>Explore our latest articles on image metadata, privacy, and digital forensics.</p>
        
        <div className={styles.blogGrid}>
          {blogPosts.map((post, index) => (
            <div key={index} className={styles.blogTile}>
              <Link href={post.link}>
                <a>
                  <h2>{post.title}</h2>
                  <p>{post.description}</p>
                  <span className={styles.readMore}>Read More →</span>
                </a>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
