function App() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="text-5xl font-black tracking-tight text-white">
          Klubly <span className="text-sky-400">2026</span>
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          Frontend inicializado con éxito.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse"></div>
          <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse [animation-delay:0.2s]"></div>
          <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
