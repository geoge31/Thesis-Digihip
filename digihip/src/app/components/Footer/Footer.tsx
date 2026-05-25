import React from "react";
import Image from "next/image";
import styles from "@/components/Footer/css/Footer.module.css";
import Logo from "@/components/Footer/imgs/Logo_Venizeleio.png";

/**
 *
 * @returns
 */
const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Image
          src={Logo.src}
          className={styles.LoGo}
          alt="VenizeleioLogo"
          width={100}
          height={50}
        />
        <p>2024 DiGiHip</p>
        <iframe
          className={styles.Iframe}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3256.0093099039204!2d25.151567476374705!3d35.3057501505079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x149a59127baedeab%3A0xd7599871c53ef21e!2zzpLOtc69zrnOts6tzrvOtc65zr8gzp3Ov8-Dzr_Ous6_zrzOtc6vzr8gzpfPgc6xzrrOu861zq_Ov8-F!5e0!3m2!1sel!2sgr!4v1725992500995!5m2!1sel!2sgr"
          title="Google maps Location [Venizeleio Nosokomeio]"
        ></iframe>
      </div>
    </footer>
  );
};

export default Footer;
