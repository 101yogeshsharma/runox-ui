import React from "react";
import { ModalHeader, ModalFooter, Modal, Button } from "@runox/ui";

export function Example() {
  const _Header = ModalHeader;
  return (
    <Modal open>
      <ModalHeader>Title</ModalHeader>
      <ModalFooter>
        <Button>OK</Button>
      </ModalFooter>
    </Modal>
  );
}
