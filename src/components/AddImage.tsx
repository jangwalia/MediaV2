import React from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/AddCircle";


type AddImageButtonProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const AddImageButton = ({ onClick }: AddImageButtonProps) => {
  return (

     <Button
      startIcon={<AddIcon />}
      onClick={onClick}
    >
      Add
    </Button>



  )
}

export default AddImageButton;