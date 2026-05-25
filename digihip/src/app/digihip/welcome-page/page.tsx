/**
 * Welcome Page
 * Author: @gioge31
 * src>app>digihip>welcome-page
 */

import NavbarLogin from "@/components/NavbarLogin/NavbarLogin";
import Footer from "@/components/Footer/Footer";
import Image from "next/image";
import styles from "./css/WelcomePage.module.css";
import Link from "next/link";
import welcomeImage from "./imgs/hello_img.jpg";

export default function WelcomePage() {
  return (
    <>
      <NavbarLogin />
      <main>
        <div className={styles.wlcmpgContent}>
          <div className={styles.leftContent}>
            <h3>Καλώς Ήρθατε στην εφαρμογή DiGiHip!</h3>
            <p>Ευχαριστούμε πολύ για την εγγραφή σας.</p>
            <h4>
              Πλέον μπορείτε να συνδεθείτε με τα στοιχεία σας στην εφαρμογή
              πατώντας
            </h4>
            <Link href="/" className={styles.linkAction}>
              <p>εδώ</p>
            </Link>
          </div>
          <div className={styles.rightContent}>
            <Image
              src={welcomeImage.src}
              alt="welcome image"
              width={100}
              height={50}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
