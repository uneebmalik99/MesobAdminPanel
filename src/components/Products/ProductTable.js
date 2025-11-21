import React from "react";
import { Badge, Button, UncontrolledTooltip } from "reactstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { formatCurrency, sanitizeIdForSelector } from "./utils";

const thumbnailWrapperStyle = {
  width: 60,
  height: 60,
  borderRadius: 8,
  overflow: "hidden",
  background: "#f4f5f7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(0,0,0,0.05)",
};

const thumbnailImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const placeholderThumbStyle = {
  fontSize: 11,
  color: "#8898aa",
  textAlign: "center",
  padding: "0 4px",
};

export const buildColumns = (onEdit, onDelete) => [
  {
    name: "Image",
    width: "120px",
    cell: (row) => (
      <div style={thumbnailWrapperStyle}>
        {row.content?.image ? (
          <img
            src={row.content.image}
            alt={row.title}
            style={thumbnailImageStyle}
          />
        ) : (
          <div style={placeholderThumbStyle}>N/A</div>
        )}
      </div>
    ),
    ignoreRowClick: true,
  },
  {
    name: "Title",
    selector: (row) => row.title,
    sortable: true,
    wrap: true,
    width: "200px",
  },
  {
    name: "Category",
    selector: (row) => row.category || "-",
    sortable: true,
    width: "160px",
  },
  {
    name: "Description",
    selector: (row) => row.content?.description || "-",
    cell: (row) => {
      const desc = row.content?.description || "-";
      return (
        <div style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={desc}>
          {desc}
        </div>
      );
    },
    sortable: false,
    wrap: false,
    width: "300px",
  },
  {
    name: "Country",
    selector: (row) => row.country || "-",
    sortable: true,
    width: "140px",
  },
  {
    name: "Price",
    selector: (row) => row.content?.price || "-",
    cell: (row) => formatCurrency(row.content?.price),
    sortable: true,
    width: "130px",
  },
  {
    name: "Cost",
    selector: (row) => row.content?.cost || "-",
    cell: (row) => formatCurrency(row.content?.cost),
    sortable: true,
    width: "130px",
  },
  {
    name: "Off %",
    selector: (row) => row.off_percentage || "-",
    width: "100px",
  },
  {
    name: "Recommended",
    selector: (row) => row.isRecommended,
    cell: (row) =>
      row.isRecommended ? (
        <Badge color="success">Yes</Badge>
      ) : (
        <Badge color="secondary">No</Badge>
      ),
    width: "140px",
  },
  {
    name: "Updated",
    selector: (row) => row.updatedAt,
    cell: (row) =>
      row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "-",
    width: "210px",
    sortable: true,
  },
  {
    name: "Actions",
    cell: (row) => {
      const editId = `edit-${sanitizeIdForSelector(row.id)}`;
      const deleteId = `delete-${sanitizeIdForSelector(row.id)}`;
      return (
        <div className="d-flex align-items-center" style={{ gap: "0.4rem" }}>
          <Button
            id={editId}
            color="info"
            size="sm"
            className="btn-round btn-icon"
            onClick={() => onEdit(row)}
            aria-label="Edit product"
          >
            <FaEdit size={14} />
          </Button>
          <UncontrolledTooltip target={editId}>
            Edit or duplicate product
          </UncontrolledTooltip>
          <Button
            id={deleteId}
            color="danger"
            size="sm"
            className="btn-round btn-icon"
            onClick={() => onDelete(row)}
            aria-label="Delete product"
          >
            <FaTrash size={13} />
          </Button>
          <UncontrolledTooltip target={deleteId}>
            Remove product from catalog
          </UncontrolledTooltip>
        </div>
      );
    },
    ignoreRowClick: true,
    allowOverflow: true,
    width: "200px",
  },
];

