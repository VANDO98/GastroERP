import React, { useState, useMemo } from 'react';
import { Search, X, Smile } from 'lucide-react';

interface EmojiGroup {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export const EMOJI_GROUPS: EmojiGroup[] = [
  {
    id: 'frutas',
    name: 'Frutas & Vegetales',
    icon: '🍓',
    emojis: [
      '🍓', '🍌', '🥭', '🍍', '🥑', '🍋', '🍊', '🍏', '🍎', '🍐', '🍇', '🍉', '🍈', '🍑', '🍒', '🥝', '🥥',
      '🍅', '🥕', '🌽', '🥔', '🧅', '🧄', '🥬', '🥦', '🥒', '🌶️', '🫑', '🍄', '🍠', '🫒'
    ]
  },
  {
    id: 'panaderia',
    name: 'Panadería, Masas & Comidas',
    icon: '🥖',
    emojis: [
      '🥖', '🍞', '🥐', '🥯', '🥞', '🧇', '🥨', '🥪', '🍔', '🍕', '🌯', '🌮', '🥟', '🫓', '🫔', '🌭',
      '🍟', '🥙', '🍳', '🥚'
    ]
  },
  {
    id: 'helados_dulces',
    name: 'Helados, Postres & Dulces',
    icon: '🍨',
    emojis: [
      '🍨', '🍦', '🍧', '🍰', '🎂', '🧁', '🥧', '🍮', '🍫', '🍬', '🍭', '🍯', '🍩', '🍪', '🍿', '🍡'
    ]
  },
  {
    id: 'lacteos_bebidas',
    name: 'Lácteos, Bebidas & Cafetería',
    icon: '🥛',
    emojis: [
      '🥛', '🧀', '🥤', '🧃', '🧉', '🧋', '☕', '🍵', '🍺', '🍷', '🍸', '🍹', '🍾', '🧊', '🫗', '🍶'
    ]
  },
  {
    id: 'proteinas',
    name: 'Carnes & Proteínas',
    icon: '🥩',
    emojis: [
      '🥩', '🍗', '🍖', '🥓', '🍤', '🐟', '🍣', '🦀', '🦐', '🦑', '🐙'
    ]
  },
  {
    id: 'abarrotes',
    name: 'Abarrotes & Especias',
    icon: '🌾',
    emojis: [
      '🌾', '🍚', '🍝', '🍜', '🥣', '🧂', '🥜', '🌰', '🫘', '🌿', '🍃', '🥫'
    ]
  },
  {
    id: 'descartables',
    name: 'Empaques & Vajilla',
    icon: '📦',
    emojis: [
      '📦', '🛍️', '🥡', '🍽️', '🍴', '🥄', '🥢', '🏷️', '📋'
    ]
  },
  {
    id: 'limpieza',
    name: 'Limpieza & Químicos',
    icon: '🧼',
    emojis: [
      '🧼', '🧽', '🧴', '🧹', '🧺', '🧻', '🗑️', '🪣', '🫧', '🧯'
    ]
  },
  {
    id: 'simbolos',
    name: 'Símbolos & Varios',
    icon: '✨',
    emojis: [
      '✨', '⭐', '🌟', '🔥', '❄️', '⚡', '💎', '🎯', '💡', '🛎️', '🔔', '🛒', '🏷️'
    ]
  }
];

// Helper para extraer un emoji Unicode de cualquier texto pegado
export function extractFirstEmoji(text: string, fallback = '🏷️'): string {
  if (!text) return fallback;
  // Regex para detectar caracteres emoji Unicode (incluye modificadores de tono, secuencias ZWJ y símbolos)
  const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;
  const match = text.match(emojiRegex);
  return match ? match[0] : (text.trim().substring(0, 2) || fallback);
}

interface EmojiPickerProps {
  value: string;
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  isLight?: boolean;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  value,
  onSelect,
  onClose,
  isLight = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [pasteInput, setPasteInput] = useState('');

  const allEmojis = useMemo(() => {
    return EMOJI_GROUPS.flatMap(g => g.emojis);
  }, []);

  const displayedEmojis = useMemo(() => {
    if (selectedGroup !== 'all') {
      const g = EMOJI_GROUPS.find(gr => gr.id === selectedGroup);
      return g ? g.emojis : allEmojis;
    }
    return allEmojis;
  }, [selectedGroup, allEmojis]);

  const handlePasteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPasteInput(raw);
    const extracted = extractFirstEmoji(raw, '');
    if (extracted) {
      onSelect(extracted);
      setPasteInput('');
      if (onClose) onClose();
    }
  };

  return (
    <div className={`rounded-2xl border shadow-2xl p-3 w-80 max-w-full flex flex-col space-y-2.5 select-none ${
      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
    }`}>
      {/* Cabecera con selector activo y botón cerrar */}
      <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{value || '🏷️'}</span>
          <div>
            <span className="text-xs font-black block leading-none">Selector de Emojis</span>
            <span className="text-[10px] text-slate-400">150+ emojis clasificados</span>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Input para pegar directamente cualquier emoji copiado de la web */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
        <Smile className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Pega aquí cualquier emoji copiado de la web..."
          value={pasteInput}
          onChange={handlePasteChange}
          className="bg-transparent text-xs w-full focus:outline-none placeholder-slate-400 font-semibold"
        />
      </div>

      {/* Filtro por grupo / categoría */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setSelectedGroup('all')}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors ${
            selectedGroup === 'all'
              ? 'bg-amber-500 text-slate-950'
              : isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
          }`}
        >
          Todos
        </button>
        {EMOJI_GROUPS.map(g => (
          <button
            key={g.id}
            type="button"
            title={g.name}
            onClick={() => setSelectedGroup(g.id)}
            className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center shrink-0 transition-colors ${
              selectedGroup === g.id
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                : isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            {g.icon}
          </button>
        ))}
      </div>

      {/* Cuadrícula de emojis con scrollbar visible */}
      <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto p-1 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
        {displayedEmojis.map((emoji, idx) => {
          const isSelected = value === emoji;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSelect(emoji);
                if (onClose) onClose();
              }}
              className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                isSelected
                  ? 'bg-amber-500/30 ring-2 ring-amber-400 scale-105'
                  : isLight ? 'hover:bg-slate-200' : 'hover:bg-slate-800'
              }`}
            >
              {emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
};
