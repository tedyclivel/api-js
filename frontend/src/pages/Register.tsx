import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../services/api';
import { Wallet } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', motDePasse: '', age: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await fetchApi('/utilisateurs/register', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age, 10)
        }),
      });
      // Inscription réussie, on redirige vers le login
      navigate('/login');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="card auth-card">
        <div className="text-center mb-4">
          <Wallet className="text-primary" size={48} style={{ margin: '0 auto', color: 'var(--primary)' }} />
          <h2 style={{ marginTop: '1rem' }}>Ouvrir un compte</h2>
          <p className="text-muted">Rejoignez TEMA aujourd'hui</p>
        </div>

        {error && <div className="text-danger mb-2 text-center">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Prénom</label>
              <input type="text" className="input" required value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Nom</label>
              <input type="text" className="input" required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
            </div>
          </div>
          <div className="input-group">
            <label>Adresse Email</label>
            <input type="email" className="input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Mot de passe</label>
              <input type="password" className="input" required value={formData.motDePasse} onChange={e => setFormData({...formData, motDePasse: e.target.value})} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Âge</label>
              <input type="number" className="input" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Création...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
          Déjà client ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
