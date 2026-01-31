import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import ProductPage from '../components/virtude/ProductPage';
import styles from '../styles/Editor.module.css';
import {
    ProductContent,
    ProductImage,
    ProductReview,
    ProductBlock,
    TextStyle,
    ImageStyle,
    defaultContent,
    loadContent,
    saveContent
} from '../lib/virtude-content';
import { isAuthenticated } from '../lib/virtude-auth';

type Selection =
    | { type: 'text'; id: string }
    | { type: 'image'; id: string }
    | { type: 'review'; id: string }
    | { type: 'block'; id: string }
    | { type: 'footer'; id: string }
    | null;

type PreviewMode = 'desktop' | 'mobile';

const textDefaults: TextStyle = { fontSize: 16, align: 'left' };
const imageDefaults: ImageStyle = { width: 100, borderRadius: 24, align: 'center' };

function moveGalleryImage(content: ProductContent, id: string) {
    const index = content.gallery.findIndex((item) => item.id === id);
    if (index <= 0) {
        return content;
    }
    const nextGallery = [...content.gallery];
    const [item] = nextGallery.splice(index, 1);
    nextGallery.unshift(item);
    return { ...content, gallery: nextGallery };
}

function updateTextValue(content: ProductContent, id: string, value: string) {
    const next = { ...content };
    if (id === 'hero-badge') next.hero = { ...next.hero, badge: value };
    if (id === 'hero-title') next.hero = { ...next.hero, title: value };
    if (id === 'hero-subtitle') next.hero = { ...next.hero, subtitle: value };
    if (id === 'hero-description') next.hero = { ...next.hero, description: value };
    if (id === 'hero-price') next.hero = { ...next.hero, price: value };
    if (id === 'hero-price-note') next.hero = { ...next.hero, priceNote: value };
    if (id === 'hero-stock') next.hero = { ...next.hero, stockLabel: value };
    if (id === 'hero-cta') next.hero = { ...next.hero, ctaLabel: value };
    if (id === 'brand-name') next.brand = { ...next.brand, name: value };
    if (id === 'brand-tagline') next.brand = { ...next.brand, tagline: value };
    if (id === 'highlights-title') next.highlights = { ...next.highlights, title: value };
    if (id === 'reviews-title') next.reviews = { ...next.reviews, title: value };
    if (id === 'footer-text') next.footer = { ...next.footer, text: value };
    if (id === 'footer-note') next.footer = { ...next.footer, note: value };

    const highlightIndex = next.highlights.items.findIndex((item) => item.id === id);
    if (highlightIndex >= 0) {
        const items = [...next.highlights.items];
        items[highlightIndex] = { ...items[highlightIndex], title: value };
        next.highlights = { ...next.highlights, items };
    }
    const highlightTextIndex = next.highlights.items.findIndex((item) => `${item.id}-text` === id);
    if (highlightTextIndex >= 0) {
        const items = [...next.highlights.items];
        items[highlightTextIndex] = { ...items[highlightTextIndex], text: value };
        next.highlights = { ...next.highlights, items };
    }
    return next;
}

function updateTextStyle(content: ProductContent, id: string, style: TextStyle) {
    return {
        ...content,
        textStyles: {
            ...content.textStyles,
            [id]: { ...(content.textStyles[id] || textDefaults), ...style }
        }
    };
}

function updateImageStyle(content: ProductContent, id: string, style: ImageStyle) {
    return {
        ...content,
        imageStyles: {
            ...content.imageStyles,
            [id]: { ...(content.imageStyles[id] || imageDefaults), ...style }
        }
    };
}

function updateImageContent(content: ProductContent, id: string, image: ProductImage) {
    const galleryIndex = content.gallery.findIndex((item) => item.id === id);
    if (galleryIndex >= 0) {
        const gallery = [...content.gallery];
        gallery[galleryIndex] = image;
        return { ...content, gallery };
    }
    const blockIndex = content.blocks.findIndex((block) => block.type === 'image' && block.image.id === id);
    if (blockIndex >= 0) {
        const blocks = [...content.blocks];
        const block = blocks[blockIndex] as Extract<ProductBlock, { type: 'image' }>;
        blocks[blockIndex] = { ...block, image };
        return { ...content, blocks };
    }
    return content;
}

