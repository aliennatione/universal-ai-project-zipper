import React, { useState } from 'react';
import { ChevronDownIcon } from '../icons';

/**
 * @file Definisce un componente UI riutilizzabile per una sezione espandibile/collassabile.
 * @module CollapsibleSection
 */

/**
 * @interface CollapsibleSectionProps
 * Props per il componente CollapsibleSection.
 * @property {React.ReactNode} title - Il contenuto da visualizzare nell'intestazione della sezione.
 * @property {React.ReactNode} children - Il contenuto da visualizzare all'interno della sezione quando è espansa.
 * @property {boolean} [startOpen=false] - Se `true`, la sezione sarà inizialmente aperta.
 */
interface CollapsibleSectionProps {
    title: React.ReactNode;
    children: React.ReactNode;
    startOpen?: boolean;
}

/**
 * Un componente UI che mostra un'intestazione cliccabile per mostrare o nascondere il suo contenuto.
 *
 * @param {CollapsibleSectionProps} props - Le props per il componente.
 * @returns {JSX.Element}
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, startOpen = false }) => {
    const [isOpen, setIsOpen] = useState(startOpen);
    const id = React.useId();

    return (
        <div className="w-full bg-secondary dark:bg-dark-secondary border border-border-color dark:border-dark-border-color rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
                aria-expanded={isOpen}
                aria-controls={`collapsible-content-${id}`}
            >
                <div className="flex-grow">{title}</div>
                <div className={`transition-transform duration-200 flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon />
                </div>
            </button>
            <div
                id={`collapsible-content-${id}`}
                className={`transition-all duration-300 ease-in-out grid ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="p-4 pt-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};