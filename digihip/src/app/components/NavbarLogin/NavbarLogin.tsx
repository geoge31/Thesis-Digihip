// src/app/components/NavbarLogin.tsx - Implementation

import React from 'react';
import styles from './css/NavbarLogin.module.css'; 

const NavbarLogin: React.FC = () => {

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <h1 className={styles.logo}>DiGiHip</h1>
      </div>
    </nav>
  );
};

export default NavbarLogin;
