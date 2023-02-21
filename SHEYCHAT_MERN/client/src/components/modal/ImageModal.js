import React, { useEffect, useRef, useState } from "react";

function ImageModal({ showImage }) {
  const deltaImage = useRef(null);
  // const [zoomImage, setZoomImage] = useState({ width: "100", height: "100" });

  // const onScroll = (e) => {
  //   const imgSize = e.deltaY * 1;
  //   const newWidth = parseInt(zoomImage.width) + imgSize;
  //   const newHeight = parseInt(zoomImage.height) + imgSize;
  //   // console.log("scroll", onScroll);
  //   setZoomImage({
  //     height: newHeight,
  //     width: newWidth,
  //   });
  //   deltaImage.current.setAttribute(
  //     "style",
  //     `width: "${zoomImage.width}% !important"; height: "${zoomImage.height}% !important"`
  //   );
  //   // deltaImage.current.clientHeight = newHeight;
  // };

  useEffect(() => {
    const handleScroll = (e) => {
      if (deltaImage !== null && deltaImage.current !== null) {
        const imageHeight = deltaImage.current.clientHeight + e.deltaY * 0.5;
        deltaImage.current.setAttribute(
          "style",
          `height: ${imageHeight}px !important;`
        );
      }
    };
    window.addEventListener("wheel", handleScroll);
    return () => {
      window.removeEventListener("wheel", handleScroll);
    };
  }, []);

  return (
    <div className="pt-3 shadow-none overflow-hidden">
      <div
        // onWheelCapture={onScroll}
        className="overflow-hidden relative"
        style={{ width: "460px", height: "350px", overflow: "hidden" }}
      >
        {/* {JSON.stringify({
          height: `${zoomImage.height}% !important`,
        })} */}
        <img
          className="h-full w-auto fixed"
          ref={deltaImage}
          src={showImage}
        />
      </div>
    </div>
  );
}

export default ImageModal;
