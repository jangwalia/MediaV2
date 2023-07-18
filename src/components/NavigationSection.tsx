import React from 'react';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

type NavigationSectionProps = {
  navigateBack: () => void;
  goHome: () => void;
  prevFolders: string [];
};

const NavigationSection = ({ navigateBack, goHome,prevFolders }: NavigationSectionProps) => {
  return (
    <>
      {prevFolders.length > 0 ? (
        <Button onClick={navigateBack} startIcon={<ArrowBackIcon />}>
          Back
        </Button>
      ): null}
      <Button startIcon={<HomeIcon />} onClick={goHome}>
        Home
      </Button>
    </>
  );
};

export default NavigationSection;
