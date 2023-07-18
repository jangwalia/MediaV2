// App.tsx

import React, { useState } from "react";
import S3FileManagerComponent from "./S3MediaManager";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const bucketConfigurations: any = {
  // Private has nothing default
  Private: {
    bucket: "tonyimagesprivate",
    region: "us-west-2",
    canUpdate: true,
    canUpload: true,
    canDelete: true,
    canCreateFolder: true,
  },
  // Public has the ST imates
  Public: {
    bucket: "tonyimagespublic",
    region: "us-west-2",
    canUpdate: false,
    canUpload: false,
    canDelete: false,
    canCreateFolder: false,
  },
};

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string>("");
  console.log("selected image", selectedImage);
  return (
    <div className="App">
      <S3FileManagerComponent
        image={selectedImage}
        selectImage={setSelectedImage}
        buckets={bucketConfigurations}
      />
      {/* @ts-expect-error */}
      <ToastContainer />
    </div>
  );
};

export default App;
