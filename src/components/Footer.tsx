import React from 'react';

interface FooterProps {
  onOpenPreview: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPreview }) => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-xs py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenPreview}
            className="hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Vista previa completa
          </button>
        </div>
      </div>
    </footer>
  );
};
