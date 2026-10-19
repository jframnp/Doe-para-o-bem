import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStorage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(Boolean(tokenStorage.get()));

  // Restaura a sessão a partir do token salvo
  useEffect(() => {
    if (!tokenStorage.get()) return;
    api
      .me()
      .then(setUsuario)
      .catch(() => tokenStorage.clear())
      .finally(() => setCarregando(false));
  }, []);

  const iniciarSessao = useCallback(({ usuario: u, token }) => {
    tokenStorage.set(token);
    setUsuario(u);
    return u;
  }, []);

  const login = useCallback(async (email, senha) => iniciarSessao(await api.login({ email, senha })), [iniciarSessao]);
  const registrar = useCallback(async (dados) => iniciarSessao(await api.registrar(dados)), [iniciarSessao]);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
