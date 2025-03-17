import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>    
        <div className={styles.ctas}>
          <Link
            className={styles.primary}
            href="products"
          >           
            Products
          </Link>
          <Link
            href="orders"
            className={styles.secondary}
          >
            Orders
          </Link>
        </div>
      </main>
    </div>
  );
}
