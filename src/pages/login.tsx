import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';
import { setAuthenticated, verifyCredentials } from '../lib/virtude-auth';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        const isValid = verifyCredentials(email.trim(), password);
        if (isValid) {
            setAuthenticated(true);
            router.push('/editor');
            return;
        }
        setAuthenticated(false);
        setError('Dados inválidos. Verifique e tente novamente.');
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Acesso reservado</h1>
                <p className={styles.subtitle}>Entre para abrir a área de edição.</p>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.label}>
                        E-mail
                        <input
                            className={styles.input}
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </label>
                    <label className={styles.label}>
                        Senha
                        <input
                            className={styles.input}
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </label>
                    {error && <p className={styles.error}>{error}</p>}
                    <button className={styles.button} type="submit">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}
