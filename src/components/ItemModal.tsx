import React, { useState } from 'react';
import { Product } from '../types';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';

interface ItemModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, observations: string) => void;
}

export function ItemModal({ product, onClose, onAddToCart }: ItemModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');

  const handleAdd = () => {
    onAddToCart(product, quantity, observations);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Image */}
        <div className="relative h-56 sm:h-64 w-full bg-gray-100">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-xs text-white px-3 py-1 rounded-lg text-sm font-semibold">
            {product.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">
            {product.description}
          </p>

          <hr className="border-gray-100 my-2" />

          {/* Observations / Customization */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Observações do pedido (Opcional)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Ex: "Sem cebola", "Ponto da carne ao ponto", "Maionese à parte", etc.
            </p>
            <textarea
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Digite aqui alguma restrição ou preferência..."
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-3 py-2 shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-gray-600 hover:text-emerald-600 p-1 disabled:opacity-30"
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-gray-800 w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="text-gray-600 hover:text-emerald-600 p-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Adicionar • {(product.price * quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
