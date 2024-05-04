import CreateSlide from "../components/CreateSlide";
import MySlides from "../components/MySlides";

export default function Home() {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 p-4">
      <div className="flex flex-col gap-4">
        <MySlides />
      </div>

      <div className="flex flex-col gap-4">
        <h2>Crear Presentación</h2>
        <CreateSlide />
      </div>
    </div>
  );
}
