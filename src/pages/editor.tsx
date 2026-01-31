import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import defaultContent from '../data/virtude-default.json';
import {
  VirtudeContent,
  TextNode,
  ImageNode,
  ContentBlock,
  createId,
  getValueByPath,
  setValueByPath
} from '../lib/virtude-content';
import { VirtudePage } from '../components/virtude/VirtudePage';

const EditorPage = () => {
  const router = useRouter();
  const [content, setContent] = useState<VirtudeContent>(defaultContent as VirtudeContent);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [status, setStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [auth, setAuth] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem('virtudeEditorAuth');
    if (!raw) return;
    try {
      setAuth(JSON.parse(raw) as { email: string; password: string });
    } catch {
      setAuth(null);
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      router.replace('/editor-login');
      return;
    }
    fetch('/api/virtude-content')
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.content) return;
        setContent(data.content as VirtudeContent);
      })
      .catch(() => undefined);
  }, [auth, router]);

  const updateContent = (path: string, value: any) => {
    setContent((prev) => setValueByPath(prev, path, value));
  };

  const handleSave = async () => {
    if (!auth) return;
    setIsSaving(true);
    setStatus('Salvando...');
    try {
      const response = await fetch('/api/virtude-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, auth })
      });
      if (!response.ok) {
        setStatus('Nao foi possivel salvar.');
        setIsSaving(false);
        return;
      }
      setStatus('Alteracoes salvas com sucesso.');
    } catch (err) {
      setStatus('Falha ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const addTextBlock = () => {
    const nextBlock: ContentBlock = {
      id: createId('text'),
      type: 'text',
      text: { text: 'Novo texto', color: '#384233', size: 18 },
      align: 'left'
    };
    setContent((prev) => ({ ...prev, blocks: [...prev.blocks, nextBlock] }));
  };

  const addImageBlock = () => {
    const nextBlock: ContentBlock = {
      id: createId('image'),
      type: 'image',
      src: '/images/abstract-feature2.svg',
      alt: 'Nova imagem',
      align: 'center',
      width: 70,
      rounded: true
    };
    setContent((prev) => ({ ...prev, blocks: [...prev.blocks, nextBlock] }));
  };

  const addVideoBlock = () => {
    const nextBlock: ContentBlock = {
      id: createId('video'),
      type: 'video',
      src: 'https://www.youtube.com/embed/ysz5S6PUM-U',
      align: 'center',
      width: 80
    };
    setContent((prev) => ({ ...prev, blocks: [...prev.blocks, nextBlock] }));
  };

  const addGalleryImage = () => {
    const nextImage: ImageNode = {
      src: '/images/abstract-feature3.svg',
      alt: 'Nova imagem',
      align: 'center',
      width: 100,
      rounded: true
    };
    setContent((prev) => ({
      ...prev,
      gallery: { ...prev.gallery, images: [...prev.gallery.images, nextImage] }
    }));
  };

  const addReview = () => {
    setContent((prev) => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        items: [
          ...prev.reviews.items,
          {
            name: { text: 'Nova avaliacao', color: '#23301C', size: 16 },
            role: { text: 'Cliente', color: '#6B7466', size: 13 },
            rating: 5,
            text: { text: 'Escreva a avaliacao aqui.', color: '#4F5B47', size: 14 },
            avatar: '/images/avatar4.svg'
          }
        ]
      }
    }));
  };

  const addFooterLink = () => {
    setContent((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        links: [...prev.footer.links, { label: { text: 'Novo link', color: '#2F6F18', size: 13 }, url: '/' }]
      }
    }));
  };

  const selectedValue = selectedPath ? getValueByPath(content, selectedPath) : null;
  const selectedText = selectedValue && typeof selectedValue === 'object' && 'text' in selectedValue ? (selectedValue as TextNode) : null;
  const selectedImage = selectedValue && typeof selectedValue === 'object' && 'src' in selectedValue ? (selectedValue as ImageNode) : null;
  const selectedBlock = selectedValue && typeof selectedValue === 'object' && 'type' in selectedValue ? (selectedValue as ContentBlock) : null;
  const selectedUrl = typeof selectedValue === 'string' && selectedPath?.endsWith('.url') ? selectedValue : null;
  const imageControlTarget = selectedBlock?.type === 'image' ? (selectedBlock as ImageNode & ContentBlock) : selectedImage;

  const handleTextStyleChange = (field: keyof TextNode, value: string | number) => {
    if (!selectedText || !selectedPath) return;
    updateContent(selectedPath, { ...selectedText, [field]: value });
  };

  const handleImageStyleChange = (field: keyof ImageNode, value: string | number | boolean) => {
    if (!selectedPath) return;
    if (selectedBlock?.type === 'image') {
      updateContent(selectedPath, { ...selectedBlock, [field]: value });
      return;
    }
    if (!selectedImage) return;
    updateContent(selectedPath, { ...selectedImage, [field]: value });
  };

  const handleBlockStyleChange = (field: keyof ContentBlock, value: any) => {
    if (!selectedBlock || !selectedPath) return;
    updateContent(selectedPath, { ...selectedBlock, [field]: value });
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedBlock || selectedBlock.type !== 'video' || !selectedPath) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateContent(selectedPath, { ...selectedBlock, src: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRatingChange = (value: number) => {
    if (!selectedPath) return;
    updateContent(selectedPath, value);
  };

  if (!auth) {
    return null;
  }

  return (
    <div className="virtude-editor">
      <aside className="virtude-editor-panel">
        <div className="virtude-editor-header">
          <h2>Editor Virtude</h2>
          <div className="virtude-editor-actions">
            <button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
          {status && <span className="virtude-editor-status">{status}</span>}
        </div>

        <div className="virtude-editor-controls">
          <div className="virtude-editor-block">
            <h3>Preview</h3>
            <div className="virtude-editor-toggle">
              <button type="button" className={previewMode === 'desktop' ? 'active' : ''} onClick={() => setPreviewMode('desktop')}>
                Desktop
              </button>
              <button type="button" className={previewMode === 'mobile' ? 'active' : ''} onClick={() => setPreviewMode('mobile')}>
                Celular
              </button>
            </div>
          </div>

          <div className="virtude-editor-block">
            <h3>Adicionar</h3>
            <div className="virtude-editor-buttons">
              <button type="button" onClick={addTextBlock}>+ Texto</button>
              <button type="button" onClick={addImageBlock}>+ Imagem</button>
              <button type="button" onClick={addVideoBlock}>+ Video</button>
              <button type="button" onClick={addGalleryImage}>+ Moldura</button>
              <button type="button" onClick={addReview}>+ Avaliacao</button>
              <button type="button" onClick={addFooterLink}>+ Link rodape</button>
            </div>
          </div>

          {selectedText && (
            <div className="virtude-editor-block">
              <h3>Texto</h3>
              <label>
                Tamanho
                <input
                  type="range"
                  min={12}
                  max={56}
                  value={selectedText.size || 16}
                  onChange={(event) => handleTextStyleChange('size', Number(event.target.value))}
                />
              </label>
              <label>
                Cor
                <input
                  type="color"
                  value={selectedText.color || '#23301C'}
                  onChange={(event) => handleTextStyleChange('color', event.target.value)}
                />
              </label>
              <label>
                Alinhamento
                <select value={selectedText.align || 'left'} onChange={(event) => handleTextStyleChange('align', event.target.value)}>
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                </select>
              </label>
            </div>
          )}

          {imageControlTarget && (
            <div className="virtude-editor-block">
              <h3>Imagem</h3>
              <label>
                Largura
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={imageControlTarget.width || 100}
                  onChange={(event) => handleImageStyleChange('width', Number(event.target.value))}
                />
              </label>
              <label>
                Borda arredondada
                <input
                  type="checkbox"
                  checked={imageControlTarget.rounded ?? true}
                  onChange={(event) => handleImageStyleChange('rounded', event.target.checked)}
                />
              </label>
              <label>
                Alinhamento
                <select value={imageControlTarget.align || 'center'} onChange={(event) => handleImageStyleChange('align', event.target.value)}>
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                </select>
              </label>
            </div>
          )}

          {selectedBlock && (
            <div className="virtude-editor-block">
              <h3>Bloco</h3>
              <label>
                Alinhamento
                <select value={selectedBlock.align || 'center'} onChange={(event) => handleBlockStyleChange('align', event.target.value)}>
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                </select>
              </label>
              {selectedBlock.type === 'video' && (
                <>
                  <label>
                    URL do video
                    <input
                      type="text"
                      value={selectedBlock.src}
                      onChange={(event) => handleBlockStyleChange('src', event.target.value)}
                    />
                  </label>
                  <label>
                    Upload do video
                    <input type="file" accept="video/*" onChange={handleVideoUpload} />
                  </label>
                  <label>
                    Largura
                    <input
                      type="range"
                      min={40}
                      max={100}
                      value={selectedBlock.width || 80}
                      onChange={(event) => handleBlockStyleChange('width', Number(event.target.value))}
                    />
                  </label>
                </>
              )}
            </div>
          )}

          {selectedPath?.includes('rating') && (
            <div className="virtude-editor-block">
              <h3>Estrelas</h3>
              <label>
                Quantidade
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={Number(selectedValue || 5)}
                  onChange={(event) => handleRatingChange(Number(event.target.value))}
                />
              </label>
            </div>
          )}

          {selectedUrl !== null && (
            <div className="virtude-editor-block">
              <h3>Link</h3>
              <label>
                URL
                <input
                  type="text"
                  value={selectedUrl}
                  onChange={(event) => updateContent(selectedPath as string, event.target.value)}
                />
              </label>
            </div>
          )}
        </div>
      </aside>

      <section className={`virtude-editor-preview ${previewMode === 'mobile' ? 'mobile' : ''}`}>
        <div className="virtude-editor-preview-inner">
          <VirtudePage
            content={content}
            editable
            selectedPath={selectedPath}
            onUpdate={updateContent}
            onSelect={(path) => setSelectedPath(path)}
          />
        </div>
      </section>
    </div>
  );
};

export default EditorPage;
