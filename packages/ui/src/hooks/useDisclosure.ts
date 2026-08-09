import { useState, useCallback } from "react";

export interface UseDisclosureProps {
  defaultIsOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  id?: string;
}

export function useDisclosure(props: UseDisclosureProps = {}) {
  const { defaultIsOpen = false, onOpen, onClose, id } = props;
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    isOpen ? close() : open();
  }, [isOpen, open, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    id,
  };
}
