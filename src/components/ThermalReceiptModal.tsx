import React from 'react';
import { Order, Restaurant } from '../types';
import { Printer, X } from 'lucide-react';

interface ThermalReceiptModalProps {
  order: Order;
  restaurant: Restaurant;
  onClose: () => void;
}

export function ThermalReceiptModal({ order, restaurant, onClose }: ThermalReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Comanda Térmica (80mm)</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-gray-900 space-y-3 bg-gray-50 flex-1">
          <div className="bg-white p-4 rounded-xl border border-dashed border-gray-300 shadow-xs space-y-3">
            <div className="text-center space-y-0.5">
              <h4 className="font-bold text-sm">{restaurant.name}</h4>
              <p className="text-[10px] text-gray-500">{restaurant.address}</p>
              <p className="text-[10px] text-gray-500">Tel: {restaurant.phone}</p>
            </div>

            <hr className="border-dashed border-gray-300" />

            <div className="space-y-1">
              <div><strong>PEDIDO:</strong> #{order.id}</div>
              <div><strong>DATA:</strong> {new Date(order.createdAt).toLocaleString('pt-BR')}</div>
              <div><strong>CLIENTE:</strong> {order.customerName}</div>
              <div><strong>TELEFONE:</strong> {order.phone}</div>
            </div>

            <hr className="border-dashed border-gray-300" />

            <div className="space-y-1">
              <div><strong>ENDEREÇO DE ENTREGA:</strong></div>
              <div>{order.address.street}, {order.address.number}</div>
              <div>Bairro: {order.address.neighborhood}</div>
              {order.address.complement && <div>Obs: {order.address.complement}</div>}
            </div>

            <hr className="border-dashed border-gray-300" />

            <div className="space-y-2">
              <div className="font-bold">ITENS DO PEDIDO:</div>
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>{item.quantity}x {item.product.name}</span>
                    <span>{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.observations && (
                    <div className="text-[11px] text-gray-600 italic pl-3">
                      - Obs: {item.observations}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <hr className="border-dashed border-gray-300" />

            <div className="space-y-1 text-right">
              <div>Subtotal: R$ {order.subtotal.toFixed(2)}</div>
              <div>Taxa Entrega: R$ {order.deliveryFee.toFixed(2)}</div>
              <div className="text-sm font-bold pt-1">TOTAL: R$ {order.total.toFixed(2)}</div>
            </div>

            <hr className="border-dashed border-gray-300" />

            <div className="space-y-0.5 text-center text-[11px]">
              <div><strong>PAGAMENTO:</strong> {order.paymentMethod.toUpperCase()}</div>
              {order.paymentMethod === 'dinheiro' && order.changeFor && (
                <div>Troco para: R$ {order.changeFor.toFixed(2)}</div>
              )}
            </div>

            <div className="text-center text-[10px] text-gray-400 pt-2">
              === SaborLocal • Gestão de Entregas ===
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-200 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comanda</span>
          </button>
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
