import React from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
} from "reactstrap";

const CategoryFormModal = ({
  isOpen,
  toggle,
  isEditMode,
  formState,
  handleInputChange,
  handleSubmit,
  saving,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {isEditMode ? "Edit Category" : "Add New Category"}
      </ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for="name">Category Name *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formState.name || ""}
              onChange={handleInputChange}
              placeholder="Enter category name"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="des">Description</Label>
            <Input
              type="textarea"
              id="des"
              name="des"
              value={formState.des || ""}
              onChange={handleInputChange}
              placeholder="Enter category description"
              rows={3}
            />
          </FormGroup>
          <FormGroup>
            <Label for="icon">Icon URL</Label>
            <Input
              type="url"
              id="icon"
              name="icon"
              value={formState.icon || ""}
              onChange={handleInputChange}
              placeholder="https://example.com/icon.png"
            />
          </FormGroup>
          <FormGroup>
            <Label for="sellerEmail">Seller Email</Label>
            <Input
              type="text"
              id="sellerEmail"
              name="sellerEmail"
              value={formState.sellerEmail || ""}
              onChange={handleInputChange}
              placeholder="seller@example.com, seller2@example.com"
            />
            <small className="text-muted">
              Enter one or more email addresses separated by commas
            </small>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" color="primary" disabled={saving}>
            {saving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : isEditMode ? (
              "Update Category"
            ) : (
              "Create Category"
            )}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default CategoryFormModal;

