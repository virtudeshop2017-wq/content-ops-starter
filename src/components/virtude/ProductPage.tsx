import React, { useMemo } from 'react';
import styles from './ProductPage.module.css';
import type { ProductContent, ProductImage, ProductReview, ProductBlock, TextStyle, ImageStyle } from '../../lib/virtude-content';

type Selection =
    | { type: 'text'; id: string }
    | { type: 'image'; id: string }
    | { type: 'review'; id: string }
    | { type: 'block'; id: string }
    | { type: 'footer'; id: string }
    | null;

type ProductPageProps = {
    content: ProductContent;
    editable?: boolean;
    selection?: Selection;
    onSelect?: (selection: Selection) => void;
    onTextChange?: (id: string, value: string) => void;
    onImageChange?: (id: string, value: ProductImage) => void;
    onReviewChange?: (id: string, value: Partial<ProductReview>) => void;
    onBlockChange?: (id: string, value: Partial<ProductBlock>) => void;
    onMainImageChange?: (id: string) => void;
};

const textStyleDefaults: TextStyle = { fontSize: 16, align: 'left' };
const imageStyleDefaults: ImageStyle = { width: 100, borderRadius: 24, align: 'center' };

function getAlignClass(align?: 'left' | 'center' | 'right') {
    if (align === 'center') return styles.alignCenter;
    if (align === 'right') return styles.alignRight;
    return styles.alignLeft;
}

function buildTextStyle(style: TextStyle, themeText: string) {
    return {
        fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
        textAlign: style.align,
        color: style.color || themeText
    } as React.CSSProperties;
}

function buildImageStyle(style: ImageStyle) {
    return {
        width: style.width ? `${style.width}%` : undefined,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined
    } as React.CSSProperties;
}

function buildImageAlignStyle(style: ImageStyle) {
    if (style.align === 'left') {
        return { justifyContent: 'flex-start' };
    }
    if (style.align === 'right') {
        return { justifyContent: 'flex-end' };
    }
    return { justifyContent: 'center' };
}

function EditableText({
    value,
    editable,
    onChange,
    onSelect,
    selected,
    className,
    style
}: {
    value: string;
    editable?: boolean;
    onChange?: (value: string) => void;
    onSelect?: () => void;
    selected?: boolean;
    className?: string;
    style?: React.CSSProperties;
}) {
    if (!editable) {
        return (
            <span className={className} style={style}>
                {value}
            </span>
        );
    }
    return (
        <span
            className={`${className ?? ''} ${styles.editableText} ${selected ? styles.selected : ''}`}
            style={style}
            contentEditable
            suppressContentEditableWarning
            onClick={(event) => {
                event.stopPropagation();
                onSelect?.();
            }}
            onInput={(event) => {
                const nextValue = event.currentTarget.textContent ?? '';
                onChange?.(nextValue);
            }}
        >
            {value}
        </span>
    );
}

function EditableImage({
    image,
    editable,
    selected,
    onSelect,
    style,
    alignStyle
}: {
    image: ProductImage;
    editable?: boolean;
    selected?: boolean;
    onSelect?: () => void;
    style?: React.CSSProperties;
    alignStyle?: React.CSSProperties;
}) {
    return (
        <div
            className={`${styles.editableMedia} ${selected ? styles.selected : ''}`}
            style={alignStyle}
            onClick={(event) => {
                event.stopPropagation();
                onSelect?.();
            }}
        >
            <img src={image.src} alt={image.alt} style={style} className={styles.media} />
            {editable && <span className={styles.editOverlay}>Editar</span>}
        </div>
    );
}

function Stars({ count }: { count: number }) {
    const stars = useMemo(() => Array.from({ length: 5 }, (_, index) => index < count), [count]);
    return (
        <div className={styles.stars}>
            {stars.map((filled, index) => (
                <span key={index} className={filled ? styles.starFilled : styles.starEmpty}>
                    ★
                </span>
            ))}
        </div>
    );
}

