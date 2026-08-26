import React from "react";
import { Modal, Button } from "@runox/ui";

export function Example() {
  const _Header = ModalHeader;
  return (
    <Modal open>
      <Modal.Header>Title</Modal.Header>
      <Modal.Footer>
        <Button>OK</Button>
      </Modal.Footer>
    </Modal>
  );
}
