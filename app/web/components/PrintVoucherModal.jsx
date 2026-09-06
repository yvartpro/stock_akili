import React from 'react';
import { X, Printer, CheckCircle2, Building2, Store, Calendar, Clock, User, ShieldCheck } from 'lucide-react';

export default function PrintVoucherModal({ isOpen, onClose, voucher, type = 'sortie' }) {
  if (!isOpen || !voucher) return null;

  const isSortie = type === 'sortie';
  const title = isSortie ? 'BON DE SORTIE DE STOCK PRINCIPAL' : 'BON DE RÉCEPTION FOURNISSEUR';
  const docNumber = isSortie ? voucher.voucherNumber : voucher.receptionNumber;
  const partnerName = isSortie ? voucher.shop?.name : voucher.supplier?.name;
  const partnerCode = isSortie ? voucher.shop?.code : voucher.supplier?.code;
  const partnerDetail = isSortie ? voucher.shop?.location : voucher.supplier?.contactName;

  const handlePrint = () => {
    // JavaScript direct print handler that works reliably in iframes
    const printableElement = document.getElementById('printable-voucher-document');
    if (!printableElement) {
      window.print();
      return;
    }

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${docNumber} - APS Stock</title>
            <style>
              @page { size: A4 portrait; margin: 15mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 10px; color: #1c1917; font-size: 13px; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #44403c; padding-bottom: 12px; margin-bottom: 16px; }
              .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #fafaf9; border: 1px solid #e7e5e4; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 12px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
              th, td { border: 1px solid #d6d3d1; padding: 6px 8px; text-align: left; }
              th { background-color: #44403c; color: white; font-weight: 600; }
              .text-right { text-align: right; }
              .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 30px; text-align: center; font-size: 12px; }
              .sig-box { border-top: 1px solid #d6d3d1; padding-top: 4px; font-size: 11px; color: #78716c; margin-top: 45px; }
              .tag { display: inline-block; background: #44403c; color: #fff; padding: 2px 6px; font-weight: bold; border-radius: 4px; font-size: 11px; }
            </style>
          </head>
          <body>
            ${printableElement.innerHTML}
          </body>
        </html>
      `);
      iframeDoc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }, 300);
    } catch (err) {
      console.warn('Iframe print error, falling back to window.print():', err);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden my-8">
        {/* Top modal header (hidden during printing) */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-stone-200 bg-stone-50 no-print">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-700">Aperçu officiel avant impression</span>
            <span className="px-2 py-0.5 rounded text-sm font-mono bg-stone-100 text-stone-700 border border-stone-200">
              {docNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-600 hover:bg-stone-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer le document
            </button>
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div id="printable-voucher-document" className="p-8 bg-white text-stone-900 printable-document">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-stone-900 pb-5 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-stone-900 text-white font-bold text-sm rounded tracking-wider">
                  APS
                </span>
                <span className="text-lg font-bold tracking-tight text-stone-900">
                  MAGASIN APS - STOCK CENTRAL
                </span>
              </div>
              <p className="text-sm text-stone-600">Pochettes & Protections Anti-casse pour Téléphones</p>
              <p className="text-sm text-stone-500">Plateforme Logistique Kinshasa • Tél: +243 81 000 00 00</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono tracking-widest text-stone-500 uppercase">DOCUMENT OFFICIEL</div>
              <div className="text-base font-bold font-mono text-stone-900">{docNumber}</div>
              <div className="text-sm font-semibold px-2 py-0.5 mt-1 rounded bg-stone-100 text-stone-700 border border-stone-200 inline-block">
                STATUT: VALIDÉ & HISTORISÉ
              </div>
            </div>
          </div>

          <div className="text-center my-3 py-1.5 bg-stone-50 rounded-lg border border-stone-200">
            <h2 className="text-sm font-bold tracking-wide uppercase text-stone-900">{title}</h2>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-sm mb-5">
            <div>
              <p className="text-stone-500 font-medium mb-1">
                {isSortie ? 'DESTINATAIRE (POINT DE VENTE) :' : 'FOURNISSEUR LIVREUR :'}
              </p>
              <p className="font-bold text-sm text-stone-900">{partnerName} ({partnerCode})</p>
              <p className="text-stone-600">{partnerDetail}</p>
            </div>
            <div>
              <div className="flex justify-between py-0.5 border-b border-stone-200">
                <span className="text-stone-500">Date d'émission :</span>
                <span className="font-semibold text-stone-900">{voucher.date}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-stone-200">
                <span className="text-stone-500">Heure de validation :</span>
                <span className="font-semibold text-stone-900">{voucher.time}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-stone-500">Opérateur responsable :</span>
                <span className="font-semibold text-stone-900">{voucher.user?.name || 'Gestionnaire Stock'}</span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-stone-300 rounded-lg overflow-hidden mb-5">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-stone-900 text-white font-semibold">
                  <th className="p-2.5 border-r border-stone-700">Réf. / SKU</th>
                  <th className="p-2.5 border-r border-stone-700">Désignation Produit</th>
                  <th className="p-2.5 border-r border-stone-700">Marque / Modèle</th>
                  <th className="p-2.5 border-r border-stone-700">Couleur / Type</th>
                  <th className="p-2.5 text-right font-bold">Quantité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {voucher.items?.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="p-2.5 font-mono text-sm font-semibold text-stone-800 border-r border-stone-200">
                      {item.product?.sku}
                    </td>
                    <td className="p-2.5 font-medium text-stone-900 border-r border-stone-200">
                      {item.product?.name}
                    </td>
                    <td className="p-2.5 text-stone-700 border-r border-stone-200">
                      {item.product?.brand?.name || '-'} • {item.product?.phoneModel?.name || '-'}
                    </td>
                    <td className="p-2.5 text-stone-600 border-r border-stone-200">
                      {item.product?.color?.name}
                      {item.product?.protectionType && ` (${item.product.protectionType})`}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-stone-900 text-sm">
                      {isSortie ? item.quantity : item.quantityReceived}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-stone-100 font-bold border-t-2 border-stone-300">
                  <td colSpan={4} className="p-3 text-right uppercase tracking-wider text-stone-700">
                    Total Pièces Expédiées :
                  </td>
                  <td className="p-3 text-right font-mono text-base text-stone-900">
                    {voucher.items?.reduce((acc, it) => acc + (isSortie ? it.quantity : it.quantityReceived), 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Observations */}
          {voucher.observation && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm mb-5">
              <span className="font-semibold text-stone-700">Observations / Consignes logistiques : </span>
              <span className="text-stone-600">{voucher.observation}</span>
            </div>
          )}

          {/* Signature Blocks */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-300 text-center text-sm">
            <div>
              <p className="font-bold text-stone-800 mb-12">Le Responsable Stock</p>
              <div className="border-t border-stone-300 pt-1 text-sm text-stone-500">
                Signature & Cachet
              </div>
            </div>
            <div>
              <p className="font-bold text-stone-800 mb-12">Chauffeur / Transporteur</p>
              <div className="border-t border-stone-300 pt-1 text-sm text-stone-500">
                Nom & Émargement
              </div>
            </div>
            <div>
              <p className="font-bold text-stone-800 mb-12">
                {isSortie ? 'Le Responsable Shop' : 'Contrôle Qualité'}
              </p>
              <div className="border-t border-stone-300 pt-1 text-sm text-stone-500">
                Réception conforme
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-8 pt-4 border-t border-stone-200 text-center text-sm text-stone-600">
            Document généré par le Système informatisé APS Stock Principal. Règle métier : Aucun retour de produit vers le stock principal n'est autorisé.
          </div>
        </div>
      </div>
    </div>
  );
}
