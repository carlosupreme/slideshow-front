import { useState } from "react";
import PropTypes from "prop-types";

const API_URL = `${import.meta.env.VITE_APP_API_URL}/slide`;
const API_METHOD = "POST";
const STATUS_IDLE = 0;
const STATUS_UPLOADING = 1;

function CreateButton({ onClick, text, disabled }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type="submit"
      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
    >
      {text == "Cargando" ? (
        <>
          <svg
            aria-hidden="true"
            role="status"
            className="inline w-4 h-4 me-3 text-white animate-spin"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="#E5E7EB"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentColor"
            />
          </svg>
          {text}
        </>
      ) : (
        text
      )}
    </button>
  );
}

CreateButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

export default function CreateSlide() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState(STATUS_IDLE);
  const [title, setTitle] = useState("");

  const uploadFiles = (data) => {
    setStatus(STATUS_UPLOADING);

    fetch(API_URL, {
      method: API_METHOD,
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setFiles([]);
        setTitle("");

        window.location.reload();
      })
      .catch((err) => console.error(err))
      .finally(() => setStatus(STATUS_IDLE));
  };

  const packFiles = (files) => {
    const data = new FormData();
    const files2 = [...files];
    files2.forEach((file, i) => {
      data.append(`file-${i}`, file, file.name);
    });
    data.append("title", title);
    return data;
  };

  const handleUploadClick = () => {
    if (files.length) {
      const data = packFiles(files);
      uploadFiles(data);
    }
  };

  const renderFileList = () => (
    <ol>
      {[...files].map((f, i) => (
        <li key={i}>
          {f.name} - {f.type}
        </li>
      ))}
    </ol>
  );

  const getButtonStatusText = () =>
    status === STATUS_IDLE ? "Crear" : "Cargando";

  return (
    <form className="flex flex-col gap-2 ">
      <input
        type="text"
        placeholder="Título"
        value={title}
        required
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 border border-gray-300 rounded-lg"
      />
      <label htmlFor="file">Subir archivos</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />
      {renderFileList()}

      <CreateButton
        onClick={handleUploadClick}
        disabled={status === STATUS_UPLOADING}
        text={getButtonStatusText()}
      />
    </form>
  );
}
