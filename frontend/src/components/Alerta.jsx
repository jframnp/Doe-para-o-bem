/** Exibe mensagens de sucesso ou erro (inclui a lista de detalhes de validação da API). */
export default function Alerta({ tipo = 'erro', erro, children }) {
  if (!erro && !children) return null;
  return (
    <div className={`alerta alerta-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {children || erro.message}
      {erro?.detalhes?.length > 0 && (
        <ul>
          {erro.detalhes.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
