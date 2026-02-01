import React, { useRef } from 'react';
import type { ImageNode } from '../../lib/virtude-content';

type EditableImageProps = {
  value: ImageNode;
  path: string;
  className?: string;
  editable?: boolean;
  onUpdate?: (path: string, next: ImageNode) => void;
  onSelect?: (path: string) => void;
  selected?: boolean;
};

export const EditableImage = ({
  value,
  path,
  className,
  editable,
  onUpdate,
  onSelect,
  selected
}: EditableImageProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = () => {
    if (editable) {
      onSelect?.(path);
    }
  };

  const openPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    inputRef.current?.click();
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdate?.(path, { ...value, src: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`${className ?? ''} virtude-image-wrapper ${value.align ? `virtude-image-${value.align}` : ''}`}
      onClick={handleSelect}
      data-editor-path={path}
      data-selected={selected ? 'true' : 'false'}
    >
      <img
        className="virtude-media"
        src={value.src}
        alt={value.alt || ''}
        style={{
          borderRadius: value.rounded ? '20px' : undefined,
          maxWidth: value.width ? `${value.width}%` : undefined
        }}
      />
      {editable && (
        <button type="button" className="virtude-image-action" onClick={openPicker}>
          Trocar imagem
        </button>
      )}
      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFile}
        />
      )}
    </div>
  );
};
