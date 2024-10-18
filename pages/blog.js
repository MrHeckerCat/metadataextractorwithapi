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
  );
}
