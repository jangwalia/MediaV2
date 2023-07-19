import React from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";

type NewFolderProps = {
  onClick: () => void;
  newFolderName: string;
  setNewFolderName: (value: string) => void;

  creatingFolder: boolean;
  createFolder: () => void;
};

const NewFolder = ({
  onClick,
  newFolderName,
  setNewFolderName,
  creatingFolder,
  createFolder,
}: NewFolderProps) => {
  return (
    <div className="tw-relative tw-w-full tw-h-40 tw-m-5 tw-flex tw-justify-center tw-border-dashed tw-border-2">
      <div className="tw-flex tw-justify-center tw-items-center tw-px-10 tw-space-x-5">
        <TextField
          label="New folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
        <LoadingButton
          variant="contained"
          color="primary"
          disabled={newFolderName.length === 0}
          loading={creatingFolder}
          onClick={createFolder}
        >
          Create
        </LoadingButton>
      </div>
      <div className="tw-absolute tw-right-0">
        <IconButton onClick={onClick}>
          <CloseIcon fontSize="large" />
        </IconButton>
      </div>
    </div>
  );
};

export default NewFolder;
