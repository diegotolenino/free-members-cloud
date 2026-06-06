import React, { useEffect, useRef } from 'react';
import Icon from './Icons';

function ToolbarButton({ icon, label, onClick }) {
  return (
    <button aria-label={label} className="fm-rich-editor__tool" onClick={onClick} title={label} type="button">
      <Icon name={icon} size={15} />
    </button>
  );
}

export default function RichTextEditor({ label = 'Descrição', onChange, placeholder = 'Escreva aqui...', value = '' }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== String(value || '')) {
      editorRef.current.innerHTML = String(value || '');
    }
  }, [value]);

  function emitValue(nextValue) {
    onChange?.(nextValue);
  }

  function runCommand(command, commandValue = undefined) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitValue(editorRef.current?.innerHTML || '');
  }

  function insertLink() {
    const url = window.prompt('Informe a URL do link');

    if (!url) {
      return;
    }

    runCommand('createLink', url);
  }

  return (
    <div className="fm-rich-editor">
      <span className="fm-field-label">{label}</span>

      <div className="fm-rich-editor__toolbar">
        <ToolbarButton icon="bold" label="Negrito" onClick={() => runCommand('bold')} />
        <ToolbarButton icon="italic" label="Italico" onClick={() => runCommand('italic')} />
        <ToolbarButton icon="strike" label="Tachado" onClick={() => runCommand('strikeThrough')} />
        <ToolbarButton icon="link" label="Link" onClick={insertLink} />
        <ToolbarButton icon="list" label="Lista" onClick={() => runCommand('insertUnorderedList')} />
        <ToolbarButton icon="numberedList" label="Lista numerada" onClick={() => runCommand('insertOrderedList')} />
        <ToolbarButton icon="alignLeft" label="Alinhar a esquerda" onClick={() => runCommand('justifyLeft')} />
        <ToolbarButton icon="alignCenter" label="Centralizar" onClick={() => runCommand('justifyCenter')} />
        <ToolbarButton icon="alignRight" label="Alinhar a direita" onClick={() => runCommand('justifyRight')} />
      </div>

      <div
        className="fm-rich-editor__surface"
        contentEditable
        data-placeholder={placeholder}
        onBlur={() => emitValue(editorRef.current?.innerHTML || '')}
        onInput={() => emitValue(editorRef.current?.innerHTML || '')}
        ref={editorRef}
        suppressContentEditableWarning
      />
    </div>
  );
}
