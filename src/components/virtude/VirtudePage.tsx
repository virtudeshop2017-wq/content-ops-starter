import React from 'react';
import type { VirtudeContent, TextNode, ContentBlock, ImageNode, VideoNode } from '../../lib/virtude-content';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';

const alignClass = (align?: string) => {
  switch (align) {
    case 'center':
      return 'text-center items-center justify-center';
    case 'right':
      return 'text-right items-end justify-end';
    default:
      return 'text-left items-start justify-start';
  }
};

const blockAlign = (align?: string) => {
  switch (align) {
    case 'center':
      return 'self-center text-center';
    case 'right':
      return 'self-end text-right';
    default:
      return 'self-start text-left';
  }
};

type VirtudePageProps = {
  content: VirtudeContent;
  editable?: boolean;
  selectedPath?: string | null;
  onUpdate?: (path: string, value: any) => void;
  onSelect?: (path: string) => void;
};

export const VirtudePage = ({ content, editable, selectedPath, onUpdate, onSelect }: VirtudePageProps) => {
  const renderText = (value: TextNode, path: string, className: string, as: keyof JSX.IntrinsicElements = 'div') => (
    <EditableText
      value={value}
      path={path}
      className={className}
      as={as}
      editable={editable}
      onUpdate={(nextPath, nextValue) => onUpdate?.(nextPath, nextValue)}
      onSelect={onSelect}
      selected={selectedPath === path}
    />
  );

  const renderImage = (value: ImageNode, path: string, className?: string) => (
    <EditableImage
      value={value}
      path={path}
      className={className}
      editable={editable}
      onUpdate={(nextPath, nextValue) => onUpdate?.(nextPath, nextValue)}
      onSelect={onSelect}
      selected={selectedPath === path}
    />
  );

  const renderVideo = (value: VideoNode, path: string) => {
    const isDirectVideo =
      value.src?.startsWith('data:video') || value.src?.startsWith('blob:') || value.src?.endsWith('.mp4');

    return (
      <div
        className={`virtude-video ${blockAlign(value.align)}`}
        data-editor-path={path}
        data-selected={selectedPath === path ? 'true' : 'false'}
        onClick={() => (editable ? onSelect?.(path) : undefined)}
      >
        <div className="virtude-video-frame" style={{ maxWidth: value.width ? `${value.width}%` : undefined }}>
          {isDirectVideo ? (
            <video src={value.src} controls />
          ) : (
            <iframe
              src={value.src}
              title="Virtude video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    );
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    const pathBase = `blocks.${index}`;
    if (block.type === 'text') {
      return (
        <div key={block.id} className={`virtude-block ${blockAlign(block.align)}`}>
          {renderText(block.text, `${pathBase}.text`, 'virtude-block-text', 'p')}
        </div>
      );
    }
    if (block.type === 'image') {
      return (
        <div key={block.id} className={`virtude-block ${blockAlign(block.align)}`}>
          {renderImage(
            {
              src: block.src,
              alt: block.alt,
              align: block.align,
              width: block.width,
              rounded: block.rounded
            },
            `${pathBase}`,
            'virtude-block-media'
          )}
        </div>
      );
    }
    return (
      <div key={block.id} className={`virtude-block ${blockAlign(block.align)}`}>
        {renderVideo(
          {
            src: block.src,
            align: block.align,
            width: block.width
          },
          `${pathBase}`
        )}
      </div>
    );
  };

  return (
    <div className="virtude-root">
      <section className="virtude-hero">
        <div className="virtude-hero-card">
          <div className="virtude-hero-content">
            <div className="virtude-logo">
              <span className="virtude-logo-mark">●</span>
              {renderText(content.brand.name, 'brand.name', 'virtude-logo-text', 'span')}
            </div>
            {renderText(content.brand.tagline, 'brand.tagline', 'virtude-tagline', 'p')}
            {renderText(content.hero.badge, 'hero.badge', 'virtude-badge', 'span')}
            {renderText(content.hero.title, 'hero.title', 'virtude-hero-title virtude-glow', 'h1')}
            {renderText(content.hero.subtitle, 'hero.subtitle', 'virtude-hero-subtitle', 'p')}
            <button className="virtude-button" type="button">
              {renderText(content.hero.ctaLabel, 'hero.ctaLabel', 'virtude-button-text', 'span')}
            </button>
            {renderText(content.hero.note, 'hero.note', 'virtude-hero-note', 'p')}
          </div>
          <div className="virtude-hero-image">
            {renderImage(content.product.image, 'product.image', 'virtude-product-image')}
          </div>
        </div>
      </section>

      <section className="virtude-section">
        <div className="virtude-grid">
          {content.highlights.items.map((item, index) => (
            <div key={`highlight-${index}`} className="virtude-card">
              {renderText(item.title, `highlights.items.${index}.title`, 'virtude-card-title', 'h3')}
              {renderText(item.text, `highlights.items.${index}.text`, 'virtude-card-text', 'p')}
            </div>
          ))}
        </div>
      </section>

      <section className="virtude-section">
        <div className="virtude-product">
          <div className={`virtude-product-text ${alignClass(content.product.image.align)}`}>
            {renderText(content.product.title, 'product.title', 'virtude-section-title', 'h2')}
            {renderText(content.product.text, 'product.text', 'virtude-section-text', 'p')}
            <ul className="virtude-list">
              {content.product.points.map((point, index) => (
                <li key={`point-${index}`}>
                  {renderText(point, `product.points.${index}`, 'virtude-list-text', 'span')}
                </li>
              ))}
            </ul>
          </div>
          <div className="virtude-product-media">
            {renderImage(content.product.image, 'product.image', 'virtude-product-image')}
          </div>
        </div>
      </section>

      <section className="virtude-section">
        {renderText(content.gallery.title, 'gallery.title', 'virtude-section-title', 'h2')}
        <div className="virtude-gallery">
          {content.gallery.images.map((image, index) => (
            <div key={`gallery-${index}`} className="virtude-gallery-item">
              {renderImage(image, `gallery.images.${index}`, 'virtude-gallery-image')}
            </div>
          ))}
        </div>
      </section>

      <section className="virtude-section">
        <div className="virtude-blocks">{content.blocks.map(renderBlock)}</div>
      </section>

      <section className="virtude-section">
        {renderText(content.reviews.title, 'reviews.title', 'virtude-section-title', 'h2')}
        <div className="virtude-reviews">
          {content.reviews.items.map((review, index) => (
            <div key={`review-${index}`} className="virtude-review-card">
              <div className="virtude-review-header">
                <EditableImage
                  value={{ src: review.avatar, alt: review.name.text, rounded: true, width: 100 }}
                  path={`reviews.items.${index}.avatar`}
                  editable={editable}
                  onUpdate={(nextPath, nextValue) => onUpdate?.(nextPath, nextValue.src)}
                  onSelect={onSelect}
                  selected={selectedPath === `reviews.items.${index}.avatar`}
                  className="virtude-review-avatar"
                />
                <div className="virtude-review-meta">
                  {renderText(review.name, `reviews.items.${index}.name`, 'virtude-review-name', 'p')}
                  {renderText(review.role, `reviews.items.${index}.role`, 'virtude-review-role', 'p')}
                </div>
              </div>
              <div
                className="virtude-review-stars"
                data-editor-path={`reviews.items.${index}.rating`}
                data-selected={selectedPath === `reviews.items.${index}.rating` ? 'true' : 'false'}
                onClick={() => (editable ? onSelect?.(`reviews.items.${index}.rating`) : undefined)}
              >
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <span
                    key={starIndex}
                    className={starIndex < review.rating ? 'active' : ''}
                    onClick={() => (editable ? onUpdate?.(`reviews.items.${index}.rating`, starIndex + 1) : undefined)}
                  >
                    ★
                  </span>
                ))}
              </div>
              {renderText(review.text, `reviews.items.${index}.text`, 'virtude-review-text', 'p')}
            </div>
          ))}
        </div>
      </section>

      <footer className="virtude-footer">
        <div className="virtude-footer-content">
          {renderText(content.footer.text, 'footer.text', 'virtude-footer-text', 'p')}
          <div className="virtude-footer-links">
            {content.footer.links.map((link, index) => (
              <a
                key={`footer-link-${index}`}
                href={link.url}
                className="virtude-footer-link"
                data-editor-path={`footer.links.${index}.url`}
                data-selected={selectedPath === `footer.links.${index}.url` ? 'true' : 'false'}
                onClick={(event) => {
                  if (editable) {
                    event.preventDefault();
                    onSelect?.(`footer.links.${index}.url`);
                  }
                }}
              >
                {renderText(link.label, `footer.links.${index}.label`, 'virtude-footer-link-text', 'span')}
              </a>
            ))}
          </div>
        </div>
        {renderText(content.footer.note, 'footer.note', 'virtude-footer-note', 'p')}
      </footer>
    </div>
  );
};