export default function ProductPage({
    content,
    editable,
    selection,
    onSelect,
    onTextChange,
    onImageChange,
    onReviewChange,
    onBlockChange,
    onMainImageChange
}: ProductPageProps) {
    const { theme } = content;
    const mainImageId = content.gallery[0]?.id;

    return (
        <div className={styles.page} style={{ background: theme.background, color: theme.text }}>
            <div className={styles.header}>
                <div className={styles.logo}>
                    <EditableText
                        value={content.brand.name}
                        editable={editable}
                        onSelect={() => onSelect?.({ type: 'text', id: 'brand-name' })}
                        selected={selection?.type === 'text' && selection.id === 'brand-name'}
                        onChange={(value) => onTextChange?.('brand-name', value)}
                        className={styles.logoMark}
                        style={buildTextStyle(content.textStyles['brand-name'] || textStyleDefaults, theme.accent)}
                    />
                    <EditableText
                        value={content.brand.tagline}
                        editable={editable}
                        onSelect={() => onSelect?.({ type: 'text', id: 'brand-tagline' })}
                        selected={selection?.type === 'text' && selection.id === 'brand-tagline'}
                        onChange={(value) => onTextChange?.('brand-tagline', value)}
                        className={styles.logoTagline}
                        style={buildTextStyle(content.textStyles['brand-tagline'] || textStyleDefaults, theme.text)}
                    />
                </div>
                <div className={styles.headerIcons}>
                    <span className={styles.headerIcon}>≡</span>
                    <span className={styles.headerIcon}>⌕</span>
                    <span className={styles.headerIcon}>🛒</span>
                </div>
            </div>

            <main className={styles.main}>
                <section className={styles.hero}>
                    <div className={styles.gallery}>
                        {content.gallery.length > 0 && (
                            <div className={styles.mainImage}>
                                <EditableImage
                                    image={content.gallery[0]}
                                    editable={editable}
                                    selected={selection?.type === 'image' && selection.id === content.gallery[0].id}
                                    onSelect={() => onSelect?.({ type: 'image', id: content.gallery[0].id })}
                                    style={buildImageStyle(content.imageStyles[content.gallery[0].id] || imageStyleDefaults)}
                                    alignStyle={buildImageAlignStyle(content.imageStyles[content.gallery[0].id] || imageStyleDefaults)}
                                />
                            </div>
                        )}
                        <div className={styles.thumbs}>
                            {content.gallery.slice(1).map((image) => (
                                <button
                                    type="button"
                                    key={image.id}
                                    className={`${styles.thumbButton} ${selection?.type === 'image' && selection.id === image.id ? styles.selected : ''}`}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        onSelect?.({ type: 'image', id: image.id });
                                        onMainImageChange?.(image.id);
                                    }}
                                >
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        style={buildImageStyle(content.imageStyles[image.id] || imageStyleDefaults)}
                                        className={styles.thumbImage}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.heroInfo}>
                        <EditableText
                            value={content.hero.badge}
                            editable={editable}
                            onSelect={() => onSelect?.({ type: 'text', id: 'hero-badge' })}
                            selected={selection?.type === 'text' && selection.id === 'hero-badge'}
                            onChange={(value) => onTextChange?.('hero-badge', value)}
                            className={styles.badge}
                            style={buildTextStyle(content.textStyles['hero-badge'] || textStyleDefaults, theme.accent)}
                        />
                        <EditableText
                            value={content.hero.title}
                            editable={editable}
                            onSelect={() => onSelect?.({ type: 'text', id: 'hero-title' })}
                            selected={selection?.type === 'text' && selection.id === 'hero-title'}
                            onChange={(value) => onTextChange?.('hero-title', value)}
                            className={styles.heroTitle}
                            style={buildTextStyle(content.textStyles['hero-title'] || textStyleDefaults, theme.text)}
                        />
                        <EditableText
                            value={content.hero.subtitle}
                            editable={editable}
                            onSelect={() => onSelect?.({ type: 'text', id: 'hero-subtitle' })}
                            selected={selection?.type === 'text' && selection.id === 'hero-subtitle'}
                            onChange={(value) => onTextChange?.('hero-subtitle', value)}
                            className={styles.heroSubtitle}
                            style={buildTextStyle(content.textStyles['hero-subtitle'] || textStyleDefaults, theme.text)}
                        />
                        <EditableText
                            value={content.hero.description}
                            editable={editable}
                            onSelect={() => onSelect?.({ type: 'text', id: 'hero-description' })}
                            selected={selection?.type === 'text' && selection.id === 'hero-description'}
                            onChange={(value) => onTextChange?.('hero-description', value)}
                            className={styles.heroDescription}
                            style={buildTextStyle(content.textStyles['hero-description'] || textStyleDefaults, theme.text)}
                        />
                        <div className={styles.priceRow}>
                            <EditableText
                                value={content.hero.price}
                                editable={editable}
                                onSelect={() => onSelect?.({ type: 'text', id: 'hero-price' })}
                                selected={selection?.type === 'text' && selection.id === 'hero-price'}
                                onChange={(value) => onTextChange?.('hero-price', value)}
                                className={styles.price}
                                style={buildTextStyle(content.textStyles['hero-price'] || textStyleDefaults, theme.text)}
                            />
                            <EditableText
                                value={content.hero.stockLabel}
                                editable={editable}
                                onSelect={() => onSelect?.({ type: 'text', id: 'hero-stock' })}
                                selected={selection?.type === 'text' && selection.id === 'hero-stock'}
                                onChange={(value) => onTextChange?.('hero-stock', value)}
                                className={styles.stockPill}
                                style={buildTextStyle(content.textStyles['hero-stock'] || textStyleDefaults, theme.text)}
                            />
                        </div>
                        <EditableText
                            value={content.hero.priceNote}
                            editable={editable}
                            onSelect={() => onSelect?.({ type: 'text', id: 'hero-price-note' })}
                            selected={selection?.type === 'text' && selection.id === 'hero-price-note'}
                            onChange={(value) => onTextChange?.('hero-price-note', value)}
                            className={styles.priceNote}
                            style={buildTextStyle(content.textStyles['hero-price-note'] || textStyleDefaults, theme.text)}
                        />
                        <button className={styles.cta} style={{ background: theme.accent }} type="button">
                            <EditableText
                                value={content.hero.ctaLabel}
                                editable={editable}
                                onSelect={() => onSelect?.({ type: 'text', id: 'hero-cta' })}
                                selected={selection?.type === 'text' && selection.id === 'hero-cta'}
                                onChange={(value) => onTextChange?.('hero-cta', value)}
                                className={styles.ctaText}
                                style={buildTextStyle(content.textStyles['hero-cta'] || textStyleDefaults, '#ffffff')}
                            />
                        </button>
                    </div>
                </section>

                <section className={styles.highlights}>
                    <EditableText
                        value={content.highlights.title}
                        editable={editable}
                        onSelect={() => onSelect?.({ type: 'text', id: 'highlights-title' })}
                        selected={selection?.type === 'text' && selection.id === 'highlights-title'}
                        onChange={(value) => onTextChange?.('highlights-title', value)}
                        className={styles.sectionTitle}
                        style={buildTextStyle(content.textStyles['highlights-title'] || textStyleDefaults, theme.text)}
                    />
                    <div className={styles.highlightGrid}>
                        {content.highlights.items.map((item) => (
                            <div className={styles.highlightCard} key={item.id}>
                                <EditableText
                                    value={item.title}
                                    editable={editable}
                                    onSelect={() => onSelect?.({ type: 'text', id: item.id })}
                                    selected={selection?.type === 'text' && selection.id === item.id}
                                    onChange={(value) => onTextChange?.(item.id, value)}
                                    className={styles.highlightTitle}
                                    style={buildTextStyle(content.textStyles[item.id] || textStyleDefaults, theme.text)}
                                />
                                <EditableText
                                    value={item.text}
                                    editable={editable}
                                    onSelect={() => onSelect?.({ type: 'text', id: `${item.id}-text` })}
                                    selected={selection?.type === 'text' && selection.id === `${item.id}-text`}
                                    onChange={(value) => onTextChange?.(`${item.id}-text`, value)}
                                    className={styles.highlightText}
                                    style={buildTextStyle(content.textStyles[`${item.id}-text`] || textStyleDefaults, theme.text)}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.blocks}>
                    {content.blocks.map((block) => {
                        if (block.type === 'text') {
                            return (
                                <div
                                    key={block.id}
                                    className={`${styles.block} ${selection?.type === 'block' && selection.id === block.id ? styles.selected : ''}`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onSelect?.({ type: 'block', id: block.id });
                                    }}
                                >
                                    <EditableText
                                        value={block.text}
                                        editable={editable}
                                        onSelect={() => onSelect?.({ type: 'block', id: block.id })}
                                        selected={selection?.type === 'block' && selection.id === block.id}
                                        onChange={(value) => onBlockChange?.(block.id, { text: value })}
                                        className={styles.blockText}
                                        style={buildTextStyle(content.textStyles[block.textId] || textStyleDefaults, theme.text)}
                                    />
                                </div>
                            );
                        }
                        if (block.type === 'image') {
                            return (
                                <div
                                    key={block.id}
                                    className={`${styles.block} ${styles.blockMedia} ${selection?.type === 'block' && selection.id === block.id ? styles.selected : ''}`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onSelect?.({ type: 'block', id: block.id });
                                    }}
                                >
                                    <EditableImage
                                        image={block.image}
                                        editable={editable}
                                        selected={selection?.type === 'block' && selection.id === block.id}
                                        onSelect={() => onSelect?.({ type: 'block', id: block.id })}
                                        style={buildImageStyle(content.imageStyles[block.image.id] || imageStyleDefaults)}
                                        alignStyle={buildImageAlignStyle(content.imageStyles[block.image.id] || imageStyleDefaults)}
                                    />
                                </div>
                            );
                        }
                        return (
                            <div
                                key={block.id}
                                className={`${styles.block} ${styles.blockMedia} ${selection?.type === 'block' && selection.id === block.id ? styles.selected : ''}`}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onSelect?.({ type: 'block', id: block.id });
                                }}
                            >
                                <video
                                    controls
                                    className={styles.video}
                                    src={block.video.src}
                                    poster={block.video.poster}
                                />
                                {editable && <span className={styles.editOverlay}>Editar</span>}
                            </div>
                        );
                    })}
                </section>

                <section className={styles.reviews}>
                    <EditableText
                        value={content.reviews.title}
                        editable={editable}
                        onSelect={() => onSelect?.({ type: 'text', id: 'reviews-title' })}
                        selected={selection?.type === 'text' && selection.id === 'reviews-title'}
                        onChange={(value) => onTextChange?.('reviews-title', value)}
                        className={styles.sectionTitle}
                        style={buildTextStyle(content.textStyles['reviews-title'] || textStyleDefaults, theme.text)}
                    />
                    <div className={styles.reviewGrid}>
                        {content.reviews.items.map((review) => (
                            <div
                                key={review.id}
                                className={`${styles.reviewCard} ${selection?.type === 'review' && selection.id === review.id ? styles.selected : ''}`}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onSelect?.({ type: 'review', id: review.id });
                                }}
                            >
                                <div className={styles.reviewHeader}>
                                    <img src={review.avatar} alt={review.name} className={styles.reviewAvatar} />
                                    <div>
                                        <EditableText
                                            value={review.name}
                                            editable={editable}
                                            onSelect={() => onSelect?.({ type: 'review', id: review.id })}
                                            selected={selection?.type === 'review' && selection.id === review.id}
                                            onChange={(value) => onReviewChange?.(review.id, { name: value })}
                                            className={styles.reviewName}
                                            style={buildTextStyle(content.textStyles[review.id] || textStyleDefaults, theme.text)}
                                        />
                                        <Stars count={review.stars} />
                                    </div>
                                </div>
                                <EditableText
                                    value={review.text}
                                    editable={editable}
                                    onSelect={() => onSelect?.({ type: 'review', id: review.id })}
                                    selected={selection?.type === 'review' && selection.id === review.id}
                                    onChange={(value) => onReviewChange?.(review.id, { text: value })}
                                    className={styles.reviewText}
                                    style={buildTextStyle(content.textStyles[`${review.id}-text`] || textStyleDefaults, theme.text)}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <EditableText
                    value={content.footer.text}
                    editable={editable}
                    onSelect={() => onSelect?.({ type: 'footer', id: 'footer-text' })}
                    selected={selection?.type === 'footer' && selection.id === 'footer-text'}
                    onChange={(value) => onTextChange?.('footer-text', value)}
                    className={styles.footerText}
                    style={buildTextStyle(content.textStyles['footer-text'] || textStyleDefaults, theme.text)}
                />
                <EditableText
                    value={content.footer.note}
                    editable={editable}
                    onSelect={() => onSelect?.({ type: 'footer', id: 'footer-note' })}
                    selected={selection?.type === 'footer' && selection.id === 'footer-note'}
                    onChange={(value) => onTextChange?.('footer-note', value)}
                    className={styles.footerNote}
                    style={buildTextStyle(content.textStyles['footer-note'] || textStyleDefaults, theme.text)}
                />
            </footer>
        </div>
    );
}
