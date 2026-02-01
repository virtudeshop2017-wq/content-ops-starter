export type TextNode = {
  text: string;
  color?: string;
  size?: number;
  align?: 'left' | 'center' | 'right';
};

export type ImageNode = {
  src: string;
  alt?: string;
  align?: 'left' | 'center' | 'right';
  width?: number;
  rounded?: boolean;
};

export type VideoNode = {
  src: string;
  align?: 'left' | 'center' | 'right';
  width?: number;
};

export type ContentBlock =
  | {
      id: string;
      type: 'text';
      text: TextNode;
      align?: 'left' | 'center' | 'right';
    }
  | {
      id: string;
      type: 'image';
      src: string;
      alt?: string;
      align?: 'left' | 'center' | 'right';
      width?: number;
      rounded?: boolean;
    }
  | {
      id: string;
      type: 'video';
      src: string;
      align?: 'left' | 'center' | 'right';
      width?: number;
    };

export type ReviewItem = {
  name: TextNode;
  role: TextNode;
  rating: number;
  text: TextNode;
  avatar: string;
};

export type VirtudeContent = {
  brand: {
    name: TextNode;
    tagline: TextNode;
  };
  hero: {
    title: TextNode;
    subtitle: TextNode;
    ctaLabel: TextNode;
    note: TextNode;
    badge: TextNode;
  };
  highlights: {
    items: { title: TextNode; text: TextNode }[];
  };
  product: {
    title: TextNode;
    text: TextNode;
    points: TextNode[];
    image: ImageNode;
  };
  gallery: {
    title: TextNode;
    images: ImageNode[];
  };
  blocks: ContentBlock[];
  reviews: {
    title: TextNode;
    items: ReviewItem[];
  };
  footer: {
    text: TextNode;
    note: TextNode;
    links: { label: TextNode; url: string }[];
  };
};

export type EditorAuth = {
  email: string;
  password: string;
};

export const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export const getValueByPath = (obj: any, path: string) => {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

export const setValueByPath = (obj: any, path: string, value: any) => {
  const keys = path.split('.');
  const cloned = structuredClone(obj);
  let cursor: any = cloned;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
    } else {
      if (cursor[key] === undefined) {
        cursor[key] = {};
      }
      cursor = cursor[key];
    }
  });
  return cloned;
};
