import React from 'react';
import Button from '@mui/material/Button';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

type SharedImagesButtonProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  selected: boolean;
};

const SharedImagesButton = ({ onClick,selected }: SharedImagesButtonProps) => {
  return (
    <Button
      startIcon={<FolderOpenIcon />}
      color="primary"
      onClick={onClick}
      disabled={selected}
    >
      Shared Images
    </Button>
  );
};

export default SharedImagesButton;
