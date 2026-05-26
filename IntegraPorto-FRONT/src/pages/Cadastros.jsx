import { useNavigate } from 'react-router-dom';

export default function Cadastros() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Cadastros Base</h2>
          <p className="text-sm text-slate-500">Gerencie veículos, motoristas e empresas associadas.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Chapeiras / Vagas', desc: 'Gerenciar 1-400', path: '/cadastros/chapeiras' },
          { title: 'Associados (Motoristas)', desc: 'Motoristas e Proprietários', path: '/cadastros/associados' },
          { title: 'Cavalos Mecânicos', desc: 'Cadastro de Placas e Renavam', path: '/cadastros/cavalos' },
          { title: 'Carretas', desc: 'Implementos rodoviários', path: '/cadastros/carretas' },
          { title: 'Transportadoras', desc: 'Empresas parceiras', path: '/cadastros/transportadoras' },
          { title: 'Armadores / Navios', desc: 'Dados de embarcações', path: '/cadastros/armadores' },
        ].map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} className="p-5 border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group bg-white">
            <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
