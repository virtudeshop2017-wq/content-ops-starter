import Link from 'next/link';
import React from 'react';

const SecretButton = () => (
  <Link href="/editor-login" className="virtude-secret-button" aria-label="Abrir login do editor">
    <span>Editor secreto</span>
  </Link>
);

export default SecretButton;
