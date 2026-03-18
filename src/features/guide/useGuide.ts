import { useState, useCallback, useMemo } from 'react';

export type AccordionId = 'proposal' | 'discussion' | 'ai-chat' | null;

const ACCORDION_IDS: AccordionId[] = ['proposal', 'discussion', 'ai-chat'];

export function useGuide() {
  const [expandedId, setExpandedId] = useState<AccordionId>(null);

  const handleAccordionClick = useCallback((id: AccordionId) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const containerClass = useMemo(
    () =>
      expandedId === null
        ? 'guide-accordion-container'
        : `guide-accordion-container guide-accordion-container--expanded-${ACCORDION_IDS.indexOf(expandedId)}`,
    [expandedId]
  );

  return { expandedId, handleAccordionClick, containerClass };
}
