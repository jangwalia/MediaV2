// S3FileManagerComponent.tsx

import { useEffect, useState, useCallback } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import FileCopyIcon from "@mui/icons-material/FileCopy";

import ZoomImage from "./components/ZoomImage";

import LoadingButton from "@mui/lab/LoadingButton";

import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseIcon from "@mui/icons-material/CancelOutlined";

import DeleteIcon from "@mui/icons-material/Delete";
import { useDropzone } from "react-dropzone";
import S3FileManager from "./S3FileManager"; // Path to your S3FileManager class

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UploadImage from "./components/FileManagerActions/UploadImage";

import SharedImagesButton from "./components/SharedImages";
import PrivateImagesButton from "./components/PrivateImages";
import NavigationSection from "./components/NavigationSection";
import SearchImageButton from "./components/SearchImage";
import AddImageButton from "./components/AddImage";
import AddImageOptions from "./components/AddImageOptions";

const MAX_FILES = 5;

const S3FileManagerComponent = (props: any) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [imageZoom, setImageZoom] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showCreateFolder, setShowCreateFolder] = useState<boolean>(false);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [creatingFolder, setCreatingFolder] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [files, setFiles] = useState<any>([]);
  const [uploadFiles, setUploadFiles] = useState<any>([]);
  const [continuationToken, setContinuationToken] = useState<any>(null);
  const [folders, setFolders] = useState<any>([]);
  const [prefix, setPrefix] = useState("");
  const [prevFolders, setPrevFolders] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [bucketConfig, setBucketConfig] = useState(props.buckets["Private"]);
  const [selectedButton, setSelectedButton] = useState("");

  const manager = new S3FileManager(bucketConfig.bucket, bucketConfig.region);
  const open = Boolean(anchorEl);
  const id = "simple-menu";

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleImageZoomClose = (event: object, reason: string) => {
    console.log("reason", reason);
    console.log("event", event);
    setImageZoom(false);
    setSelectedImage("");
  };

  const listFiles = useCallback(async () => {
    const result: any = await manager.listFiles(prefix, "/", continuationToken);
    console.log("result", result);
    // This block of code merges items together so that any refetches with the
    // same continuation token don't create duplicates
    setFiles((prevFiles: any) => {
      const merged = [...prevFiles, ...result.files];
      return merged.filter(
        (value, index, self) =>
          index === self.findIndex((v) => v.key === value.key)
      );
    });
    // Don't clear folders if there are some and it's just continuation token
    // fetching.  Folders always come at the start
    if (!continuationToken) {
      setFolders(result.folders);
    }
    setContinuationToken(result.continuationToken);
  }, [manager, prefix, continuationToken]);

  const loadMore = useCallback(() => {
    if (continuationToken) {
      listFiles();
    }
  }, [continuationToken]);

  useEffect(() => {
    listFiles();
  }, [prefix, bucketConfig]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/png": [".png"] },
    maxFiles: MAX_FILES,
    maxSize: 400000,
    onError: (error) => {
      console.log("error", error);
    },
    onDropRejected: (fileRections) => {
      const errors = fileRections.map((rejection) => ({
        name: rejection.file.name,
        errors: rejection.errors.map((error) => ({
          message: error.message,
        })),
      }));
      errors.map((error) => {
        toast.error(
          `${error.name}: ${error.errors.map((error) => error.message)}`
        );
      });
    },
    onDrop: async (acceptedFiles) => {
      console.log("files", acceptedFiles);
      setUploadFiles([
        ...acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        ),
      ]);
      if (bucketConfig.canUpdate) {
        try {
          for (let file of acceptedFiles) {
            const filePath = `${prefix}${file.name}`;
            await manager.putFile(filePath, file, "image/png");
          }
          if (acceptedFiles.length > 0) {
            toast.success("File(s) uploaded successfully");
          }
          setUploadFiles([]);
        } catch (error) {
          toast.error(error);
        }
        listFiles();
      }
    },
  });

  const deleteFile = async (key: string) => {
    if (!bucketConfig.canDelete) {
      toast.error("Delete not allowed in this bucket");
      return;
    }

    try {
      await manager.deleteFile(key);
      setFiles((prevFiles: any) =>
        prevFiles.filter((obj: any) => obj.key !== key)
      );
      setFolders((prevFolders: any) =>
        prevFolders.filter((obj: any) => obj.key !== key)
      );
      const type = key.endsWith("/") ? "Folder" : "File";
      toast.success(`${type} deleted successfully`);
    } catch (err: any) {
      toast.error(err.message);
    }
    listFiles();
  };

  const createFolder = async () => {
    setCreatingFolder(true);
    if (!bucketConfig.canCreateFolder) {
      toast.error("Folder creation not allowed in this bucket");
      return;
    }

    try {
      await manager.createFolder(`${prefix}${newFolderName}/`);
      setNewFolderName("");
      toast.success("Folder created successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
    listFiles();
    setCreatingFolder(false);
  };

  const search = async () => {
    setSearching(true);
    try {
      const files = await manager.searchFiles(searchTerm);
      setFiles(files.files);
      setFolders([]);
      setContinuationToken(null);
      setPrefix("");
    } catch (err: any) {
      toast.error(err.message);
    }
    listFiles();
    setSearching(false);
  };

  const navigateToFolder = (newPrefix: string) => {
    setPrevFolders((prevFolders) => [...prevFolders, prefix]);
    setFiles([]);
    setFolders([]);
    setContinuationToken(null);
    setPrefix(newPrefix);
  };

  const navigateBack = () => {
    if (prevFolders.length > 0) {
      const newPrevFolders = [...prevFolders];
      const lastFolder = newPrevFolders.pop();
      setPrevFolders(newPrevFolders);
      setFiles([]);
      setFolders([]);
      setContinuationToken(null);
      setPrefix(lastFolder || "");
    }
  };

  const switchBucket = (bucketName: string) => {
    console.log("bucket", bucketConfig.bucket, props.buckets);
    setBucketConfig(props.buckets[bucketName]);
    setSelectedButton(bucketName);
    setFiles([]);
    setFolders([]);
    setContinuationToken(null);
    setPrevFolders([]);
    setPrefix("");
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const goHome = () => {
    if (prefix) {
      setFiles("");
      setFolders("");
      setPrevFolders([]);
      setContinuationToken(null);
      setPrefix("");
    }
    listFiles();
  };

  const onSearch = () => {
    setShowUpload(false);
    setShowCreateFolder(false);
    setShowSearch(true);
  };
  return (
    <div className="tw-container tw-mx-auto">
      <div className="tw-my-6 tw-w-auto">
        <SharedImagesButton
          selected={selectedButton === "Public"}
          onClick={() => switchBucket("Public")}
        />
        <PrivateImagesButton
          selected={selectedButton === "Private"}
          onClick={() => switchBucket("Private")}
        />
      </div>

      <div className="tw-flex tw-my-6">
        <NavigationSection
          navigateBack={navigateBack}
          goHome={goHome}
          prevFolders={prevFolders}
        />
        <SearchImageButton onClick={onSearch} />

        {bucketConfig.canUpdate && (
          <>
            <AddImageButton onClick={handleOpenMenu} />
            <AddImageOptions
              onClickFolder={() => {
                setShowCreateFolder(true);

                handleCloseMenu();
              }}
              onClickImages={() => {
                setShowUpload(true);

                handleCloseMenu();
              }}
              handleCloseMenu={handleCloseMenu}
              id={id}
              anchorEl={anchorEl}
              open={open}
            />
          </>
        )}
      </div>
      {bucketConfig.canUpdate && showUpload && (
        // {bucketConfig.canCreateFolder && (

        <UploadImage uploadRootProps={getRootProps} uploadInputProps={getInputProps} onClick={() => {
          setShowUpload(false);
          setUploadFiles([]);
        }} MAX_FILES={MAX_FILES} uploadFiles={uploadFiles} />

      )}
      {bucketConfig.canUpdate && showCreateFolder && (
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
            <IconButton onClick={() => setShowCreateFolder(false)}>
              <CloseIcon fontSize="large" />
            </IconButton>
          </div>
        </div>
      )}
      {showSearch && (
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
            <IconButton onClick={() => setShowSearch(false)}>
              <CloseIcon fontSize="large" />
            </IconButton>
          </div>
        </div>
      )}
      {/* // TODO: create seperate compoenent for imageList and imageItems start */}
      <ImageList
        gap={12}
        sx={{
          gridTemplateColumns:
            "repeat(auto-fill, minmax(280px, 1fr))!important",
        }}
      >
        {[...folders, ...files].map((file: any, index: number) => (
          <ImageListItem
            key={index}
            sx={{
              border: props.image === file.key ? 4 : 0,
              borderColor: "blue",
            }}
            onClick={() => {
              if (file.key.endsWith("/")) {
                navigateToFolder(file.key);
              } else {
                props.selectImage(file.key);
              }
            }}
          >
            <img
              className="tw-aspect-square"
              src={file.url}
              alt={file.key}
              loading="lazy"
            />
            <ImageListItemBar
              title={file.key}
              subtitle={<span>size: {file.size / 1000} KB</span>}
              actionIcon={
                <div className="tw-flex">
                  {!file.key.endsWith("/") && (
                    <>
                      <IconButton
                        aria-label={`info about ${file.key}`}
                        onClick={() => copyUrl(file.url)}
                      >
                        <FileCopyIcon style={{ color: "#FFF" }} />
                      </IconButton>
                      <IconButton
                        aria-label={`zoom in ${file.key}`}
                        onClick={() => {
                          setSelectedImage(file.url);
                          setImageZoom(true);
                        }}
                      >
                        <ZoomInIcon style={{ color: "#FFF" }} />
                      </IconButton>
                    </>
                  )}
                  <IconButton
                    aria-label={`delete file ${file.key}`}
                    onClick={() => deleteFile(file.key)}
                  >
                    <DeleteIcon style={{ color: "#FFF" }} />
                  </IconButton>
                </div>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
      {/* // Todo: create seperate compoenent for imageList and imageItems end */}
      <ZoomImage
        open={imageZoom}
        handleClose={handleImageZoomClose}
        image={selectedImage}
      />
      {continuationToken ? (
        <div className="tw-w-full tw-flex tw-justify-center tw-items-center tw-py-6">
          <Button variant="contained" color="primary" onClick={loadMore}>
            Load More
          </Button>
        </div>
      ) : (
        <div className="tw-h-10" />
      )}
    </div>
  );
};

export default S3FileManagerComponent;
