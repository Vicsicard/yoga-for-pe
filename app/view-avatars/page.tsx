'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from './avatars.module.css';

export default function ViewAvatars() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Avatar Images</h1>
      <div className={styles.avatarContainer}>
        <div className={styles.avatarItem}>
          <Image 
            src="/images/avatar-1.jpg" 
            alt="Avatar 1" 
            width={200} 
            height={200} 
            className={styles.image}
          />
          <h2 className={styles.subtitle}>Avatar 1</h2>
        </div>
        <div className={styles.avatarItem}>
          <Image 
            src="/images/avatar-2.jpg" 
            alt="Avatar 2" 
            width={200} 
            height={200} 
            className={styles.image}
          />
          <h2 className={styles.subtitle}>Avatar 2</h2>
        </div>
        <div className={styles.avatarItem}>
          <Image 
            src="/images/avatar-3.jpg" 
            alt="Avatar 3" 
            width={200} 
            height={200} 
            className={styles.image}
          />
          <h2 className={styles.subtitle}>Avatar 3</h2>
        </div>
      </div>
    </div>
  );
}
