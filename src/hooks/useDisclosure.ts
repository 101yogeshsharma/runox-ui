import { useState, useCallback } from "react";

/**
 * Props for the useDisclosure hook.
 *
 * @property defaultIsOpen - The initial open state of the disclosure.
 * @property onOpen - Callback invoked when the disclosure opens.
 * @property onClose - Callback invoked when the disclosure closes.
 * @property id - Optional string ID to associate with the disclosure.
 */
export interface UseDisclosureProps {
  defaultIsOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  id?: string;
}

/**
 * Manages open/close state for modals, drawers, dropdowns, and other overlay components.
 *
 * @param props - Configuration properties for the disclosure.
 * @returns An object containing the open state, toggle functions, and an optional ID.
 *
 * @example
 * const { isOpen, open, close, toggle } = useDisclosure({ defaultIsOpen: false });
 * return <Modal isOpen={isOpen} onClose={close} />;
 */
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
