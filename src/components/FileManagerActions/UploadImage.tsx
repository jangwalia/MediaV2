import React from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

type UploadImageProps = {
  uploadRootProps: any;
  uploadInputProps: any;
  setShowUpload: (value: boolean) => void;
  setUploadFiles: (value: any) => void;
  MAX_FILES: number;
  uploadFiles: string[];
};

const UploadImage = ({
  uploadInputProps,
  uploadRootProps,
  setShowUpload,
  setUploadFiles,
  MAX_FILES,
  uploadFiles,
}: UploadImageProps) => {
  return (
    <div className="tw-relative tw-mb-8 tw-flex tw-w-full tw-justify-center tw-border-dashed tw-border-2">
      <div>
        <div
          {...uploadRootProps()}
          className="tw-w-full tw-p-10 tw-m-5 tw-flex tw-text-slate-400"
        >
          <input {...uploadInputProps()} className="" />
          <p className="tw-w-full tw-text-center tw-font-bold tw-text-lg">
            Drag 'n' drop some files here, or click to select files <br />
            <em>
              ({MAX_FILES} files are the maximum number of files you can drop
              here)
            </em>
          </p>
        </div>
        <div className="tw-flex tw-w-full tw-border-t-2 tw-p-2">
          {uploadFiles.map((file: any) => (
            <img
              key={file.preview}
              className="tw-w-[100px] tw-object-contain tw-p-4"
              src={file.preview}
              onLoad={() => URL.revokeObjectURL(file.preview)}
            />
          ))}
        </div>
      </div>
      <div className="tw-absolute tw-right-0">
        <IconButton
          onClick={() => {
            setUploadFiles([]);
            setShowUpload(false);
          }}
        >
          <CloseIcon fontSize="large" />
        </IconButton>
      </div>
    </div>
  );
};

export default UploadImage;
