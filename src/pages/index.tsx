import React, { useEffect, useState } from 'react';
import defaultContent from '../data/virtude-default.json';
import type { VirtudeContent } from '../lib/virtude-content';
import { VirtudePage } from '../components/virtude/VirtudePage';

const HomePage = () => {
  const [content, setContent] = useState<VirtudeContent>(defaultContent as VirtudeContent);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/virtude-content')
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (!isMounted || !data?.content) return;
        setContent(data.content as VirtudeContent);
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  return <VirtudePage content={content} />;
};

export default HomePage;
