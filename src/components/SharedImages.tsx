import React from 'react';
import Button from '@mui/material/Button';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

type SharedImagesButtonProps = {
  switchBucket: (type: string) => void;
  selected: boolean;
};

const SharedImagesButton = ({ switchBucket,selected }: SharedImagesButtonProps) => {
  return (
    <Button
      startIcon={<FolderOpenIcon />}
      color="primary"
      onClick={() => switchBucket("Public")}
      disabled={selected}
    >
      Shared Images
    </Button>
  );
};

export default SharedImagesButton;
