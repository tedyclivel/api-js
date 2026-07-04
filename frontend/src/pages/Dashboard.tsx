import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../services/api';
import { Wallet, LogOut, Plus, ArrowUpRight, ArrowDownRight, RefreshCw, CreditCard } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [comptes, setComptes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedCompteId, setSelectedCompteId] = useState<number | null>(null);
  const [historique, setHistorique] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState('historique'); // historique | depot | retrait | virement | nouveau
  const [actionMsg, setActionMsg] = useState({ text: '', type: '' });
  const [actionLoading, setActionLoading] = useState(false);
  
  const [montant, setMontant] = useState('');
  const [compteDestId, setCompteDestId] = useState('');
  const [nouveauTypeCompte, setNouveauTypeCompte] = useState('EPARGNE');
  const [soldeInitial, setSoldeInitial] = useState('0');

  useEffect(() => {
    loadComptes();
  }, []);

  const loadComptes = async (preserveSelection = false) => {
    try {
      const data = await fetchApi('/mes-comptes');
      setComptes(data);
      if (data.length > 0 && !preserveSelection && !selectedCompteId) {
        setSelectedCompteId(data[0].id);
        loadHistorique(data[0].id);
      }
    } catch (err: any) {
      if (err.message.includes('Token') || err.message.includes('authentification')) {
        handleLogout();
      } else {
        setError('Impossible de charger vos comptes.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadHistorique = async (id: number) => {
    try {
      const data = await fetchApi(`/comptes/${id}/historique`);
      setHistorique(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCompte = (id: number) => {
    setSelectedCompteId(id);
    setActiveTab('historique');
    setActionMsg({ text: '', type: '' });
    loadHistorique(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAction = async (endpoint: string, extraBody = {}) => {
    if (!montant || parseFloat(montant) <= 0) {
      setActionMsg({ text: 'Veuillez entrer un montant valide', type: 'error' });
      return;
    }
    setActionLoading(true);
    setActionMsg({ text: '', type: '' });

    try {
      await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify({ montant: parseFloat(montant), ...extraBody }),
      });
      setActionMsg({ text: 'Opération réussie !', type: 'success' });
      setMontant('');
      setCompteDestId('');
      await loadComptes(true);
      if (selectedCompteId) loadHistorique(selectedCompteId);
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Erreur', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreerCompte = async () => {
    setActionLoading(true);
    setActionMsg({ text: '', type: '' });
    try {
      // On capture la réponse : le compte créé avec son solde mis à jour
      const newCompte = await fetchApi('/comptes', {
        method: 'POST',
        body: JSON.stringify({ type_compte: nouveauTypeCompte, solde_initial: parseFloat(soldeInitial) })
      });
      // Recharge la liste complète des comptes
      await loadComptes(true);
      // Sélectionne automatiquement le nouveau compte pour l'afficher
      setSelectedCompteId(newCompte.id);
      loadHistorique(newCompte.id);
      setSoldeInitial('0');
      setActionMsg({ text: 'Compte créé avec succès !', type: 'success' });
      setActiveTab('historique');
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Erreur création', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const selectedCompte = comptes.find(c => c.id === selectedCompteId);

  return (
    <div className="dashboard-layout">
      <nav className="navbar">
        <div className="nav-brand">
          <Wallet className="text-primary" /> TEMA
        </div>
        <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={handleLogout}>
          <LogOut size={18} /> Déconnexion
        </button>
      </nav>

      <div className="container mt-4">
        {loading ? (
          <div className="text-center"><RefreshCw className="text-primary" /> Chargement...</div>
        ) : error ? (
          <div className="text-danger text-center">{error}</div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: '1fr 3fr' }}>
            {/* Sidebar Comptes */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Mes Comptes</h3>
                <button 
                  className="btn btn-secondary" 
                  style={{ width: 'auto', padding: '0.4rem 0.6rem' }}
                  onClick={() => setActiveTab('nouveau')}
                >
                  <Plus size={18} />
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comptes.map(compte => (
                  <div 
                    key={compte.id} 
                    className={`account-card ${selectedCompteId === compte.id ? 'active' : ''}`}
                    onClick={() => handleSelectCompte(compte.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{compte.type_compte}</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{Number(compte.solde).toFixed(2)} €</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>N° {compte.id.toString().padStart(6, '0')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Area */}
            <div className="card">
              {activeTab === 'nouveau' ? (
                <div>
                  <h2 className="mb-4">Ouvrir un nouveau compte</h2>
                  {actionMsg.text && <div className={`text-${actionMsg.type} mb-4 p-3 rounded`} style={{ background: 'var(--input-bg)', border: `1px solid var(--${actionMsg.type})` }}>{actionMsg.text}</div>}
                  <div className="input-group">
                    <label>Type de compte</label>
                    <select className="input" value={nouveauTypeCompte} onChange={e => setNouveauTypeCompte(e.target.value)}>
                      <option value="EPARGNE">Compte Épargne</option>
                      <option value="COURANT">Compte Courant</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Solde initial (€)</label>
                    <input type="number" className="input" value={soldeInitial} onChange={e => setSoldeInitial(e.target.value)} min="0" step="10" />
                  </div>
                  <button className="btn" onClick={handleCreerCompte} disabled={actionLoading}>Créer le compte</button>
                </div>
              ) : selectedCompte ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Compte {selectedCompte.type_compte}</h2>
                      <div className="text-muted" style={{ fontSize: '1rem' }}>Numéro : {selectedCompte.id.toString().padStart(6, '0')}</div>
                    </div>
                    <div className="text-2xl">
                      {Number(selectedCompte.solde).toFixed(2)} €
                    </div>
                  </div>

                  <div className="tabs">
                    <button className={`tab ${activeTab === 'historique' ? 'active' : ''}`} onClick={() => setActiveTab('historique')}>Historique</button>
                    <button className={`tab ${activeTab === 'depot' ? 'active' : ''}`} onClick={() => setActiveTab('depot')}>Dépôt</button>
                    <button className={`tab ${activeTab === 'retrait' ? 'active' : ''}`} onClick={() => setActiveTab('retrait')}>Retrait</button>
                    <button className={`tab ${activeTab === 'virement' ? 'active' : ''}`} onClick={() => setActiveTab('virement')}>Virement</button>
                  </div>

                  {actionMsg.text && (
                    <div className={`mb-4 p-3 rounded`} style={{ backgroundColor: actionMsg.type === 'error' ? '#FEF2F2' : '#ECFDF5', color: actionMsg.type === 'error' ? 'var(--danger)' : 'var(--success)', border: `1px solid ${actionMsg.type === 'error' ? '#FCA5A5' : '#6EE7B7'}` }}>
                      {actionMsg.text}
                    </div>
                  )}

                  {activeTab === 'historique' && (
                    <div>
                      {historique.length === 0 ? (
                        <div className="text-center text-muted" style={{ padding: '4rem' }}>
                          <RefreshCw size={32} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                          <p>Aucune transaction récente sur ce compte.</p>
                        </div>
                      ) : (
                        <ul className="transaction-list">
                          {historique.map(tx => {
                            const isNegative = tx.type_transaction === 'RETRAIT' || (tx.type_transaction === 'VIREMENT' && tx.compte_id === selectedCompte.id);
                            return (
                              <li key={tx.id} className="transaction-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <div className={`icon-box ${isNegative ? 'danger' : 'success'}`}>
                                    {isNegative ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, color: 'var(--secondary)' }}>{tx.type_transaction}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(tx.date_transaction).toLocaleString('fr-FR')}</div>
                                  </div>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '1.2rem', color: isNegative ? 'var(--text-main)' : 'var(--success)' }}>
                                  {isNegative ? '-' : '+'} {Number(tx.montant).toFixed(2)} €
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}

                  {activeTab === 'depot' && (
                    <div style={{ maxWidth: '450px' }}>
                      <h3 className="mb-4">Effectuer un dépôt</h3>
                      <div className="input-group">
                        <label>Montant (€)</label>
                        <input type="number" className="input" value={montant} onChange={e => setMontant(e.target.value)} placeholder="0.00" />
                      </div>
                      <button className="btn" onClick={() => handleAction(`/comptes/${selectedCompte.id}/depot`)} disabled={actionLoading}>Valider le dépôt</button>
                    </div>
                  )}

                  {activeTab === 'retrait' && (
                    <div style={{ maxWidth: '450px' }}>
                      <h3 className="mb-4">Effectuer un retrait</h3>
                      <div className="input-group">
                        <label>Montant (€)</label>
                        <input type="number" className="input" value={montant} onChange={e => setMontant(e.target.value)} placeholder="0.00" />
                      </div>
                      <button className="btn" onClick={() => handleAction(`/comptes/${selectedCompte.id}/retrait`)} disabled={actionLoading}>Valider le retrait</button>
                    </div>
                  )}

                  {activeTab === 'virement' && (
                    <div style={{ maxWidth: '450px' }}>
                      <h3 className="mb-4">Nouveau virement</h3>
                      <div className="input-group">
                        <label>Compte bénéficiaire (N°)</label>
                        <input type="text" className="input" value={compteDestId} onChange={e => setCompteDestId(e.target.value)} placeholder="Identifiant du compte" />
                      </div>
                      <div className="input-group">
                        <label>Montant (€)</label>
                        <input type="number" className="input" value={montant} onChange={e => setMontant(e.target.value)} placeholder="0.00" />
                      </div>
                      <button className="btn" onClick={() => handleAction(`/comptes/${selectedCompte.id}/virement`, { compteDestinationId: compteDestId })} disabled={actionLoading}>Envoyer l'argent</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted" style={{ padding: '6rem 2rem' }}>
                  <CreditCard size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--border)' }} />
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--secondary)' }}>Aucun compte sélectionné</h3>
                  <p>Sélectionnez un compte dans le menu de gauche ou ouvrez-en un nouveau.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
