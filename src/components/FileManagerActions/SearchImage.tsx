import React from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";


type SearchImageProps = {
  onClick: () => void;
  searchTerm: string;
  searching: boolean;
  search: () => void;
  setSearchTerm: (value: string) => void;
};

const SearchImage = ({onClick, searchTerm, searching,search, setSearchTerm}: SearchImageProps) => {
  return (
    <div className="tw-relative tw-w-full tw-h-40 tw-m-5 tw-flex tw-justify-center tw-border-dashed tw-border-2">
  <div className="tw-flex tw-justify-center tw-items-center tw-px-10 tw-space-x-5">
    <TextField
      label="Search Term"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <LoadingButton
      variant="contained"
      color="primary"
      disabled={searchTerm.length === 0}
      loading={searching}
      onClick={search}
    >
      Search
    </LoadingButton>
  </div>
  <div className="tw-absolute tw-right-0">
    <IconButton onClick={onClick}>
      <CloseIcon fontSize="large" />
    </IconButton>
  </div>
</div>
  )

};

export default SearchImage;