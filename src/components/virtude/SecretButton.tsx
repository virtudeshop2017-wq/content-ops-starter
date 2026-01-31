import React from 'react';
import styles from './SecretButton.module.css';
import Link from 'next/link';

export default function SecretButton() {
    return (
        <Link href="/login" className={styles.button} aria-label="Acesso reservado">
            <span className={styles.icon}>⎈</span>
        </Link>
    );
}
