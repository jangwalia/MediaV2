import React from 'react';
import Button from '@mui/material/Button';
import FolderSharedIcon from '@mui/icons-material/FolderShared';

type PrivateImagesButtonProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  selected: boolean;
};

const PrivateImagesButton = ({ onClick,selected }: PrivateImagesButtonProps) => {
  return (
    <Button
      startIcon={<FolderSharedIcon />}
      color="primary"
      onClick={onClick}
      disabled={selected}
    >
      Private Images
    </Button>
  );
};

export default PrivateImagesButton;
