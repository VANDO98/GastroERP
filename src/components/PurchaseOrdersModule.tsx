import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Printer,
  Send,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Eye,
  Trash2,
  Share2,
  XCircle,
  Copy,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
  DetailedPurchaseInvoice,
  DetailedPurchaseItem
} from '../types';

export const PurchaseOrdersModule: React.FC = () => {
  const {
    purchaseOrders,
    addPurchaseOrder,
    updatePurchaseOrderStatus,
    addDetailedInvoice,
    suppliers,
    ingredients,
    companyConfig,
    themeMode
  } = useApp();

  const isLight = themeMode === 'light';

  // Insumos ordenados alfabéticamente A-Z
  const sortedIngredients = useMemo(() => {
    return [...ingredients].sort((a, b) =>
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    );
  }, [ingredients]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | PurchaseOrderStatus>('all');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string>('all');

  // Modales
  const [showNewPoModal, setShowNewPoModal] = useState<boolean>(false);
  const [viewingPo, setViewingPo] = useState<PurchaseOrder | null>(null);
  const [copySuccessNotice, setCopySuccessNotice] = useState<boolean>(false);
  const [canjeSuccessMsg, setCanjeSuccessMsg] = useState<string>('');

  // Formulario Nueva OC
  const [newPoSupplierId, setNewPoSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [newPoIssueDate, setNewPoIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newPoDeliveryDate, setNewPoDeliveryDate] = useState<string>(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newPoNotes, setNewPoNotes] = useState<string>('Entrega en puerta de almacén en horario de 07:00 a 10:00 hrs.');
  const [newPoItems, setNewPoItems] = useState<PurchaseOrderItem[]>([]);

  // Ítem temporal para añadir al constructor de OC
  const [tempIngId, setTempIngId] = useState<string>(sortedIngredients[0]?.id || '');
  const [tempQty, setTempQty] = useState<string>('10');
  const [tempPrice, setTempPrice] = useState<string>(
    sortedIngredients[0]?.costPerUnit.toFixed(2) || '3.50'
  );

  // Estado para Canje de OC por Compra Real
  const [poToCanjear, setPoToCanjear] = useState<PurchaseOrder | null>(null);
  const [canjeDocType, setCanjeDocType] = useState<'Factura' | 'Boleta'>('Factura');
  const [canjeSeries, setCanjeSeries] = useState<string>('F001');
  const [canjeNumber, setCanjeNumber] = useState<string>('');
  const [canjeDate, setCanjeDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [canjePaymentType, setCanjePaymentType] = useState<'Contado' | 'Al crédito (1 cuotas pend.)'>('Contado');
  const [canjeWarehouse, setCanjeWarehouse] = useState<string>('Almacén Principal Carabayllo');
  const [canjeItems, setCanjeItems] = useState<Array<{
    ingredientId: string;
    code: string;
    name: string;
    unit: string;
    orderedQty: number;
    receivedQty: number;
    unitPrice: number;
    isTaxAffected: boolean;
    subtotal: number;
  }>>([]);

  // Autogenerar siguiente correlativo OC-2026-xxx
  const nextPoNumber = useMemo(() => {
    const numbers = purchaseOrders
      .map(po => {
        const parts = po.poNumber.split('-');
        const n = parseInt(parts[parts.length - 1], 10);
        return isNaN(n) ? 0 : n;
      });
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `OC-2026-${String(maxNum + 1).padStart(3, '0')}`;
  }, [purchaseOrders]);

  const handleOpenNewPoModal = () => {
    setNewPoSupplierId(suppliers[0]?.id || '');
    setNewPoIssueDate(new Date().toISOString().split('T')[0]);
    setNewPoDeliveryDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setNewPoNotes('Entrega en puerta de almacén en horario de 07:00 a 10:30 hrs.');
    setNewPoItems([]);
    if (sortedIngredients[0]) {
      setTempIngId(sortedIngredients[0].id);
      setTempPrice(sortedIngredients[0].costPerUnit.toFixed(2));
      setTempQty('10');
    }
    setShowNewPoModal(true);
  };

  const handleSelectTempIngredient = (ingId: string) => {
    setTempIngId(ingId);
    const ing = ingredients.find(i => i.id === ingId);
    if (ing) {
      setTempPrice(ing.costPerUnit.toFixed(2));
    }
  };

  const handleAddItemToPo = () => {
    const qty = parseFloat(tempQty) || 0;
    const price = parseFloat(tempPrice) || 0;
    if (qty <= 0 || price <= 0) return;

    const ing = ingredients.find(i => i.id === tempIngId);
    if (!ing) return;

    const subtotal = Number((qty * price).toFixed(2));
    const newItem: PurchaseOrderItem = {
      id: `poi-${Date.now()}`,
      ingredientId: ing.id,
      ingredientCode: ing.code,
      ingredientName: ing.name,
      unit: ing.unit,
      quantity: qty,
      unitPrice: price,
      subtotal
    };

    setNewPoItems(prev => [...prev, newItem]);
    setTempQty('10');
  };

  const handleRemoveItemFromPo = (index: number) => {
    setNewPoItems(prev => prev.filter((_, i) => i !== index));
  };

  const poSubtotal = newPoItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const poTaxAmount = newPoItems.reduce((acc, curr) => {
    const ing = ingredients.find(i => i.id === curr.ingredientId);
    return ing?.isTaxAffected ? acc + Number((curr.subtotal * 0.18).toFixed(2)) : acc;
  }, 0);
  const poTotal = Number((poSubtotal + poTaxAmount).toFixed(2));

  const handleSavePurchaseOrder = (status: PurchaseOrderStatus) => {
    if (newPoItems.length === 0) return;
    const sup = suppliers.find(s => s.id === newPoSupplierId);

    addPurchaseOrder({
      poNumber: nextPoNumber,
      supplierId: newPoSupplierId,
      supplierName: sup?.name || 'PROVEEDOR GENERAL',
      supplierRuc: sup?.ruc || '',
      issueDate: newPoIssueDate,
      expectedDeliveryDate: newPoDeliveryDate,
      status,
      items: newPoItems,
      subtotal: poSubtotal,
      taxAmount: poTaxAmount,
      total: poTotal,
      notes: newPoNotes.trim()
    });

    setShowNewPoModal(false);
  };

  // Abrir Modal de Canje de OC por Compra Real
  const handleOpenCanjeModal = (po: PurchaseOrder) => {
    setPoToCanjear(po);
    setCanjeDocType('Factura');
    setCanjeSeries('F001');
    setCanjeNumber('');
    setCanjeDate(new Date().toISOString().split('T')[0]);
    setCanjePaymentType('Contado');
    setCanjeWarehouse('Almacén Principal Carabayllo');

    const mapped = po.items.map(item => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      return {
        ingredientId: item.ingredientId,
        code: item.ingredientCode,
        name: item.ingredientName,
        unit: item.unit,
        orderedQty: item.quantity,
        receivedQty: item.quantity, // Cantidad por defecto igual a la pedida, corregible
        unitPrice: item.unitPrice,  // Precio por defecto de la OC, corregible
        isTaxAffected: (ing?.isTaxAffected ?? false),
        subtotal: item.subtotal
      };
    });
    setCanjeItems(mapped);
  };

  const handleUpdateCanjeItem = (
    index: number,
    field: 'receivedQty' | 'unitPrice' | 'isTaxAffected',
    val: any
  ) => {
    setCanjeItems(prev => {
      const next = [...prev];
      const item = { ...next[index] };
      if (field === 'receivedQty') {
        item.receivedQty = parseFloat(val) || 0;
      } else if (field === 'unitPrice') {
        item.unitPrice = parseFloat(val) || 0;
      } else if (field === 'isTaxAffected') {
        item.isTaxAffected = Boolean(val);
      }
      item.subtotal = Number((item.receivedQty * item.unitPrice).toFixed(2));
      next[index] = item;
      return next;
    });
  };

  const canjeSubtotal = useMemo(() => {
    return canjeItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  }, [canjeItems]);

  const canjeTaxes = useMemo(() => {
    return canjeItems.reduce((acc, curr) => {
      return curr.isTaxAffected ? acc + Number((curr.subtotal * 0.18).toFixed(2)) : acc;
    }, 0);
  }, [canjeItems]);

  const canjeTotal = Number((canjeSubtotal + canjeTaxes).toFixed(2));

  const handleConfirmCanje = () => {
    if (!poToCanjear) return;
    if (!canjeNumber.trim()) {
      alert('Por favor ingrese el número del comprobante (Factura o Boleta) entregado por el proveedor.');
      return;
    }
    if (!canjeSeries.trim()) {
      alert('Por favor ingrese la serie del comprobante.');
      return;
    }

    const invoiceId = `inv-po-${Date.now()}`;
    const invCode = `FAC-${poToCanjear.poNumber.replace('OC-', '')}`;

    const invoiceItems: DetailedPurchaseItem[] = canjeItems.map((item, idx) => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      const taxAmount = item.isTaxAffected ? Number((item.subtotal * 0.18).toFixed(2)) : 0;
      return {
        id: `poi-${idx}-${Date.now()}`,
        ingredientId: item.ingredientId,
        code: item.code,
        name: item.name,
        itemType: ing?.itemType || 'insumo',
        presentation: item.unit === 'kg' ? 'KILOS' : item.unit === 'L' ? 'LITROS' : 'UNIDADES',
        quantity: item.receivedQty,
        warehouse: canjeWarehouse,
        isTaxAffected: item.isTaxAffected,
        unitValue: item.unitPrice,
        costVariationPercent: 0,
        discount: 0,
        subtotal: item.subtotal,
        taxAmount,
        total: item.isTaxAffected ? Number((item.subtotal + taxAmount).toFixed(2)) : item.subtotal
      };
    });

    const formattedDocNum = `${canjeSeries.trim().toUpperCase()}-${canjeNumber.trim()}`;

    const newInvoice: DetailedPurchaseInvoice = {
      id: invoiceId,
      codeNumber: invCode,
      registerDate: new Date().toISOString().split('T')[0],
      purchaseDate: canjeDate,
      documentType: canjeDocType,
      series: canjeSeries.trim().toUpperCase(),
      number: canjeNumber.trim(),
      local: companyConfig.tradeName,
      supplier: poToCanjear.supplierName,
      paymentType: canjePaymentType,
      currency: 'PEN',
      taxOption: 'IMPUESTOS INCLUIDOS',
      items: invoiceItems,
      subtotal: canjeSubtotal,
      globalDiscount: 0,
      taxableOperation: canjeTaxes > 0 ? canjeSubtotal : 0,
      unaffectedOperation: canjeTaxes === 0 ? canjeSubtotal : 0,
      taxes: canjeTaxes,
      total: canjeTotal,
      notes: `Canje de ${poToCanjear.poNumber}. ` + (poToCanjear.notes || ''),
      status: 'Activo',
      linkedPoId: poToCanjear.id,
      linkedPoNumber: poToCanjear.poNumber
    };

    // 1. Agregar a compras detalladas (actualiza inventario FIFO de inmediato)
    addDetailedInvoice(newInvoice);

    // 2. Marcar OC como recibida con referencia a la factura generada
    updatePurchaseOrderStatus(poToCanjear.id, 'recibida', {
      convertedToInvoiceId: invoiceId,
      convertedInvoiceNumber: `${canjeDocType} ${formattedDocNum}`
    });

    // 3. Notificación y cierre
    setCanjeSuccessMsg(`¡OC ${poToCanjear.poNumber} canjeada con éxito por ${canjeDocType} ${formattedDocNum}! El stock y kardex han sido actualizados.`);
    setTimeout(() => setCanjeSuccessMsg(''), 6000);
    setPoToCanjear(null);
    if (viewingPo && viewingPo.id === poToCanjear.id) {
      setViewingPo({
        ...viewingPo,
        status: 'recibida',
        convertedToInvoiceId: invoiceId,
        convertedInvoiceNumber: `${canjeDocType} ${formattedDocNum}`
      });
    }
  };

  // Filtrado de OC
  const filteredOrders = purchaseOrders.filter(po => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || po.status === filterStatus;
    const matchesSupplier = selectedSupplierFilter === 'all' || po.supplierId === selectedSupplierFilter;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  // Métricas
  const totalOrdersCount = purchaseOrders.length;
  const pendingOrdersCount = purchaseOrders.filter(po => po.status === 'enviada' || po.status === 'borrador').length;
  const committedAmount = purchaseOrders
    .filter(po => po.status === 'enviada' || po.status === 'borrador')
    .reduce((acc, curr) => acc + curr.total, 0);
  const receivedAmount = purchaseOrders
    .filter(po => po.status === 'recibida')
    .reduce((acc, curr) => acc + curr.total, 0);

  const statusConfig: Record<PurchaseOrderStatus, { label: string; badge: string; icon: React.ReactNode }> = {
    borrador: { label: 'Borrador', badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30', icon: <Clock className="w-3.5 h-3.5" /> },
    enviada: { label: 'Enviada / En Espera', badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30 font-bold', icon: <Send className="w-3.5 h-3.5" /> },
    recibida: { label: 'Recepcionada en Almacén', badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 font-black', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    cancelada: { label: 'Cancelada', badge: 'bg-rose-500/15 text-rose-500 border-rose-500/30', icon: <XCircle className="w-3.5 h-3.5" /> }
  };

  const handleCopyWhatsAppText = (po: PurchaseOrder) => {
    const text = `*ORDEN DE COMPRA: ${po.poNumber}*\n` +
      `*Cliente:* ${companyConfig.tradeName} (${companyConfig.businessName})\n` +
      `*RUC:* ${companyConfig.ruc}\n` +
      `*Proveedor:* ${po.supplierName}\n` +
      `*Fecha Entrega Requerida:* ${po.expectedDeliveryDate || 'Pronta'}\n\n` +
      `*DETALLE DE INSUMOS SOLICITADOS:*\n` +
      po.items.map(it => `- ${it.quantity} ${it.unit} de ${it.ingredientName} (S/ ${it.unitPrice.toFixed(2)}/${it.unit}) = S/ ${it.subtotal.toFixed(2)}`).join('\n') +
      `\n\n*TOTAL ESTIMADO:* S/ ${po.total.toFixed(2)}\n` +
      `*Lugar de entrega:* ${companyConfig.address}\n` +
      (po.notes ? `*Observaciones:* ${po.notes}` : '');

    navigator.clipboard.writeText(text);
    setCopySuccessNotice(true);
    setTimeout(() => setCopySuccessNotice(false), 3000);
  };

  const handlePrintPoPdfNewTab = (po: PurchaseOrder) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor habilite las ventanas emergentes (popups) para abrir el PDF de la Orden de Compra.');
      return;
    }

    const itemsRows = po.items.map((it, idx) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-family: monospace;">${it.ingredientCode}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: bold;">${it.ingredientName}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center; font-weight: bold;">${it.quantity} ${it.unit}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-family: monospace;">S/ ${it.unitPrice.toFixed(2)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-weight: bold; font-family: monospace;">S/ ${it.subtotal.toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Orden de Compra ${po.poNumber} - ${companyConfig.tradeName}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; margin: 0; padding: 25px; }
          .header { display: flex; justify-content: space-between; border-bottom: 3px solid #ea580c; padding-bottom: 16px; margin-bottom: 20px; }
          .company-title { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; }
          .company-subtitle { font-size: 12px; color: #475569; margin-top: 4px; line-height: 1.5; }
          .po-title { font-size: 22px; font-weight: 900; color: #ea580c; margin: 0; text-align: right; letter-spacing: 0.5px; }
          .po-meta { font-size: 12px; color: #334155; margin-top: 6px; text-align: right; line-height: 1.5; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; font-size: 12px; }
          .info-block strong.section-title { color: #ea580c; display: block; margin-bottom: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f1f5f9; padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #334155; font-weight: 800; border-bottom: 2px solid #cbd5e1; }
          .totals-table { margin-left: auto; width: 280px; font-size: 13px; border-collapse: collapse; margin-bottom: 25px; }
          .totals-table td { padding: 6px 10px; }
          .totals-table .total-row { border-top: 2px solid #0f172a; font-weight: 900; font-size: 16px; color: #ea580c; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 60px; text-align: center; }
          .signature-box { border-top: 1px dashed #64748b; padding-top: 8px; font-size: 12px; font-weight: bold; color: #475569; line-height: 1.4; }
          .instructions { background: #fff7ed; border-left: 4px solid #f97316; padding: 10px 14px; font-size: 11px; color: #7c2d12; margin-bottom: 20px; border-radius: 4px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="company-title">${companyConfig.tradeName}</h1>
            <div class="company-subtitle">
              <strong>${companyConfig.businessName}</strong> • RUC: <strong>${companyConfig.ruc}</strong><br>
              ${companyConfig.address}<br>
              Teléfono / WhatsApp: ${companyConfig.phone} • Email: ${companyConfig.email}
            </div>
          </div>
          <div>
            <h2 class="po-title">ORDEN DE COMPRA</h2>
            <div class="po-meta">
              <strong style="font-size: 15px; color: #0f172a;">${po.poNumber}</strong><br>
              Fecha de Emisión: ${po.issueDate}<br>
              Fecha Entrega: <strong>${po.expectedDeliveryDate || 'Inmediata'}</strong>
            </div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-block">
            <strong class="section-title">DATOS DEL PROVEEDOR</strong>
            <strong>Razón Social:</strong> ${po.supplierName}<br>
            <strong>RUC:</strong> ${po.supplierRuc || 'No especificado'}<br>
            <strong>Condición:</strong> Abastecimiento oficial para Fuente de Soda
          </div>
          <div class="info-block">
            <strong class="section-title">PUNTO DE ENTREGA Y FACTURACIÓN</strong>
            <strong>Lugar:</strong> ${companyConfig.address}<br>
            <strong>Facturar a:</strong> ${companyConfig.businessName}<br>
            <strong>RUC Facturación:</strong> ${companyConfig.ruc}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th style="width: 90px; text-align: left;">CÓDIGO</th>
              <th style="text-align: left;">DESCRIPCIÓN DEL INSUMO</th>
              <th style="width: 110px; text-align: center;">CANTIDAD</th>
              <th style="width: 110px; text-align: right;">PRECIO UNIT.</th>
              <th style="width: 120px; text-align: right;">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td style="color: #64748b;">Subtotal Insumos:</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold;">S/ ${po.subtotal.toFixed(2)}</td>
          </tr>
          ${po.taxAmount > 0 ? `
          <tr>
            <td style="color: #64748b;">IGV Estimado (18%):</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold;">S/ ${po.taxAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td>TOTAL ESTIMADO:</td>
            <td style="text-align: right; font-family: monospace;">S/ ${po.total.toFixed(2)}</td>
          </tr>
        </table>

        <div class="instructions">
          <strong>CONDICIONES GENERALES Y RECEPCIÓN:</strong><br>
          1. Toda entrega debe estar acompañada de la Factura o Guía de Remisión correspondiente.<br>
          2. Los insumos frescos (frutas y verduras) pasan por control de calidad y maduración al momento del pesaje.<br>
          3. Observaciones del pedido: <em>${po.notes || 'Ninguna observación especial.'}</em>
        </div>

        <div class="signatures">
          <div class="signature-box">
            <strong>${companyConfig.tradeName}</strong><br>
            Área de Logística y Compras
          </div>
          <div class="signature-box">
            <strong>${po.supplierName}</strong><br>
            Conformidad del Proveedor
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-bold">
              Módulo de Adquisiciones y Proveedores
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              {companyConfig.tradeName}
            </span>
          </div>
          <h2 className={`text-2xl font-black mt-1 flex items-center gap-2.5 ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            <FileText className="w-7 h-7 text-amber-500" />
            <span>Órdenes de Compra (OC)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Emita pedidos formales a proveedores, genere PDFs membretados, comparta por WhatsApp y canjéelos por Facturas con verificación de pesaje.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOpenNewPoModal}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva Orden de Compra</span>
          </button>
        </div>
      </div>

      {/* Notificación de Canje Exitoso */}
      {canjeSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{canjeSuccessMsg}</span>
          </div>
          <button onClick={() => setCanjeSuccessMsg('')} className="text-emerald-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-3xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Total Emitidas</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono text-slate-900 dark:text-white">{totalOrdersCount}</div>
          <span className="text-[10px] text-slate-500">Historial completo</span>
        </div>

        <div className={`p-4 rounded-3xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">En Espera / Tránsito</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono text-amber-400">{pendingOrdersCount}</div>
          <span className="text-[10px] text-slate-500">Por recepcionar</span>
        </div>

        <div className={`p-4 rounded-3xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Monto en Tránsito</span>
            <DollarSign className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono text-orange-400">S/ {committedAmount.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500">Comprometido a proveedores</span>
        </div>

        <div className={`p-4 rounded-3xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Recepcionado Total</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono text-emerald-500">S/ {receivedAmount.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500">Canjeado a compras FIFO</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className={`p-3.5 rounded-3xl border flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Buscar por N° de OC o proveedor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full py-1.5 px-2 rounded-xl text-xs font-semibold focus:outline-none ${
              isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-white'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold border focus:outline-none ${
              isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-white'
            }`}
          >
            <option value="all">Todos los Estados</option>
            <option value="borrador">Borradores</option>
            <option value="enviada">Enviadas</option>
            <option value="recibida">Recibidas / Canjeadas</option>
            <option value="cancelada">Canceladas</option>
          </select>

          <select
            value={selectedSupplierFilter}
            onChange={e => setSelectedSupplierFilter(e.target.value)}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold border focus:outline-none ${
              isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-white'
            }`}
          >
            <option value="all">Todos los Proveedores</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Órdenes de Compra */}
      <div className={`rounded-3xl border overflow-hidden shadow-sm ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                isLight ? 'bg-slate-100/80 border-slate-200 text-slate-600' : 'bg-slate-950/80 border-slate-800 text-slate-400'
              }`}>
                <th className="py-3 px-4">N° de OC</th>
                <th className="py-3 px-4">Proveedor</th>
                <th className="py-3 px-3">Fecha Emisión</th>
                <th className="py-3 px-3">Entrega Estimada</th>
                <th className="py-3 px-3 text-center">Ítems</th>
                <th className="py-3 px-4 text-right">Total S/</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800'}`}>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron órdenes de compra registradas.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(po => {
                  const statusInfo = statusConfig[po.status];
                  return (
                    <tr
                      key={po.id}
                      className={`transition-colors ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-black text-amber-500 whitespace-nowrap">
                        {po.poNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{po.supplierName}</div>
                        {po.supplierRuc && (
                          <span className="text-[10px] font-mono text-slate-400">RUC: {po.supplierRuc}</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {po.issueDate}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {po.expectedDeliveryDate || 'N/A'}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold">
                        {po.items.length}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                        S/ {po.total.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.badge}`}>
                          {statusInfo.icon}
                          <span>{statusInfo.label}</span>
                        </span>
                        {po.status === 'recibida' && po.convertedInvoiceNumber && (
                          <div className="text-[9px] font-mono text-emerald-400 font-bold mt-0.5">
                            {po.convertedInvoiceNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingPo(po)}
                            title="Ver detalle de OC"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handlePrintPoPdfNewTab(po)}
                            title="Imprimir PDF formal en nueva pestaña"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-all"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {po.status !== 'recibida' && po.status !== 'cancelada' && (
                            <button
                              onClick={() => handleOpenCanjeModal(po)}
                              title="Recepcionar en almacén y canjear por Compra/Factura real"
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] shadow-sm flex items-center gap-1 active:scale-95 transition-all"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Recepcionar</span>
                            </button>
                          )}

                          {po.status === 'borrador' && (
                            <button
                              onClick={() => updatePurchaseOrderStatus(po.id, 'enviada')}
                              title="Marcar como Enviada al proveedor"
                              className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Enviar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL DE NUEVA ORDEN DE COMPRA (OC) ================= */}
      {showNewPoModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Emitir Orden de Compra: {nextPoNumber}</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Emisor: {companyConfig.tradeName} (RUC {companyConfig.ruc})
                </span>
              </div>
              <button
                onClick={() => setShowNewPoModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Cabecera de la OC */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Proveedor Destino</label>
                <select
                  value={newPoSupplierId}
                  onChange={e => setNewPoSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Fecha de Emisión</label>
                <input
                  type="date"
                  required
                  value={newPoIssueDate}
                  onChange={e => setNewPoIssueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-400 mb-1">Fecha de Entrega Requerida</label>
                <input
                  type="date"
                  required
                  value={newPoDeliveryDate}
                  onChange={e => setNewPoDeliveryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/50 text-amber-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Selector de Insumos para la OC */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
              <label className="block text-xs font-bold text-amber-300">
                Añadir Insumos Solicitados (Orden Alfabético A-Z)
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={tempIngId}
                  onChange={e => handleSelectTempIngredient(e.target.value)}
                  className="flex-1 min-w-0 bg-slate-900 border border-slate-700 text-white rounded-xl p-2 text-xs font-semibold focus:outline-none"
                >
                  {sortedIngredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit}) - Ref: S/ {ing.costPerUnit.toFixed(2)}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <div className="w-24">
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      placeholder="Cant."
                      value={tempQty}
                      onChange={e => setTempQty(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 text-xs text-center font-bold focus:outline-none"
                    />
                  </div>

                  <div className="w-28 flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2">
                    <span className="text-[10px] text-slate-400 mr-1">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Precio"
                      value={tempPrice}
                      onChange={e => setTempPrice(e.target.value)}
                      className="w-full bg-transparent text-white p-2 text-xs font-bold focus:outline-none text-right font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItemToPo}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tabla de ítems en el borrador de OC */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Insumo</th>
                    <th className="py-2.5 px-3 text-center">Cant.</th>
                    <th className="py-2.5 px-3 text-right">Precio Ref.</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                    <th className="py-2.5 px-2 text-center">Quitar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {newPoItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                        Aún no se han agregado insumos a esta orden de compra.
                      </td>
                    </tr>
                  ) : (
                    newPoItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-sans font-bold text-white">
                          {item.ingredientName}
                          <span className="block text-[10px] font-mono text-slate-400">Cód: {item.ingredientCode}</span>
                        </td>
                        <td className="py-2 px-3 text-center font-bold">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          S/ {item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-black text-amber-400">
                          S/ {item.subtotal.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromPo(idx)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Observaciones y Totales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Instrucciones u Observaciones</label>
                <textarea
                  rows={2}
                  value={newPoNotes}
                  onChange={e => setNewPoNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none"
                  placeholder="Detalles sobre entrega, horario, requisitos de empaque..."
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Insumos:</span>
                  <span className="font-mono font-bold text-white">S/ {poSubtotal.toFixed(2)}</span>
                </div>
                {poTaxAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>IGV Estimado (18%):</span>
                    <span className="font-mono font-bold text-white">S/ {poTaxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-slate-800">
                  <span>Total Estimado:</span>
                  <span className="font-mono text-amber-400 text-base">S/ {poTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Botones de acción del Modal */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewPoModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={newPoItems.length === 0}
                onClick={() => handleSavePurchaseOrder('borrador')}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-bold"
              >
                Guardar Borrador
              </button>
              <button
                type="button"
                disabled={newPoItems.length === 0}
                onClick={() => handleSavePurchaseOrder('enviada')}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Emitir y Marcar Enviada</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE CANJE DE OC POR COMPRA REAL ================= */}
      {poToCanjear && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 max-w-4xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Recepción Física y Canje de Orden de Compra</span>
                </span>
                <h3 className="font-black text-lg text-white mt-0.5">
                  Canjear {poToCanjear.poNumber} por Factura / Boleta
                </h3>
                <span className="text-xs text-slate-400">
                  Proveedor: <b className="text-slate-200">{poToCanjear.supplierName}</b>
                  {poToCanjear.supplierRuc ? ` • RUC: ${poToCanjear.supplierRuc}` : ''}
                </span>
              </div>
              <button
                onClick={() => setPoToCanjear(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Alerta explicativa */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <b className="font-bold text-white">Recepción y comprobante del proveedor:</b> Ingrese la Serie y Número de la Factura o Boleta que entregó el transportista. Corrija las cantidades si llegaron diferencias de pesaje. Al confirmar, figurará en el <b>Historial de Compras</b> y sumará el stock a los <b>lotes FIFO</b> del almacén.
              </div>
            </div>

            {/* Datos del Comprobante */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                DATOS DEL COMPROBANTE DE COMPRA (FÍSICO / ELECTRÓNICO)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tipo de Comprobante</label>
                  <select
                    value={canjeDocType}
                    onChange={e => {
                      const dt = e.target.value as 'Factura' | 'Boleta';
                      setCanjeDocType(dt);
                      if (dt === 'Boleta' && canjeSeries === 'F001') setCanjeSeries('B001');
                      if (dt === 'Factura' && canjeSeries === 'B001') setCanjeSeries('F001');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Factura">Factura</option>
                    <option value="Boleta">Boleta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Serie (Ej. F001)</label>
                  <input
                    type="text"
                    required
                    value={canjeSeries}
                    onChange={e => setCanjeSeries(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="F001"
                  />
                </div>

                <div>
                  <label className="block text-emerald-400 font-bold mb-1">Número de Comprobante *</label>
                  <input
                    type="text"
                    required
                    value={canjeNumber}
                    onChange={e => setCanjeNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-500 text-emerald-300 rounded-xl p-2.5 font-mono font-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: 3777"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fecha Emisión Comprobante</label>
                  <input
                    type="date"
                    required
                    value={canjeDate}
                    onChange={e => setCanjeDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Condición de Pago</label>
                  <select
                    value={canjePaymentType}
                    onChange={e => setCanjePaymentType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Contado">Contado</option>
                    <option value="Al crédito (1 cuotas pend.)">Al crédito (1 cuota)</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-slate-300 font-bold mb-1">Almacén Destino de Stock</label>
                  <input
                    type="text"
                    value={canjeWarehouse}
                    onChange={e => setCanjeWarehouse(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl p-2.5 font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Verificación de Insumos / Cantidades reales */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  VERIFICACIÓN DE INSUMOS RECIBIDOS (EDITABLE SEGÚN PESAJE REAL)
                </span>
                <span className="text-[10px] text-amber-400 font-semibold">
                  * Si llegaron gramos o unidades de más/menos, corríjalos en "Cant. Recibida Real"
                </span>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Insumo</th>
                      <th className="py-2.5 px-3 text-center">Cant. Pedida (OC)</th>
                      <th className="py-2.5 px-3 text-center text-emerald-400">Cant. Recibida Real</th>
                      <th className="py-2.5 px-3 text-right">Precio Unit. S/</th>
                      <th className="py-2.5 px-3 text-center">IGV 18%</th>
                      <th className="py-2.5 px-3 text-right">Subtotal S/</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {canjeItems.map((item, idx) => (
                      <tr key={item.ingredientId} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-white">{item.name}</div>
                          <span className="text-[10px] font-mono text-slate-500">Cód: {item.code}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">
                          {item.orderedQty.toFixed(3)} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              step="0.001"
                              min="0"
                              value={item.receivedQty}
                              onChange={e => handleUpdateCanjeItem(idx, 'receivedQty', e.target.value)}
                              className="w-24 bg-slate-950 border border-emerald-500/60 rounded-lg py-1 px-2 text-center font-mono font-black text-emerald-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                            <span className="text-[11px] font-bold text-slate-400">{item.unit}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1 justify-end">
                            <span className="text-[10px] text-slate-500">S/</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={e => handleUpdateCanjeItem(idx, 'unitPrice', e.target.value)}
                              className="w-20 bg-slate-950 border border-slate-700 rounded-lg py-1 px-2 text-right font-mono font-bold text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.isTaxAffected}
                            onChange={e => handleUpdateCanjeItem(idx, 'isTaxAffected', e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 border-slate-700 bg-slate-900 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-400">
                          S/ {item.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumen de totales */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400">
                <div>Documento vinculado: <b className="text-amber-400 font-mono">{poToCanjear.poNumber}</b></div>
                <div>Emisor: {companyConfig.tradeName}</div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right text-xs">
                  <div className="text-slate-400">Subtotal: <b className="font-mono text-white">S/ {canjeSubtotal.toFixed(2)}</b></div>
                  <div className="text-slate-400">IGV (18%): <b className="font-mono text-white">S/ {canjeTaxes.toFixed(2)}</b></div>
                  <div className="text-sm font-black text-white mt-0.5">
                    Total Factura: <span className="font-mono text-emerald-400 text-base">S/ {canjeTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmCanje}
                  className="py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CONFIRMAR RECEPCIÓN Y CANJEAR POR COMPRA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL VISTA DETALLADA DE OC ================= */}
      {viewingPo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Header del Modal Vista Detalle */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-amber-600">
                  {companyConfig.tradeName} • ORDEN DE COMPRA FORMAL
                </span>
                <h3 className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {viewingPo.poNumber}
                </h3>
                <span className="text-xs text-slate-500">
                  RUC Emisor: {companyConfig.ruc} • {companyConfig.address}
                </span>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[viewingPo.status].badge}`}>
                  {statusConfig[viewingPo.status].label}
                </span>
                <div className="text-xs text-slate-500 mt-2 font-mono">
                  Fecha Emisión: {viewingPo.issueDate}<br />
                  Entrega: {viewingPo.expectedDeliveryDate || 'Inmediata'}
                </div>
              </div>
            </div>

            {/* Aviso si la OC ya fue canjeada */}
            {viewingPo.status === 'recibida' && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <b>OC Canjeada:</b> Esta orden fue recepcionada con comprobante <b>{viewingPo.convertedInvoiceNumber || 'Factura'}</b>. Los insumos se encuentran en el kardex y en el Historial de Compras.
                  </span>
                </div>
              </div>
            )}

            {/* Datos del Proveedor */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">PROVEEDOR RECEPTOR:</span>
              <div className="font-black text-sm text-slate-800">{viewingPo.supplierName}</div>
              {viewingPo.supplierRuc && (
                <div className="font-mono text-slate-600">RUC: {viewingPo.supplierRuc}</div>
              )}
            </div>

            {/* Tabla Formal de Ítems */}
            <div className="border rounded-2xl overflow-hidden divide-y divide-slate-200 text-xs">
              <div className="bg-slate-100 px-3 py-2 font-black grid grid-cols-12 text-[11px] uppercase text-slate-700">
                <span className="col-span-6">Insumo Solicitado</span>
                <span className="col-span-2 text-center">Cant.</span>
                <span className="col-span-2 text-right">Precio Unit.</span>
                <span className="col-span-2 text-right">Subtotal</span>
              </div>

              {viewingPo.items.map((item, i) => (
                <div key={i} className="px-3 py-2.5 grid grid-cols-12 items-center">
                  <div className="col-span-6">
                    <div className="font-bold text-slate-900">{item.ingredientName}</div>
                    <span className="text-[10px] font-mono text-slate-500">Cód: {item.ingredientCode}</span>
                  </div>
                  <div className="col-span-2 text-center font-bold font-mono">
                    {item.quantity} {item.unit}
                  </div>
                  <div className="col-span-2 text-right font-mono text-slate-600">
                    S/ {item.unitPrice.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-black font-mono text-slate-900">
                    S/ {item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totales y Notas */}
            <div className="flex justify-between items-start text-xs pt-2">
              <div className="max-w-xs text-slate-600 italic">
                {viewingPo.notes ? `Nota: "${viewingPo.notes}"` : 'Sin observaciones adicionales.'}
              </div>

              <div className="w-48 space-y-1 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">S/ {viewingPo.subtotal.toFixed(2)}</span>
                </div>
                {viewingPo.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>IGV (18%):</span>
                    <span className="font-mono font-bold">S/ {viewingPo.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-300">
                  <span>Total:</span>
                  <span className="font-mono text-amber-600">S/ {viewingPo.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {copySuccessNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold text-center">
                ✓ Mensaje con formato formal copiado al portapapeles para WhatsApp.
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-2 pt-3 border-t border-slate-200 flex-wrap">
              <button
                type="button"
                onClick={() => setViewingPo(null)}
                className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => handleCopyWhatsAppText(viewingPo)}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar para WhatsApp Proveedor</span>
              </button>

              <button
                type="button"
                onClick={() => handlePrintPoPdfNewTab(viewingPo)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 ml-auto shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Descargar PDF</span>
              </button>

              {viewingPo.status !== 'recibida' && viewingPo.status !== 'cancelada' && (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenCanjeModal(viewingPo);
                  }}
                  className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow active:scale-95 transition-all"
                >
                  <Truck className="w-4 h-4" />
                  <span>Recepcionar y Canjear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
