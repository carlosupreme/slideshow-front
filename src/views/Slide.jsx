import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const STORAGE_URL = import.meta.env.VITE_APP_STORAGE_URL;

function getAvgRGB(imgEl) {
  const blockSize = 5;
  const defaultRGB = {
    r: 127,
    g: 156,
    b: 245,
  };
  const rgb = {
    r: 0,
    g: 0,
    b: 0,
  };
  const canvas = document.createElement("canvas");
  const context = canvas.getContext && canvas.getContext("2d");
  let data, width, height;
  let i = -4;
  let length;
  let count = 0;

  if (!context) {
    return defaultRGB;
  }

  height = canvas.height =
    imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
  width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

  context.imageSmoothingEnabled = true;
  context.drawImage(imgEl, 0, 0);

  try {
    data = context.getImageData(0, 0, width, height);
  } catch (e) {
    return defaultRGB;
  }

  length = data.data.length;

  while ((i += blockSize * 4) < length) {
    ++count;
    rgb.r += data.data[i];
    rgb.g += data.data[i + 1];
    rgb.b += data.data[i + 2];
  }

  // ~~ used to floor values
  rgb.r = ~~(rgb.r / count);
  rgb.g = ~~(rgb.g / count);
  rgb.b = ~~(rgb.b / count);

  return rgb;
}

function getLighterColor({ r, g, b }, howMuch) {
  r = r + howMuch > 255 ? 255 : r + howMuch;
  g = g + howMuch > 255 ? 255 : g + howMuch;
  b = b + howMuch > 255 ? 255 : b + howMuch;

  return {
    rl: r,
    gl: g,
    bl: b,
  };
}

export default function Slide() {
  const id = useParams().id;
  const [slide, setSlide] = useState({});
  const [currentIndexFile, setCurrentIndexFile] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeSlide, setTimeSlide] = useState(3);
  const fileInterval = useRef(null);
  const imageRef = useRef(null);
  const backgroundRef = useRef(null);

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
        const imgEl = document.createElement("img");
        imgEl.src = `${STORAGE_URL}${json.files[currentIndexFile].path}`;
        const { r, g, b } = getAvgRGB(imgEl);
        const { rl, gl, bl } = getLighterColor(
          {
            r,
            g,
            b,
          },
          20
        );

        console.log({ r, g, b });
        backgroundRef.current.style.background = `linear-gradient(to bottom, rgb(${rl},${gl},${bl}), rgb(${r},${g},${b}))`;
      } catch (e) {
        console.log(e);
      }
    };

    getSlide();
  }, [currentIndexFile, id]);

  const toggleFullscreen = useCallback(() => {
    !isFullscreen && document.documentElement.requestFullscreen();

    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleNext = useCallback(() => {
    setCurrentIndexFile((prev) => (prev + 1) % slide.files.length);
  }, [slide?.files?.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndexFile(
      (prev) => (prev - 1 + slide.files.length) % slide.files.length
    );
  }, [slide?.files?.length]);

  const handleChangeTime = (e) => {
    e.preventDefault();
    setTimeSlide(e.target.value);
    clearInterval(fileInterval.current);
    fileInterval.current = null;
    setIsPlaying(false);
  };

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      clearInterval(fileInterval.current);
      fileInterval.current = null;
    } else {
      if (!fileInterval.current) {
        fileInterval.current = setInterval(handleNext, timeSlide * 1000);
      }
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, handleNext, timeSlide]);

  useEffect(() => {
    return () => clearInterval(fileInterval.current);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const handlers = {
        KeyF: toggleFullscreen,
        ArrowRight: handleNext,
        ArrowLeft: handlePrev,
        Space: togglePlay,
        Escape: () => setIsFullscreen(false),
      };

      if (!Object.keys(handlers).includes(event.code)) return false;

      handlers[event.code]();
    };

    window.addEventListener("keyup", handleKeyDown);

    return () => {
      window.removeEventListener("keyup", handleKeyDown);
    };
  }, [togglePlay, handlePrev, handleNext, toggleFullscreen, isFullscreen]);

  const imageUrl =
    slide.files &&
    slide.files.length > 0 &&
    slide.files[currentIndexFile] &&
    slide.files[currentIndexFile].path;

  return (
    <>
      <div
        ref={backgroundRef}
        className="w-auto"
        style={{ height: isFullscreen ? "100vh" : "calc(100vh - 6rem)" }}
      >
        <img
          ref={imageRef}
          src={`${STORAGE_URL}${imageUrl ?? ""}`}
          alt=""
          className="object-cover h-full w-auto mx-auto"
        />
      </div>

      {!isFullscreen && (
        <div className="fixed bottom-0 left-0 z-50 grid w-full h-24 grid-cols-1 px-8 bg-white border-t border-gray-200 md:grid-cols-3 dark:bg-gray-700 dark:border-gray-600">
          <div className="items-center justify-center hidden me-auto md:flex">
            <a
              href="/"
              type="button"
              className="mr-2 p-2.5 group rounded-full hover:bg-gray-100 me-1 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 dark:hover:bg-gray-600"
            >
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
              </svg>
            </a>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {slide.title}
            </span>
          </div>
          <div className="flex items-center w-full">
            <div className="w-full">
              <div className="flex items-center justify-center mx-auto mb-1">
                {/* previous */}
                <button
                  onClick={handlePrev}
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
                    togglePlay();
                    e.currentTarget.blur();
                  }}
                  type="button"
                  className="inline-flex items-center justify-center p-3 mx-2 font-medium bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
                >
                  {isPlaying ? (
                    <i className="fa-solid fa-pause w-3 h-3 text-white flex justify-center items-center"></i>
                  ) : (
                    <i className="fa-solid fa-play w-3 h-3 text-white flex justify-center items-center"></i>
                  )}
                </button>

                {/* next */}
                <button
                  onClick={handleNext}
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
              </div>
            </div>
          </div>

          <div className="items-center justify-center hidden ms-auto md:flex">
            <div className="w-full grid grid-cols-3 gap-2 items-center text-gray-600">
              <span className="text-xs">Cambiar cada</span>
              <input
                type="text"
                className="p-2 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500"
                value={timeSlide}
                onChange={handleChangeTime}
              />
              <span className="text-xs ">segundos</span>
            </div>

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
          </div>
        </div>
      )}
    </>
  );
}
