export type AccordionContextType = {
  value: string | string[];
  onValueChange: (value: string) => void;
  accordionId: string;
};

export type AccordionContextItemType = {
  value: string;
};