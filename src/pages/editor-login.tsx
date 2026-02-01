import React, { useState } from 'react';
import { useRouter } from 'next/router';

const EditorLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/virtude-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        setError('Credenciais invalidas.');
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem('virtudeEditorAuth', JSON.stringify({ email, password }));
      router.push('/editor');
    } catch (err) {
      setError('Falha ao acessar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="virtude-editor-login">
      <div className="virtude-login-card">
        <h1>Area de edicao Virtude</h1>
        <p>Entre para acessar o editor completo.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Senha
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <div className="virtude-login-error">{error}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default EditorLogin;
