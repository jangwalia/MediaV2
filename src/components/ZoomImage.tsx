import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

type ZoomImageProps = {
  open: boolean;
  handleClose: (event: object, reason: string) => void;
  image: string;
};

const ZoomImage = (props: ZoomImageProps) => {
  return (
    <Modal
      open={props.open}
      onClose={props.handleClose}
      aria-labelledby="image zoonm"
      aria-describedby="full view of the image"
    >
      <div className="tw-flex tw-h-screen tw-justify-center tw-items-center">
        <div className="tw-relative tw-flex tw-w-[60%] tw-justify-center tw-items-center tw-bg-white tw-p-10 tw-m-5">
          <img className="tw-w-[70%]" src={props.image} />
          <div className="tw-absolute tw-right-0 tw-top-0">
            <IconButton
              onClick={(event) => {
                props.handleClose(event, "reason");
              }}
            >
              <CloseIcon fontSize="large" />
            </IconButton>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ZoomImage;
