import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

export interface SearchableOption {
  id: string;
  label: string;
  code?: string;
  subtitle?: string;
  category?: string;
  badge?: string;
  unit?: string;
  price?: number;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  isLight?: boolean;
  emptyMessage?: string;
}

// Normalizador para ignorar tildes, mayúsculas y espacios
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Escribe para buscar...',
  disabled = false,
  className = '',
  isLight = false,
  emptyMessage = 'No se encontraron coincidencias'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Opción actualmente seleccionada
  const selectedOption = useMemo(() => {
    return options.find(o => o.id === value);
  }, [options, value]);

  // Filtrado por similitud de palabras (coincidencia de cada término ingresado)
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;

    const queryWords = normalizeText(searchTerm).split(/\s+/).filter(Boolean);

    return options.filter(opt => {
      const target = normalizeText(
        `${opt.code || ''} ${opt.label} ${opt.subtitle || ''} ${opt.category || ''} ${opt.badge || ''}`
      );
      // Cada palabra del término de búsqueda debe estar presente en el objetivo
      return queryWords.every(word => target.includes(word));
    });
  }, [options, searchTerm]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Enfocar el input de búsqueda cuando se abre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      {/* Botón Disparador / Vista Actual */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full min-w-0 flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
          isLight
            ? 'bg-white border-slate-300 text-slate-800 hover:border-amber-400 focus:ring-2 focus:ring-amber-400/20'
            : 'bg-slate-900 border-slate-700 text-white hover:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
          isOpen ? (isLight ? 'border-amber-500 ring-2 ring-amber-400/20' : 'border-amber-500 ring-2 ring-amber-500/20') : ''
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          {selectedOption ? (
            <>
              {selectedOption.code && (
                <span className="shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {selectedOption.code}
                </span>
              )}
              <span className="truncate text-xs font-bold">
                {selectedOption.label}
              </span>
              {selectedOption.subtitle && (
                <span className="shrink-0 text-[10px] text-slate-400 font-normal hidden sm:inline truncate">
                  ({selectedOption.subtitle})
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400 italic truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </button>

      {/* Menú Desplegable con Autocompletado */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl shadow-2xl border overflow-hidden flex flex-col ${
            isLight
              ? 'bg-white border-slate-200 divide-y divide-slate-100 shadow-slate-400/20'
              : 'bg-slate-900 border-slate-700 divide-y divide-slate-800 shadow-black/60'
          }`}
          style={{ maxHeight: '280px' }}
        >
          {/* Barra de Búsqueda con Autocompletado */}
          <div className="p-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border font-medium focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-500'
                    : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                }`}
                onKeyDown={e => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                  } else if (e.key === 'Enter' && filteredOptions.length > 0) {
                    e.preventDefault();
                    handleSelect(filteredOptions[0].id);
                  }
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Resultados */}
          <div className="overflow-y-auto flex-1 max-h-52 divide-y divide-slate-800/40">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 italic">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = opt.id === value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 text-xs transition-colors ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-50 text-amber-900 font-bold'
                          : 'bg-amber-500/15 text-amber-300 font-bold'
                        : isLight
                        ? 'hover:bg-slate-100 text-slate-700'
                        : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {opt.code && (
                        <span
                          className={`shrink-0 text-[10px] font-mono font-bold px-1 rounded ${
                            isSelected
                              ? 'bg-amber-500/30 text-amber-400'
                              : isLight
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {opt.code}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">{opt.label}</div>
                        {opt.subtitle && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {opt.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold border border-emerald-500/20">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
