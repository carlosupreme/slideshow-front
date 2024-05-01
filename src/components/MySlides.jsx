import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_APP_API_URL}/slide`;
const STORAGE_URL = `${import.meta.env.VITE_APP_STORAGE_URL}`;

Slide.propTypes = {
  slide: PropTypes.object.isRequired
};

function Slide({ slide }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/slide/${slide.id}`)}
      style={{
        backgroundImage: `url(${STORAGE_URL}${slide.files[0]?.path})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "50% 50%",
      }}
      className="relative w-72 h-64 shrink-0 grid place-items-center rounded-xl"
    >
      <div className="absolute inset-0 grid place-items-center cursor-pointer bg-black bg-opacity-50 rounded-xl">
        <h2 className="text-white font-bold text-2xl">{slide.title}</h2>
      </div>
    </div>
  );
}

export default function MySlides() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSlides = async () => {
      try {
        const res = await fetch(API_URL);

        if (!res.ok) throw {};

        const json = await res.json();

        setSlides(json);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    };

    getSlides();
  }, []);

  return (
    <>
      <h2 className="font-bold text-2xl">Mis presentaciones</h2>
      <div className="flex gap-2 overflow-x-auto">
        {loading ? (
          <h2>Cargando presentaciones...</h2>
        ) : (
          slides.map((slide) => <Slide key={slide.id} slide={slide} />)
        )}
      </div>
    </>
  );
}
