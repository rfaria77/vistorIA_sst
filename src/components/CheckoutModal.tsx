import React, { useState } from 'react';
import { CartItem, Restaurant, Order } from '../types';
import { X, MapPin, Phone, User, CreditCard, Banknote, QrCode, CheckCircle2 } from 'lucide-react';

interface CheckoutModalProps {
  restaurant: Restaurant;
  cart: CartItem[];
  subtotal: number;
  deliveryFee: number;
  onClose: () => void;
  onSuccessOrder: (order: Order) => void;
}

export function CheckoutModal({
  restaurant,
  cart,
  subtotal,
  deliveryFee,
  onClose,
  onSuccessOrder,
}: CheckoutModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'dinheiro'>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !street.trim() || !number.trim() || !neighborhood.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios de identificação e endereço.');
      return;
    }

    if (paymentMethod === 'dinheiro' && changeFor) {
      const changeVal = parseFloat(changeFor.replace(',', '.'));
      if (isNaN(changeVal) || changeVal < total) {
        setError('O valor do troco deve ser maior ou igual ao total do pedido.');
        return;
      }
    }

    setIsSubmitting(true);
    setError('');

    setTimeout(() => {
      const newOrder: Order = {
        id: 'PED-' + Math.floor(100000 + Math.random() * 900000),
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        items: [...cart],
        subtotal,
        deliveryFee,
        total,
        customerName: name.trim(),
        phone: phone.trim(),
        address: {
          street: street.trim(),
          number: number.trim(),
          neighborhood: neighborhood.trim(),
          complement: complement.trim(),
        },
        paymentMethod,
        changeFor: paymentMethod === 'dinheiro' && changeFor ? parseFloat(changeFor.replace(',', '.')) : undefined,
        status: 'pendente',
        createdAt: new Date().toISOString(),
      };

      onSuccessOrder(newOrder);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Finalizar Pedido</h2>
            <p className="text-emerald-100 text-xs mt-0.5">{restaurant.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="bg-emerald-700 hover:bg-emerald-800 text-white p-2 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Dados Pessoais */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>1. Seus Dados</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nome Completo *</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria da Silva"
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Telefone / WhatsApp *</label>
              <input 
                type="text" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(35) 99999-9999"
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Endereço de Entrega */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>2. Endereço de Entrega</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rua / Logradouro *</label>
                <input 
                  type="text" 
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ex: Rua Coronel João"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Número *</label>
                <input 
                  type="text" 
                  required
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Ex: 450"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bairro *</label>
                <input 
                  type="text" 
                  required
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Ex: Centro / Vila Nova"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Complemento / Referência</label>
                <input 
                  type="text" 
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Ex: Próximo à praça / Apto 2"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Forma de Pagamento */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>3. Forma de Pagamento</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'pix' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs' 
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1.5 text-emerald-600" />
                <span>Pix na Entrega</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cartao')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'cartao' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs' 
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1.5 text-emerald-600" />
                <span>Cartão (Maquininha)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('dinheiro')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  paymentMethod === 'dinheiro' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs' 
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1.5 text-emerald-600" />
                <span>Dinheiro</span>
              </button>
            </div>

            {paymentMethod === 'dinheiro' && (
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1.5 animate-fade-in">
                <label className="block text-xs font-semibold text-gray-700">
                  Precisa de troco para quanto? (Deixe em branco se não precisar)
                </label>
                <input 
                  type="text"
                  value={changeFor}
                  onChange={(e) => setChangeFor(e.target.value)}
                  placeholder="Ex: 100,00"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none"
                />
              </div>
            )}
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal dos itens</span>
              <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxa de Entrega</span>
              <span>{deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <hr className="border-gray-200 pt-1" />
            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Total a Pagar</span>
              <span className="text-emerald-600">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Processando pedido...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Enviar Pedido agora ({total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
