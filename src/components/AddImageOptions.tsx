import React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuList from '@mui/material/MenuList';
import FolderIcon from '@mui/icons-material/Folder';
import ImageIcon from '@mui/icons-material/Image';

type AddImageButtonProps = {

  onClickFolder?: () => void;
  onClickImages?: () => void;
  handleCloseMenu: () => void;
  id: string;
  anchorEl: HTMLElement | null;
  open: boolean;
};

const AddImageOptions = ({

  onClickFolder,
  onClickImages,
  handleCloseMenu,
  id,
  anchorEl,
  open,
}: AddImageButtonProps) => {
  return (
    <>

      <Menu id={id} anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        <div className="tw-p-4 tw-flex tw-flex-col">
          <MenuList onClick={onClickFolder}>
            <Button startIcon={<FolderIcon />}>New Folder</Button>
          </MenuList>
          <MenuList onClick={onClickImages}>
            <Button startIcon={<ImageIcon />}>New Images</Button>
          </MenuList>
        </div>
      </Menu>
    </>
  );
};

export default AddImageOptions;
