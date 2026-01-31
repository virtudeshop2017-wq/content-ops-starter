export type TextStyle = {
    fontSize?: number;
    align?: 'left' | 'center' | 'right';
    color?: string;
};

export type ImageStyle = {
    width?: number;
    align?: 'left' | 'center' | 'right';
    borderRadius?: number;
};

export type ProductImage = {
    id: string;
    src: string;
    alt: string;
};

export type ProductVideo = {
    id: string;
    src: string;
    poster?: string;
};

export type ProductReview = {
    id: string;
    name: string;
    text: string;
    stars: number;
    avatar: string;
};

export type ProductBlock =
    | {
          id: string;
          type: 'text';
          text: string;
          textId: string;
      }
    | {
          id: string;
          type: 'image';
          image: ProductImage;
      }
    | {
          id: string;
          type: 'video';
          video: ProductVideo;
      };

export type ProductContent = {
    brand: {
        name: string;
        tagline: string;
    };
    hero: {
        title: string;
        subtitle: string;
        description: string;
        badge: string;
        price: string;
        priceNote: string;
        stockLabel: string;
        ctaLabel: string;
    };
    gallery: ProductImage[];
    highlights: {
        title: string;
        items: Array<{ id: string; title: string; text: string }>;
    };
    reviews: {
        title: string;
        items: ProductReview[];
    };
    footer: {
        text: string;
        note: string;
    };
    blocks: ProductBlock[];
    textStyles: Record<string, TextStyle>;
    imageStyles: Record<string, ImageStyle>;
    theme: {
        accent: string;
        text: string;
        background: string;
    };
};

const STORAGE_KEY = 'virtude-product-content';

export const defaultContent: ProductContent = {
    brand: {
        name: 'virtude',
        tagline: 'desde 2017'
    },
    hero: {
        title: 'Smash Blush feno',
        subtitle: 'Sorriso renovado com tecnologia suave e precisa.',
        description:
            'Uma experiência confortável de limpeza profunda, com design premium e encaixe perfeito para o seu dia a dia.',
        badge: '2110 vendidos',
        price: 'R$ 69,90',
        priceNote: 'em até 12x de R$ 7,08',
        stockLabel: 'ESGOTADO',
        ctaLabel: 'Comprar agora'
    },
    gallery: [
        {
            id: 'gallery-1',
            src: '/images/main-hero.svg',
            alt: 'Produto Virtude em destaque'
        },
        {
            id: 'gallery-2',
            src: '/images/icon1.svg',
            alt: 'Detalhe do produto'
        },
        {
            id: 'gallery-3',
            src: '/images/icon2.svg',
            alt: 'Kit completo'
        },
        {
            id: 'gallery-4',
            src: '/images/icon3.svg',
            alt: 'Produto em uso'
        }
    ],
    highlights: {
        title: 'Destaques',
        items: [
            {
                id: 'highlight-1',
                title: 'Encaixe inteligente',
                text: 'Formato anatômico com toque macio, sem desconforto.'
            },
            {
                id: 'highlight-2',
                title: 'Bateria duradoura',
                text: 'Uso prolongado com carregamento rápido.'
            },
            {
                id: 'highlight-3',
                title: 'Acabamento premium',
                text: 'Design minimalista e elegante para o seu banheiro.'
            }
        ]
    },
    reviews: {
        title: 'Avaliações reais',
        items: [
            {
                id: 'review-1',
                name: 'Mariana N.',
                text: 'O encaixe é perfeito e o resultado é muito rápido. Recomendo.',
                stars: 5,
                avatar: '/images/empathy-logo.svg'
            },
            {
                id: 'review-2',
                name: 'João P.',
                text: 'Produto bonito e bem construído. A entrega foi super rápida.',
                stars: 4,
                avatar: '/images/telus-logo.svg'
            },
            {
                id: 'review-3',
                name: 'Carla F.',
                text: 'Gostei da praticidade e da sensação de limpeza suave.',
                stars: 5,
                avatar: '/images/vise-logo.svg'
            }
        ]
    },
    footer: {
        text: 'Virtude Shop • Atendimento premium e envio rápido para todo o Brasil.',
        note: 'Suporte dedicado via WhatsApp e garantia de satisfação.'
    },
    blocks: [
        {
            id: 'block-text-1',
            type: 'text',
            text: 'Mais detalhes que fazem a diferença para um sorriso confiante.',
            textId: 'block-text-1'
        }
    ],
    textStyles: {
        'hero-title': { fontSize: 40, align: 'left' },
        'hero-subtitle': { fontSize: 20, align: 'left' },
        'hero-description': { fontSize: 16, align: 'left' },
        'hero-badge': { fontSize: 12, align: 'left' },
        'hero-price': { fontSize: 34, align: 'left' },
        'hero-price-note': { fontSize: 14, align: 'left' },
        'hero-stock': { fontSize: 12, align: 'left' },
        'brand-name': { fontSize: 20, align: 'left' },
        'brand-tagline': { fontSize: 11, align: 'left' },
        'hero-cta': { fontSize: 15, align: 'left' },
        'highlights-title': { fontSize: 24, align: 'left' },
        'reviews-title': { fontSize: 24, align: 'left' },
        'footer-text': { fontSize: 14, align: 'left' },
        'footer-note': { fontSize: 12, align: 'left' },
        'block-text-1': { fontSize: 16, align: 'left' }
    },
    imageStyles: {
        'gallery-1': { width: 100, borderRadius: 32, align: 'center' },
        'gallery-2': { width: 100, borderRadius: 24, align: 'center' },
        'gallery-3': { width: 100, borderRadius: 24, align: 'center' },
        'gallery-4': { width: 100, borderRadius: 24, align: 'center' }
    },
    theme: {
        accent: '#2F6A12',
        text: '#1F1F1F',
        background: '#F7F5EF'
    }
};

export function loadContent(): ProductContent {
    if (typeof window === 'undefined') {
        return defaultContent;
    }
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return defaultContent;
        }
        const parsed = JSON.parse(stored);
        return { ...defaultContent, ...parsed };
    } catch (error) {
        return defaultContent;
    }
}

export function saveContent(content: ProductContent) {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

export function clearContent() {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.removeItem(STORAGE_KEY);
}
