import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Store, Plus, MapPin, Phone, User, Package, ArrowUpFromLine, AlertCircle, Loader2 } from 'lucide-react';

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    setLoading(true);
    try {
      const data = await api.getShops();
      setShops(data);
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
      await api.createShop({
        code: code.toUpperCase(),
        name,
        location,
        managerName,
        phone
      });

      setModalOpen(false);
      setCode('');
      setName('');
      setLocation('');
      setManagerName('');
      setPhone('');
      loadShops();
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
            <Store className="w-5 h-5 text-stone-600" />
            Points de Vente APS (Shops Destinataires)
          </h2>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nouveau Shop
        </button>
      </div>

      {/* Grid of Shops */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          <div className="col-span-full p-10 text-center text-stone-500">
            Chargement des points de vente...
          </div>
        ) : shops.length === 0 ? (
          <div className="col-span-full p-10 text-center text-stone-500">
            Aucun point de vente enregistré.
          </div>
        ) : (
          shops.map((shop) => (
            <div key={shop.id} className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm hover:border-stone-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-sm font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                      {shop.code}
                    </span>
                    <h3 className="font-bold text-base text-stone-900 mt-1">{shop.name}</h3>
                  </div>
                  <div className="w-7 h-7 rounded bg-stone-100 flex items-center justify-center text-stone-500">
                    <Store className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-stone-600 mt-3">
                  {shop.location && (
                    <p className="flex items-center gap-2 text-stone-700">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      {shop.location}
                    </p>
                  )}
                  {shop.managerName && (
                    <p className="flex items-center gap-2 text-stone-700">
                      <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      Responsable : <strong className="text-stone-900 font-semibold">{shop.managerName}</strong>
                    </p>
                  )}
                  {shop.phone && (
                    <p className="flex items-center gap-2 text-stone-500">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      {shop.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-sm text-stone-500">
                <span>Total Bons de Sortie :</span>
                <span className="font-mono font-bold text-stone-900">
                  {shop.exitVouchers?.length || 0} expédition(s)
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Shop Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-stone-200 rounded-lg p-5 shadow-xl">
            <h3 className="text-base font-bold text-stone-900 mb-0.5">
              Créer un Nouveau Point de Vente
            </h3>
            <p className="text-sm text-stone-500 mb-3.5">
              Ce shop apparaîtra comme destinataire dans les formulaires de bons de sortie
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
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Code Shop *</label>
                  <input
                    type="text"
                    placeholder="SHOP-005"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 uppercase font-mono focus:border-sky-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Nom Commercial *</label>
                  <input
                    type="text"
                    placeholder="APS Yoff"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-sky-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Localisation / Ville / Commune *</label>
                <input
                  type="text"
                  placeholder="Boulevard du 30 Juin, Gombe, Kinshasa"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-sky-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Responsable Boutique</label>
                  <input
                    type="text"
                    placeholder="M. Dieudonné Kabamba"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+243 81 555 0101"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-sky-500 outline-none"
                  />
                </div>
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
                  <span>{submitting ? 'Création en cours...' : 'Créer le Shop'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
