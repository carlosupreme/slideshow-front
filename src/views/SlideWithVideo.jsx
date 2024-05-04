import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const STORAGE_URL = import.meta.env.VITE_APP_STORAGE_URL;

function isVideo(file){
  return file.type?.includes("video");
}

export default function SlideWithVideo() {
  const id = useParams().id;
  const [slide, setSlide] = useState({});
  const [currentFile, setCurrentFile] = useState({});
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
 // const hasFiles = slide?.files && slide.files.length > 0;

  const toggleVideo = useCallback(() => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleFullscreen = useCallback(() => {

    !isFullscreen && document.documentElement.requestFullscreen();

    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        toggleVideo();
      }

      if (event.key === "f") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keyup", handleKeyDown);

    return () => {
      window.removeEventListener("keyup", handleKeyDown);
    };
  }, [toggleVideo, toggleFullscreen]);

  useEffect(() => {
    const getSlide = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/slide/${id}`
        );

        if (!res.ok) throw {};

        const json = await res.json();

        setSlide(json);
        console.log(json);
        setCurrentFile(json.files[0]);
      } catch (e) {
        console.log(e);
      }
    };

    getSlide();
  }, [id]);

  return (
    <>
      <div
        className="h-screen w-full "
        style={{ height: isFullscreen ? "100vh" : "calc(100vh - 6rem)" }}
      >
        {isVideo(currentFile) ? (
          <video
            onEnded={() => setIsPlaying(false)}
            ref={videoRef}
            className="object-cover w-full h-full"
          >
            <source
              type="video/mp4"
              src={`${STORAGE_URL}${currentFile.path ?? ""}`}
            />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={`${STORAGE_URL}${currentFile.path ?? ""}`}
            alt=""
            className="object-cover h-full w-full"
          />
        )}
      </div>

      {!isFullscreen && (
        <div className="fixed bottom-0 left-0 z-50 grid w-full h-24 grid-cols-1 px-8 bg-white border-t border-gray-200 md:grid-cols-3 dark:bg-gray-700 dark:border-gray-600">
          <div className="items-center justify-center hidden me-auto md:flex">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {slide.title}
            </span>
          </div>
          <div className="flex items-center w-full">
            <div className="w-full">
              <div className="flex items-center justify-center mx-auto mb-1">
                {/* shuffle */}
                <button
                  data-tooltip-target="tooltip-shuffle"
                  type="button"
                  className="p-2.5 group rounded-full hover:bg-gray-100 me-1 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-gray-600"
                >
                  <svg
                    className=" w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 18"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.484 6.166 13 4h6m0 0-3-3m3 3-3 3M1 14h5l1.577-2.253M1 4h5l7 10h6m0 0-3 3m3-3-3-3"
                    />
                  </svg>
                  <span className="sr-only">Shuffle video</span>
                </button>

                {/* previous */}
                <button
                  data-tooltip-target="tooltip-previous"
                  type="button"
                  className="p-2.5 group rounded-full hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-gray-600"
                >
                  <svg
                    className="rtl:rotate-180 w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 12 16"
                  >
                    <path d="M10.819.4a1.974 1.974 0 0 0-2.147.33l-6.5 5.773A2.014 2.014 0 0 0 2 6.7V1a1 1 0 0 0-2 0v14a1 1 0 1 0 2 0V9.3c.055.068.114.133.177.194l6.5 5.773a1.982 1.982 0 0 0 2.147.33A1.977 1.977 0 0 0 12 13.773V2.227A1.977 1.977 0 0 0 10.819.4Z" />
                  </svg>
                  <span className="sr-only">Previous video</span>
                </button>

                {/* Play pause button */}
                <button
                  onClick={(e) => {
                    toggleVideo();
                    e.currentTarget.blur();
                  }}
                  type="button"
                  className="inline-flex items-center justify-center p-2.5 mx-2 font-medium bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
                >
                  {isPlaying ? (
                    <i className="fa-solid fa-pause w-3 h-3 text-white flex justify-center items-center"></i>
                  ) : (
                    <i className="fa-solid fa-play w-3 h-3 text-white flex justify-center items-center"></i>
                  )}
                </button>

                {/* next */}
                <button
                  data-tooltip-target="tooltip-next"
                  type="button"
                  className="p-2.5 group rounded-full hover:bg-gray-100 me-1 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-gray-600"
                >
                  <svg
                    className="rtl:rotate-180 w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 12 16"
                  >
                    <path d="M11 0a1 1 0 0 0-1 1v5.7a2.028 2.028 0 0 0-.177-.194L3.33.732A2 2 0 0 0 0 2.227v11.546A1.977 1.977 0 0 0 1.181 15.6a1.982 1.982 0 0 0 2.147-.33l6.5-5.773A1.88 1.88 0 0 0 10 9.3V15a1 1 0 1 0 2 0V1a1 1 0 0 0-1-1Z" />
                  </svg>
                  <span className="sr-only">Next video</span>
                </button>

                {/* loop */}
                <button
                  type="button"
                  className="p-2.5 group rounded-full hover:bg-gray-100 me-1 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-gray-600"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97"
                    />
                  </svg>
                  <span className="sr-only">Restart video</span>
                </button>
              </div>
            </div>
          </div>
          <div className="items-center justify-center hidden ms-auto md:flex">
            {/* playlist */}
            <button
              type="button"
              className="p-2.5 group rounded-full hover:bg-gray-100 me-1 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-gray-600"
            >
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 16"
              >
                <path d="M14.316.051A1 1 0 0 0 13 1v8.473A4.49 4.49 0 0 0 11 9c-2.206 0-4 1.525-4 3.4s1.794 3.4 4 3.4 4-1.526 4-3.4a2.945 2.945 0 0 0-.067-.566c.041-.107.064-.22.067-.334V2.763A2.974 2.974 0 0 1 16 5a1 1 0 0 0 2 0C18 1.322 14.467.1 14.316.051ZM10 3H1a1 1 0 0 1 0-2h9a1 1 0 1 1 0 2Z" />
                <path d="M10 7H1a1 1 0 0 1 0-2h9a1 1 0 1 1 0 2Zm-5 4H1a1 1 0 0 1 0-2h4a1 1 0 1 1 0 2Z" />
              </svg>
              <span className="sr-only">View playlist</span>
            </button>
            {/* fullscreen */}
            <button
              onClick={toggleFullscreen}
              type="button"
              className="p-2.5 group rounded-full hover:bg-gray-100 me-1 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-gray-600"
            >
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 18"
              >
                <path d="M18 .989a1.016 1.016 0 0 0-.056-.277c-.011-.034-.009-.073-.023-.1a.786.786 0 0 0-.066-.1.979.979 0 0 0-.156-.224l-.007-.01a.873.873 0 0 0-.116-.073.985.985 0 0 0-.2-.128.959.959 0 0 0-.231-.047A.925.925 0 0 0 17 0h-4a1 1 0 1 0 0 2h1.664l-3.388 3.552a1 1 0 0 0 1.448 1.381L16 3.5V5a1 1 0 0 0 2 0V.989ZM17 12a1 1 0 0 0-1 1v1.586l-3.293-3.293a1 1 0 0 0-1.414 1.414L14.586 16H13a1 1 0 0 0 0 2h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1ZM3.414 2H5a1 1 0 0 0 0-2H1a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V3.414l3.536 3.535A1 1 0 0 0 6.95 5.535L3.414 2Zm2.139 9.276L2 14.665V13a1 1 0 1 0-2 0v4c.006.046.015.09.027.135.006.08.022.16.048.235a.954.954 0 0 0 .128.2.95.95 0 0 0 .073.117l.01.007A.983.983 0 0 0 1 18h4a1 1 0 0 0 0-2H3.5l3.436-3.276a1 1 0 0 0-1.38-1.448h-.003Z" />
              </svg>
              <span className="sr-only">Expand</span>
            </button>
            {/* mute */}
            <button
              onClick={(e) => {
                toggleMute();
                e.currentTarget.blur();
              }}
              type="button"
              className="p-2.5 group rounded-full hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-gray-600"
            >
              {isMuted ? (
                <i className="fa-solid fa-volume-xmark w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"></i>
              ) : (
                <i className="fa-solid fa-volume-high w-4 h-4 text-gray-500 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"></i>
              )}
              <span className="sr-only">Adjust volume</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
