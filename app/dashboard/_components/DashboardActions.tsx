"use client";

import { PlusIcon } from "lucide-react";
import TooltipIcon from "@/components/tooltip-icon";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";

export default function DashboardActions() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <TooltipIcon tooltip={false} content="Create Project" isIconOnly={false} icon={<PlusIcon className="w-4 h-4" />} onPress={onOpen} title="Create Project" />
      <CreateProjectModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}

const CreateProjectModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <h1>Create Project</h1>
        </ModalHeader>
        <ModalBody>
          <Input label="Project Name" />
          <Input label="Project Description" />
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose}>Cancel</Button>
          <Button onPress={onClose}>Create</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