function updateReview(content: ProductContent, id: string, patch: Partial<ProductReview>) {
    const index = content.reviews.items.findIndex((review) => review.id === id);
    if (index < 0) return content;
    const items = [...content.reviews.items];
    items[index] = { ...items[index], ...patch };
    return { ...content, reviews: { ...content.reviews, items } };
}

function updateBlock(content: ProductContent, id: string, patch: Partial<ProductBlock>) {
    const index = content.blocks.findIndex((block) => block.id === id);
    if (index < 0) return content;
    const blocks = [...content.blocks];
    blocks[index] = { ...blocks[index], ...patch } as ProductBlock;
    return { ...content, blocks };
}

function generateId(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function EditorPage() {
    const router = useRouter();
    const [content, setContent] = useState<ProductContent>(defaultContent);
    const [selection, setSelection] = useState<Selection>(null);
    const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
    const [savedAt, setSavedAt] = useState<string>('');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace('/login');
            return;
        }
        setContent(loadContent());
        setReady(true);
    }, [router]);

    if (!ready) {
        return <div className={styles.loading}>Carregando editor...</div>;
    }

    const selectedTextId = useMemo(() => {
        if (!selection) return null;
        if (selection.type === 'text' || selection.type === 'footer') {
            return selection.id;
        }
        if (selection.type === 'block') {
            const block = content.blocks.find((item) => item.id === selection.id);
            if (block?.type === 'text') {
                return block.textId;
            }
        }
        if (selection.type === 'review') {
            return selection.id;
        }
        return null;
    }, [selection, content.blocks]);

    const selectedImageId = useMemo(() => {
        if (!selection) return null;
        if (selection.type === 'image') return selection.id;
        if (selection.type === 'block') {
            const block = content.blocks.find((item) => item.id === selection.id);
            if (block?.type === 'image') return block.image.id;
        }
        return null;
    }, [selection, content.blocks, content.reviews.items]);

    const activeTextStyle = selectedTextId ? content.textStyles[selectedTextId] || textDefaults : null;
    const activeImageStyle = selectedImageId ? content.imageStyles[selectedImageId] || imageDefaults : null;
    const selectedReview = selection?.type === 'review' ? content.reviews.items.find((item) => item.id === selection.id) : null;

    const handleUpload = async (file: File, callback: (url: string) => void) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                callback(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = (file: File) => {
        if (!selectedImageId) return;
        handleUpload(file, (url) => {
            if (selection?.type === 'review') {
                setContent((prev) => updateReview(prev, selection.id, { avatar: url }));
                return;
            }
            setContent((prev) =>
                updateImageContent(prev, selectedImageId, {
                    id: selectedImageId,
                    src: url,
                    alt: 'Imagem enviada'
                })
            );
        });
    };

    const handleVideoUpload = (file: File) => {
        if (!selection || selection.type !== 'block') return;
        handleUpload(file, (url) => {
            setContent((prev) =>
                updateBlock(prev, selection.id, {
                    type: 'video',
                    video: { id: generateId('video'), src: url }
                })
            );
        });
    };

    const handleSave = () => {
        saveContent(content);
        setSavedAt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };

    return (
        <div className={styles.page}>
            <header className={styles.topbar}>
                <div>
                    <h1 className={styles.title}>Editor Virtude</h1>
                    <p className={styles.subtitle}>Preview em tempo real com controle total.</p>
                </div>
                <div className={styles.topbarActions}>
                    <button
                        type="button"
                        className={`${styles.modeButton} ${previewMode === 'desktop' ? styles.modeActive : ''}`}
                        onClick={() => setPreviewMode('desktop')}
                    >
                        Desktop
                    </button>
                    <button
                        type="button"
                        className={`${styles.modeButton} ${previewMode === 'mobile' ? styles.modeActive : ''}`}
                        onClick={() => setPreviewMode('mobile')}
                    >
                        Celular
                    </button>
                    <button type="button" className={styles.saveButton} onClick={handleSave}>
                        Salvar
                    </button>
                    {savedAt && <span className={styles.saved}>Salvo às {savedAt}</span>}
                </div>
            </header>

            <div className={styles.editor}>
                <aside className={styles.sidebar}>
                    <h2 className={styles.sidebarTitle}>Adicionar</h2>
                    <button
                        type="button"
                        className={styles.sidebarButton}
                        onClick={() => {
                            const id = generateId('block-text');
                            setContent((prev) => ({
                                ...prev,
                                blocks: [
                                    ...prev.blocks,
                                    { id, type: 'text', text: 'Novo bloco de texto', textId: id }
                                ],
                                textStyles: {
                                    ...prev.textStyles,
                                    [id]: { fontSize: 16, align: 'left' }
                                }
                            }));
                            setSelection({ type: 'block', id });
                        }}
                    >
                        + Texto
                    </button>
                    <button
                        type="button"
                        className={styles.sidebarButton}
                        onClick={() => {
                            const id = generateId('gallery');
                            setContent((prev) => ({
                                ...prev,
                                gallery: [
                                    ...prev.gallery,
                                    { id, src: prev.gallery[0]?.src || '', alt: 'Nova imagem' }
                                ],
                                imageStyles: {
                                    ...prev.imageStyles,
                                    [id]: { width: 100, borderRadius: 24, align: 'center' }
                                }
                            }));
                            setSelection({ type: 'image', id });
                        }}
                    >
                        + Imagem na galeria
                    </button>
                    <button
                        type="button"
                        className={styles.sidebarButton}
                        onClick={() => {
                            const id = generateId('block-image');
                            const imageId = generateId('image');
                            setContent((prev) => ({
                                ...prev,
                                blocks: [
                                    ...prev.blocks,
                                    {
                                        id,
                                        type: 'image',
                                        image: { id: imageId, src: prev.gallery[0]?.src || '', alt: 'Nova imagem' }
                                    }
                                ],
                                imageStyles: {
                                    ...prev.imageStyles,
                                    [imageId]: { width: 100, borderRadius: 24, align: 'center' }
                                }
                            }));
                            setSelection({ type: 'block', id });
                        }}
                    >
                        + Moldura de imagem
                    </button>
                    <button
                        type="button"
                        className={styles.sidebarButton}
                        onClick={() => {
                            const id = generateId('block-video');
                            setContent((prev) => ({
                                ...prev,
                                blocks: [
                                    ...prev.blocks,
                                    {
                                        id,
                                        type: 'video',
                                        video: { id: generateId('video'), src: '' }
                                    }
                                ]
                            }));
                            setSelection({ type: 'block', id });
                        }}
                    >
                        + Video
                    </button>
                    <button
                        type="button"
                        className={styles.sidebarButton}
                        onClick={() => {
                            const id = generateId('review');
                            setContent((prev) => ({
                                ...prev,
                                reviews: {
                                    ...prev.reviews,
                                    items: [
                                        ...prev.reviews.items,
                                        {
                                            id,
                                            name: 'Novo cliente',
                                            text: 'Escreva sua avaliação aqui.',
                                            stars: 5,
                                            avatar: prev.reviews.items[0]?.avatar || ''
                                        }
                                    ]
                                }
                            }));
                            setSelection({ type: 'review', id });
                        }}
                    >
                        + Avaliação
                    </button>

                    <div className={styles.themeSection}>
                        <h3 className={styles.sidebarTitle}>Cores</h3>
                        <label className={styles.label}>
                            Destaque
                            <input
                                type="color"
                                value={content.theme.accent}
                                onChange={(event) =>
                                    setContent((prev) => ({
                                        ...prev,
                                        theme: { ...prev.theme, accent: event.target.value }
                                    }))
                                }
                            />
                        </label>
                        <label className={styles.label}>
                            Texto
                            <input
                                type="color"
                                value={content.theme.text}
                                onChange={(event) =>
                                    setContent((prev) => ({
                                        ...prev,
                                        theme: { ...prev.theme, text: event.target.value }
                                    }))
                                }
                            />
                        </label>
                        <label className={styles.label}>
                            Fundo
                            <input
                                type="color"
                                value={content.theme.background}
                                onChange={(event) =>
                                    setContent((prev) => ({
                                        ...prev,
                                        theme: { ...prev.theme, background: event.target.value }
                                    }))
                                }
                            />
                        </label>
                    </div>
                </aside>

                <section className={styles.previewArea}>
                    <div className={`${styles.previewFrame} ${previewMode === 'mobile' ? styles.mobile : ''}`}>
                        <ProductPage
                            content={content}
                            editable
                            selection={selection}
                            onSelect={setSelection}
                            onTextChange={(id, value) => setContent((prev) => updateTextValue(prev, id, value))}
                            onImageChange={(id, value) => setContent((prev) => updateImageContent(prev, id, value))}
                            onReviewChange={(id, value) => setContent((prev) => updateReview(prev, id, value))}
                            onBlockChange={(id, value) => setContent((prev) => updateBlock(prev, id, value))}
                            onMainImageChange={(id) => setContent((prev) => moveGalleryImage(prev, id))}
                        />
                    </div>
                </section>

                <aside className={styles.inspector}>
                    <h2 className={styles.sidebarTitle}>Edição rápida</h2>
                    {!selection && <p className={styles.helper}>Clique em um elemento para editar.</p>}

                    {activeTextStyle && selectedTextId && (
                        <div className={styles.inspectorGroup}>
                            <h3 className={styles.groupTitle}>Texto</h3>
                            <label className={styles.label}>
                                Tamanho
                                <input
                                    type="range"
                                    min={12}
                                    max={54}
                                    value={activeTextStyle.fontSize || 16}
                                    onChange={(event) =>
                                        setContent((prev) =>
                                            updateTextStyle(prev, selectedTextId, {
                                                fontSize: Number(event.target.value)
                                            })
                                        )
                                    }
                                />
                            </label>
                            <label className={styles.label}>
                                Alinhamento
                                <select
                                    value={activeTextStyle.align || 'left'}
                                    onChange={(event) =>
                                        setContent((prev) =>
                                            updateTextStyle(prev, selectedTextId, {
                                                align: event.target.value as TextStyle['align']
                                            })
                                        )
                                    }
                                >
                                    <option value="left">Esquerda</option>
                                    <option value="center">Centro</option>
                                    <option value="right">Direita</option>
                                </select>
                            </label>
                            <label className={styles.label}>
                                Cor
                                <input
                                    type="color"
                                    value={activeTextStyle.color || content.theme.text}
                                    onChange={(event) =>
                                        setContent((prev) =>
                                            updateTextStyle(prev, selectedTextId, {
                                                color: event.target.value
                                            })
                                        )
                                    }
                                />
                            </label>
                        </div>
                    )}

                    {activeImageStyle && selectedImageId && (
                        <div className={styles.inspectorGroup}>
                            <h3 className={styles.groupTitle}>Imagem</h3>
                            <label className={styles.label}>
                                Tamanho
                                <input
                                    type="range"
                                    min={40}
                                    max={120}
                                    value={activeImageStyle.width || 100}
                                    onChange={(event) =>
                                        setContent((prev) =>
                                            updateImageStyle(prev, selectedImageId, {
                                                width: Number(event.target.value)
                                            })
                                        )
                                    }
                                />
                            </label>
                            <label className={styles.label}>
                                Bordas
                                <input
                                    type="range"
                                    min={0}
                                    max={48}
                                    value={activeImageStyle.borderRadius || 24}
                                    onChange={(event) =>
                                        setContent((prev) =>
                                            updateImageStyle(prev, selectedImageId, {
                                                borderRadius: Number(event.target.value)
                                            })
                                        )
                                    }
                                />
                            </label>
                            <label className={styles.label}>
                                Alinhamento
                                <select
                                    value={activeImageStyle.align || 'center'}
                                    onChange={(event) =>
                                        setContent((prev) =>
                                            updateImageStyle(prev, selectedImageId, {
                                                align: event.target.value as ImageStyle['align']
                                            })
                                        )
                                    }
                                >
                                    <option value="left">Esquerda</option>
                                    <option value="center">Centro</option>
                                    <option value="right">Direita</option>
                                </select>
                            </label>
                            <label className={styles.label}>
                                Trocar imagem
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            handleImageUpload(file);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    )}

                    {selectedReview && (
                        <div className={styles.inspectorGroup}>
                            <h3 className={styles.groupTitle}>Avaliação</h3>
                            <label className={styles.label}>
                                Estrelas
                                <input
                                    type="range"
                                    min={1}
                                    max={5}
                                    value={selectedReview.stars}
                                    onChange={(event) =>
                                        setContent((prev) =>
                                            updateReview(prev, selectedReview.id, {
                                                stars: Number(event.target.value)
                                            })
                                        )
                                    }
                                />
                            </label>
                            <label className={styles.label}>
                                Trocar foto
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            handleUpload(file, (url) => {
                                                setContent((prev) => updateReview(prev, selectedReview.id, { avatar: url }));
                                            });
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    )}

                    {selection?.type === 'block' && (
                        <div className={styles.inspectorGroup}>
                            <h3 className={styles.groupTitle}>Bloco</h3>
                            <label className={styles.label}>
                                Video
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            handleVideoUpload(file);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
