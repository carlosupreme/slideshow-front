export default function Error404() {
    return (
      <div className="max-w-screen-md mx-auto my-10 flex flex-col gap-6 text-3xl font-bold">
        <h1>Pagina no encontrada por favor reivsa la URL</h1>
        <a
          className="text-blue-500 hover:underline hover:text-blue-700"
          href="/"
        >
          Volver a inicio
        </a>      
      </div>
    );
  }