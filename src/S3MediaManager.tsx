// S3FileManagerComponent.tsx

import { useEffect, useState, useCallback } from "react";
import Button from "@mui/material/Button";

import ZoomImage from "./components/ZoomImage";

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
import NewFolder from "./components/FileManagerActions/NewFolder";
import SearchImage from "./components/FileManagerActions/SearchImage";

import ImageListSection from "./components/ImagesSection/ImagesList";

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
          switchBucket={switchBucket}
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

        <UploadImage
          uploadRootProps={getRootProps}
          uploadInputProps={getInputProps}
          setShowUpload={setShowUpload}
          setUploadFiles={setUploadFiles}
          MAX_FILES={MAX_FILES}
          uploadFiles={uploadFiles}
        />
      )}
      {bucketConfig.canUpdate && showCreateFolder && (
        <NewFolder
          onClick={() => setShowCreateFolder(false)}
          newFolderName={newFolderName}
          setNewFolderName={setNewFolderName}
          creatingFolder={creatingFolder}
          createFolder={createFolder}
        />
      )}
      {showSearch && (
        <SearchImage
          onClick={() => setShowSearch(false)}
          searchTerm={searchTerm}
          searching={searching}
          search={search}
          setSearchTerm={setSearchTerm}
        />
      )}

      <ImageListSection
        items={[...folders, ...files]}
        selectImage={(key: string) => {
          if (key.endsWith("/")) {
            navigateToFolder(key);
          } else {
            props.selectImage(key);
          }
        }}
        deleteImage={(key: string) => deleteFile(key)}
        selectedImage={props.image}
        copyUrl={(url: string) => copyUrl(url)}
        setSelectedImage={(url: string) => setSelectedImage(url)}
        setImageZoom={(value: boolean) => setImageZoom(value)}
      />

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
