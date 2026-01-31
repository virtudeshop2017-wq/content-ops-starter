import React, { useEffect, useRef } from 'react';
import type { TextNode } from '../../lib/virtude-content';

type EditableTextProps = {
  value: TextNode;
  path: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  editable?: boolean;
  onUpdate?: (path: string, next: TextNode) => void;
  onSelect?: (path: string) => void;
  selected?: boolean;
};

export const EditableText = ({
  value,
  path,
  as = 'div',
  className,
  editable,
  onUpdate,
  onSelect,
  selected
}: EditableTextProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const Element = as as any;

  useEffect(() => {
    if (!ref.current || editable) return;
    ref.current.textContent = value.text;
  }, [editable, value.text]);

  const handleInput = (event: React.FormEvent<HTMLElement>) => {
    const nextText = event.currentTarget.textContent ?? '';
    onUpdate?.(path, { ...value, text: nextText });
  };

  const handleClick = () => {
    if (editable) {
      onSelect?.(path);
    }
  };

  const style: React.CSSProperties = {
    color: value.color,
    fontSize: value.size ? `${value.size}px` : undefined,
    textAlign: value.align
  };

  return (
    <Element
      ref={ref}
      className={className}
      contentEditable={editable}
      suppressContentEditableWarning
      onInput={editable ? handleInput : undefined}
      onClick={handleClick}
      style={style}
      data-editor-path={path}
      data-selected={selected ? 'true' : 'false'}
    >
      {value.text}
    </Element>
  );
};
