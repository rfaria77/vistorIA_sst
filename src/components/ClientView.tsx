import React, { useState, useMemo } from 'react';
import { Restaurant, Product, CategoryType, CartItem, Order } from '../types';
import { ItemModal } from './ItemModal';
import { CheckoutModal } from './CheckoutModal';
import { OrderTrackerModal } from './OrderTrackerModal';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight, 
  Store, 
  UtensilsCrossed,
  BellRing,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ClientViewProps {
  restaurants: Restaurant[];
  products: Product[];
  orders: Order[];
  onSuccessOrder: (order: Order) => void;
}

export function ClientView({ restaurants, products, orders, onSuccessOrder }: ClientViewProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Selected product for custom note modal
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  // Track active order modal
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  // Filter products for active restaurant
  const restaurantProducts = useMemo(() => {
    if (!selectedRestaurant) return [];
    return products.filter((p) => {
      if (p.restaurantId !== selectedRestaurant.id) return false;
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedRestaurant, products, selectedCategory, searchTerm]);

  // Cart calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = selectedRestaurant ? selectedRestaurant.deliveryFee : 0;
  const totalCartItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const handleAddToCart = (product: Product, quantity: number, observations: string) => {
    const cartItemId = `${product.id}-${Date.now()}`;
    setCart((prev) => [...prev, { cartItemId, product, quantity, observations }]);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQ = item.quantity + delta;
          return newQ > 0 ? { ...item, quantity: newQ } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleSuccessfulOrder = (newOrder: Order) => {
    onSuccessOrder(newOrder);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setTrackedOrder(newOrder);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* City Header / Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs">
              <UtensilsCrossed className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">SaborLocal</h1>
                <span className="bg-emerald-500/30 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                  Cidade Pequena • Sem Taxas
                </span>
              </div>
              <p className="text-emerald-200 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cardápio digital unificado do comércio local</span>
              </p>
            </div>
          </div>

          {/* Active Orders Quick Access Button */}
          {orders.length > 0 && (
            <button
              onClick={() => setTrackedOrder(orders[0])}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md transition-all flex items-center gap-2 border border-emerald-500 animate-pulse"
            >
              <BellRing className="w-4 h-4" />
              <span>Ver Último Pedido (#{orders[0].id})</span>
            </button>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedRestaurant ? (
          /* --- LISTAGEM DE ESTABELECIMENTOS --- */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Restaurantes e Lanchonetes</h2>
                <p className="text-sm text-gray-500">Escolha um estabelecimento para ver o cardápio completo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {restaurants.map((rest) => (
                <div
                  key={rest.id}
                  onClick={() => setSelectedRestaurant(rest)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/80 cursor-pointer group flex flex-col"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img 
                      src={rest.coverImage} 
                      alt={rest.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2">
                      <img 
                        src={rest.logo} 
                        alt="" 
                        className="w-6 h-6 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-xs font-bold text-gray-800">{rest.category}</span>
                    </div>

                    <div className="absolute top-4 right-4">
                      {rest.isOpen ? (
                        <span className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-xl font-bold shadow-md flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <span>Aberto Agora</span>
                        </span>
                      ) : (
                        <span className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-xl font-bold shadow-md">
                          Fechado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {rest.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{rest.address}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-600">
                      <div className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{rest.rating}</span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{rest.deliveryTime}</span>
                      </div>

                      <div className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        Entrega: {rest.deliveryFee === 0 ? 'Grátis' : `R$ ${rest.deliveryFee.toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* --- VISÃO DO CARDÁPIO DO RESTAURANTE SELECIONADO --- */
          <div className="space-y-6">
            {/* Store Banner Header */}
            <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-40 sm:h-52 w-full relative">
                <img 
                  src={selectedRestaurant.coverImage} 
                  alt="" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-800 text-xs font-bold px-3 py-2 rounded-xl shadow-md transition-all flex items-center gap-1"
                >
                  ← Voltar aos Estabelecimentos
                </button>
              </div>

              <div className="px-6 pb-6 pt-0 relative -mt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div className="flex items-end gap-4">
                  <img 
                    src={selectedRestaurant.logo} 
                    alt="" 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-white pb-1">
                    <h2 className="text-xl sm:text-2xl font-black">{selectedRestaurant.name}</h2>
                    <p className="text-xs sm:text-sm text-gray-200 flex items-center gap-2 mt-0.5">
                      <span>{selectedRestaurant.category}</span>
                      <span>•</span>
                      <span>Pedido mín: {selectedRestaurant.minOrder.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700">
                  <span className="flex items-center gap-1 text-amber-600"><Star className="w-4 h-4 fill-amber-500" /> {selectedRestaurant.rating}</span>
                  <span>•</span>
                  <span>{selectedRestaurant.deliveryTime}</span>
                  <span>•</span>
                  <span className="text-emerald-700">Taxa: R$ {selectedRestaurant.deliveryFee.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              {/* Category buttons */}
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                {(['Todos', 'Lanches', 'Pizzas', 'Marmitex', 'Açaí', 'Bebidas', 'Sobremesas'] as CategoryType[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar no cardápio..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-xs focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurantProducts.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-gray-200">
                  <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold text-base">Nenhum item encontrado</p>
                  <p className="text-gray-400 text-xs mt-1">Tente buscar por outro termo ou categoria.</p>
                </div>
              ) : (
                restaurantProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs hover:shadow-md transition-all flex gap-4 items-center justify-between group"
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-base group-hover:text-emerald-600 transition-colors">
                          {prod.name}
                        </h4>
                        {prod.popular && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                      <p className="text-sm font-black text-emerald-600 pt-1">
                        {prod.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>

                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-xs">
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => setModalProduct(prod)}
                        className="absolute bottom-2 right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl shadow-md transition-all flex items-center gap-1 text-xs font-bold"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Cart Floating Bar (when items in cart) */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 text-white p-4 shadow-2xl animate-slide-up">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 text-white font-bold w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-md">
                {totalCartItems}
              </div>
              <div>
                <div className="text-xs text-gray-400 font-semibold">Sua Sacola</div>
                <div className="text-sm font-bold">
                  {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} <span className="text-xs text-gray-400 font-normal">+ taxa</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm"
            >
              <span>Ver Sacola & Finalizar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer / Modal */}
      {isCartOpen && selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-left">
            {/* Header */}
            <div className="bg-emerald-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-6 h-6" />
                <div>
                  <h3 className="font-bold text-base">Sua Sacola</h3>
                  <p className="text-xs text-emerald-100">{selectedRestaurant.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white p-2 rounded-full transition-all"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-bold">Sua sacola está vazia</p>
                  <p className="text-xs text-gray-400 mt-1">Adicione itens deliciosos do cardápio!</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{item.product.name}</h4>
                        <p className="text-xs font-semibold text-emerald-600">
                          {item.product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} un.
                        </p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.observations && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-2 rounded-lg">
                        <strong>Obs:</strong> {item.observations}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2.5 py-1">
                        <button 
                          onClick={() => updateCartQuantity(item.cartItemId, -1)}
                          className="text-gray-600 hover:text-emerald-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.cartItemId, 1)}
                          className="text-gray-600 hover:text-emerald-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-gray-900">
                        {(item.product.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 bg-gray-50 border-t border-gray-200 space-y-3">
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Entrega</span>
                    <span>{deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <hr className="border-gray-200 pt-1" />
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-emerald-600">
                      {(subtotal + deliveryFee).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span>Ir para o Checkout</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Item Modal for Customization */}
      {modalProduct && (
        <ItemModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && selectedRestaurant && (
        <CheckoutModal
          restaurant={selectedRestaurant}
          cart={cart}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccessOrder={handleSuccessfulOrder}
        />
      )}

      {/* Order Tracker Modal */}
      {trackedOrder && (
        <OrderTrackerModal
          order={trackedOrder}
          onClose={() => setTrackedOrder(null)}
        />
      )}
    </div>
  );
}
