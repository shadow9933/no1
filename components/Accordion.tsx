
import React, { useState, ReactNode } from 'react';
import { ChevronDownIcon } from './icons';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <button
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-slate-700 hover:bg-slate-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-slate-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
