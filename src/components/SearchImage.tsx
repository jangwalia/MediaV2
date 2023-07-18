import React from "react";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";

type SearchImageButtonProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const SearchImageButton = ({ onClick }: SearchImageButtonProps) => {
  return (
    <Button
    startIcon={<SearchIcon />}
    onClick={onClick}
  >
    Search
  </Button>
  )
}

export default SearchImageButton;