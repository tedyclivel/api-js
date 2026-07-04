import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../services/api';
import { Wallet } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await fetchApi('/login', {
        method: 'POST',
        body: JSON.stringify({ email, motDePasse }),
      });
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="card auth-card">
        <div className="text-center mb-4">
          <Wallet className="text-primary" size={48} style={{ margin: '0 auto', color: 'var(--primary)' }} />
          <h2 style={{ marginTop: '1rem' }}>Connexion TEMA</h2>
          <p className="text-muted">Accédez à votre espace sécurisé</p>
        </div>

        {error && <div className="text-danger mb-2 text-center">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Adresse Email</label>
            <input 
              type="email" 
              className="input" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
            />
          </div>
          <div className="input-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              className="input" 
              required
              value={motDePasse}
              onChange={e => setMotDePasse(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
