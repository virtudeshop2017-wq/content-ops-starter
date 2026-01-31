import React, { useEffect, useState } from 'react';
import ProductPage from '../components/virtude/ProductPage';
import SecretButton from '../components/virtude/SecretButton';
import { ProductContent, defaultContent, loadContent } from '../lib/virtude-content';

export default function HomePage() {
    const [content, setContent] = useState<ProductContent>(defaultContent);

    useEffect(() => {
        setContent(loadContent());
    }, []);

    return (
        <>
            <ProductPage content={content} onMainImageChange={(id) => {
                setContent((prev) => {
                    const index = prev.gallery.findIndex((item) => item.id === id);
                    if (index <= 0) return prev;
                    const gallery = [...prev.gallery];
                    const [item] = gallery.splice(index, 1);
                    gallery.unshift(item);
                    return { ...prev, gallery };
                });
            }} />
            <SecretButton />
        </>
    );
}
