import React from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

type DeleteImageProps = {
  onClick: () => void;
  file: any;
};

const DeleteImage = ({ onClick, file }: DeleteImageProps) => {
  return (
    <IconButton
    aria-label={`delete file ${file.key}`}
    onClick={onClick}
  >
    <DeleteIcon style={{ color: "#FFF" }} />
  </IconButton>
  )
}

export default DeleteImage;