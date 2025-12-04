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

const SubCategoryFormModal = ({
  isOpen,
  toggle,
  isEditMode,
  formState,
  handleInputChange,
  handleSubmit,
  saving,
  categories,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {isEditMode ? "Edit Subcategory" : "Add New Subcategory"}
      </ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for="categoryId">Category *</Label>
            <Input
              type="select"
              id="categoryId"
              name="categoryId"
              value={formState.categoryId || ""}
              onChange={handleInputChange}
              required
              disabled={isEditMode}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name || `Category ${category.id}`}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="name">Subcategory Name *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formState.name || ""}
              onChange={handleInputChange}
              placeholder="Enter subcategory name"
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
              placeholder="Enter subcategory description"
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
              "Update Subcategory"
            ) : (
              "Create Subcategory"
            )}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default SubCategoryFormModal;

