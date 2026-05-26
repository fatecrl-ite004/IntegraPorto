export default function EmConstrucao({ titulo }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">Módulo: {titulo}</h2>
      <p className="text-slate-500 max-w-md">
        Esta tela está na fila de desenvolvimento. O backend para este CRUD já foi modelado no banco de dados e aguarda a conexão final da interface.
      </p>
    </div>
  );
}
