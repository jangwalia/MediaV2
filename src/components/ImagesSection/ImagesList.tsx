import React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import IconButton from '@mui/material/IconButton';
import DeleteImage from '../FileManagerActions/DeleteImage';

type ImageListSectionProps = {
  items: any[]; // Array of image items
  selectImage: (key: string) => void; // Function to handle image selection
  deleteImage: (key: string) => void; // Function to handle image deletion
  selectedImage: string; // Key of the currently selected image (optional)
  copyUrl: (url: string) => void; // Function to handle URL copy
  setSelectedImage: (url: string) => void; // Function to handle setting selected image
  setImageZoom: (value: boolean) => void; // Function to handle toggling image zoom
};


const ImageListSection = ({
  items,
  selectImage,
  deleteImage,
  selectedImage,
  copyUrl,
  setSelectedImage,
  setImageZoom,
}: ImageListSectionProps) => {
  return (
    <ImageList gap={12} sx={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))!important' }}>
      {items.map((item: any, index: number) => (
        <ImageListItem
          key={index}
          sx={{
            border: selectedImage === item.key ? 4 : 0,
            borderColor: 'blue',
          }}
          onClick={() => selectImage(item.key)}
        >
          <img className="tw-aspect-square" src={item.url} alt={item.key} loading="lazy" />
          <ImageListItemBar
            title={item.key}
            subtitle={<span>size: {item.size / 1000} KB</span>}
            actionIcon={
              <div className="tw-flex">
                {!item.key.endsWith('/') && (
                  <>
                    <IconButton aria-label={`info about ${item.key}`} onClick={() => copyUrl(item.url)}>
                      <FileCopyIcon style={{ color: '#FFF' }} />
                    </IconButton>
                    <IconButton
                      aria-label={`zoom in ${item.key}`}
                      onClick={() => {
                        setSelectedImage(item.url);
                        setImageZoom(true);
                      }}
                    >
                      <ZoomInIcon style={{ color: '#FFF' }} />
                    </IconButton>
                  </>
                )}
                <DeleteImage onClick={() => deleteImage(item.key)} file={item} />
              </div>
            }
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export default ImageListSection;
