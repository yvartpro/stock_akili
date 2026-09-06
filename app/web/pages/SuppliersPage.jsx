import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Truck, Plus, Mail, Phone, MapPin, Search, PackageCheck, AlertCircle, Check, Loader2 } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await api.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.createSupplier({
        code: code.toUpperCase(),
        name,
        contactName,
        phone,
        email,
        address
      });

      setModalOpen(false);
      setCode('');
      setName('');
      setContactName('');
      setPhone('');
      setEmail('');
      setAddress('');
      loadSuppliers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-stone-600" />
            Fournisseurs Partenaires
          </h2>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nouveau Fournisseur
        </button>
      </div>

      {/* Grid of Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          <div className="col-span-full p-10 text-center text-stone-500">
            Chargement des fournisseurs...
          </div>
        ) : suppliers.length === 0 ? (
          <div className="col-span-full p-10 text-center text-stone-500">
            Aucun fournisseur enregistré.
          </div>
        ) : (
          suppliers.map((sup) => (
            <div key={sup.id} className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm hover:border-stone-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-sm font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                      {sup.code}
                    </span>
                    <h3 className="font-bold text-base text-stone-900 mt-1">{sup.name}</h3>
                  </div>
                  <div className="w-7 h-7 rounded bg-stone-100 flex items-center justify-center text-stone-500">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-stone-600 mt-3">
                  {sup.contactName && (
                    <p className="flex items-center gap-2 text-stone-700">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      Contact : <strong className="text-stone-900 font-semibold">{sup.contactName}</strong>
                    </p>
                  )}
                  {sup.phone && (
                    <p className="flex items-center gap-2 text-stone-500">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      {sup.phone}
                    </p>
                  )}
                  {sup.email && (
                    <p className="flex items-center gap-2 text-stone-500">
                      <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      {sup.email}
                    </p>
                  )}
                  {sup.address && (
                    <p className="flex items-center gap-2 text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      {sup.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-sm text-stone-500">
                <span>Historique réceptions :</span>
                <span className="font-mono font-bold text-stone-900">
                  {sup.receptions?.length || 0} livraison(s)
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Supplier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-stone-200 rounded-lg p-5 shadow-xl">
            <h3 className="text-base font-bold text-stone-900 mb-0.5">
              Enregistrer un Fournisseur Partenaire
            </h3>
            <p className="text-sm text-stone-500 mb-3.5">
              Ce fournisseur pourra être sélectionné lors de toute réception de marchandises
            </p>

            {error && (
              <div className="mb-3 p-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-stone-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Code Fournisseur *</label>
                  <input
                    type="text"
                    placeholder="FOUR-003"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 uppercase font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Raison Sociale *</label>
                  <input
                    type="text"
                    placeholder="Congo Mobile Import SARL"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Nom du Contact Commercial</label>
                <input
                  type="text"
                  placeholder="M. Patrick Kasongo"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+243 81 234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="contact@fournisseur.cd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Adresse Géographique</label>
                <input
                  type="text"
                  placeholder="Boulevard du 30 Juin, Gombe, Kinshasa"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 text-sm text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Enregistrement en cours...' : 'Enregistrer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
