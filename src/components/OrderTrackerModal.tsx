import React from 'react';
import { Order } from '../types';
import { CheckCircle2, Clock, ChefHat, Bike, XCircle, X, ExternalLink } from 'lucide-react';

interface OrderTrackerModalProps {
  order: Order;
  onClose: () => void;
}

export function OrderTrackerModal({ order, onClose }: OrderTrackerModalProps) {
  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pendente':
        return {
          title: 'Pedido Enviado & Aguardando Confirmação',
          desc: 'O restaurante recebeu seu pedido e já vai aceitar.',
          step: 1,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
          icon: Clock
        };
      case 'preparando':
        return {
          title: 'Pedido em Preparo na Cozinha',
          desc: 'Sua comida está sendo preparada com capricho e ingredientes frescos!',
          step: 2,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: ChefHat
        };
      case 'entrega':
        return {
          title: 'Saiu para Entrega!',
          desc: 'O entregador já está a caminho do seu endereço.',
          step: 3,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          icon: Bike
        };
      case 'concluido':
        return {
          title: 'Pedido Entregue com Sucesso!',
          desc: 'Bom apetite! Obrigado por comprar pelo SaborLocal.',
          step: 4,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          icon: CheckCircle2
        };
      case 'recusado':
        return {
          title: 'Pedido Recusado pelo Estabelecimento',
          desc: 'Infelizmente o restaurante não pôde atender seu pedido neste momento.',
          step: 0,
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: XCircle
        };
    }
  };

  const info = getStatusInfo(order.status);
  const IconComponent = info.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gray-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Acompanhamento em Tempo Real</div>
            <h2 className="text-lg font-bold">Pedido #{order.id}</h2>
          </div>
          <button 
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Alert Card */}
          <div className={`p-4 rounded-2xl border flex items-start gap-4 ${info.color}`}>
            <div className="p-3 bg-white rounded-xl shadow-xs">
              <IconComponent className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-base">{info.title}</h3>
              <p className="text-xs mt-1 opacity-90 leading-relaxed">{info.desc}</p>
            </div>
          </div>

          {/* Progress Bar steps */}
          {order.status !== 'recusado' && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase">Progresso do Pedido</div>
              <div className="grid grid-cols-3 gap-2">
                <div className={`h-2 rounded-full ${info.step >= 1 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                <div className={`h-2 rounded-full ${info.step >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                <div className={`h-2 rounded-full ${info.step >= 3 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                <span>1. Pendente</span>
                <span>2. Em Preparo</span>
                <span>3. Entregando</span>
              </div>
            </div>
          )}

          {/* Order Details Summary */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 text-sm">
            <div className="flex justify-between font-semibold text-gray-800 border-b border-gray-200 pb-2">
              <span>{order.restaurantName}</span>
              <span className="text-emerald-600">
                {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase">Itens do Pedido:</div>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-gray-700 text-xs">
                  <div>
                    <span className="font-bold">{item.quantity}x</span> {item.product.name}
                    {item.observations && (
                      <div className="text-gray-500 italic mt-0.5">Obs: {item.observations}</div>
                    )}
                  </div>
                  <span>{(item.product.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              ))}
            </div>

            <hr className="border-gray-200" />

            <div className="text-xs text-gray-600 space-y-1">
              <div><strong className="text-gray-800">Endereço:</strong> {order.address.street}, {order.address.number} - {order.address.neighborhood} {order.address.complement ? `(${order.address.complement})` : ''}</div>
              <div><strong className="text-gray-800">Pagamento:</strong> {order.paymentMethod.toUpperCase()} {order.paymentMethod === 'dinheiro' && order.changeFor ? `(Troco p/ R$ ${order.changeFor.toFixed(2)})` : ''}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <a
            href={`https://wa.me/5535999999999?text=Olá,%20gostaria%20de%20saber%20sobre%20o%20pedido%20%23${order.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1.5"
          >
            <span>Falar com o Estabelecimento no WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
}
