import React, { useState, useMemo } from 'react';
import { Restaurant, Order, Product, OrderStatus } from '../types';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { playDingDongSound } from '../utils/audioAlert';
import { 
  Store, 
  Volume2, 
  VolumeX, 
  Printer, 
  ChefHat, 
  Bike, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Phone, 
  MapPin, 
  DollarSign, 
  UtensilsCrossed, 
  Sliders, 
  ChevronRight, 
  Plus, 
  Edit3,
  TrendingUp,
  PackageCheck
} from 'lucide-react';

interface RestaurantViewProps {
  restaurants: Restaurant[];
  orders: Order[];
  products: Product[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateProduct: (updatedProduct: Product) => void;
}

export function RestaurantView({
  restaurants,
  orders,
  products,
  onUpdateOrderStatus,
  onUpdateProduct,
}: RestaurantViewProps) {
  const [activeRestaurantId, setActiveRestaurantId] = useState<string>(restaurants[0]?.id || 'rest-1');
  const [activeTab, setActiveTab] = useState<'kanban' | 'cardapio'>('kanban');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const currentRestaurant = useMemo(() => {
    return restaurants.find((r) => r.id === activeRestaurantId) || restaurants[0];
  }, [restaurants, activeRestaurantId]);

  // Filter orders for active restaurant
  const restaurantOrders = useMemo(() => {
    return orders.filter((o) => o.restaurantId === currentRestaurant.id);
  }, [orders, currentRestaurant]);

  // Filter products for active restaurant
  const restaurantProducts = useMemo(() => {
    return products.filter((p) => p.restaurantId === currentRestaurant.id);
  }, [products, currentRestaurant]);

  // Stats
  const stats = useMemo(() => {
    const novos = restaurantOrders.filter(o => o.status === 'pendente').length;
    const preparando = restaurantOrders.filter(o => o.status === 'preparando').length;
    const entrega = restaurantOrders.filter(o => o.status === 'entrega').length;
    const concluido = restaurantOrders.filter(o => o.status === 'concluido').length;
    const faturamento = restaurantOrders
      .filter(o => o.status === 'concluido')
      .reduce((acc, o) => acc + o.total, 0);

    return { novos, preparando, entrega, concluido, faturamento };
  }, [restaurantOrders]);

  const handleEnableAudio = () => {
    setAudioEnabled(true);
    playDingDongSound();
  };

  const testAudio = () => {
    playDingDongSound();
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Top Bar Restaurant Switcher & Audio Toggle */}
      <div className="bg-gray-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-emerald-600 p-2.5 rounded-xl">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Painel Gestor do Balcão</div>
              <select
                value={activeRestaurantId}
                onChange={(e) => setActiveRestaurantId(e.target.value)}
                className="bg-gray-800 text-white font-bold text-base rounded-xl px-3 py-1.5 border border-gray-700 outline-none cursor-pointer mt-0.5"
              >
                {restaurants.map((rest) => (
                  <option key={rest.id} value={rest.id}>
                    {rest.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Audio Alert Button */}
            {!audioEnabled ? (
              <button
                onClick={handleEnableAudio}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all animate-bounce"
              >
                <VolumeX className="w-4 h-4" />
                <span>Ativar Áudio do Balcão (Ding-Dong)</span>
              </button>
            ) : (
              <button
                onClick={testAudio}
                className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/50 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                <span>Áudio Ativado (Testar Som)</span>
              </button>
            )}

            {/* Tabs */}
            <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700">
              <button
                onClick={() => setActiveTab('kanban')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'kanban' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:text-white'
                }`}
              >
                Kanban de Pedidos
              </button>
              <button
                onClick={() => setActiveTab('cardapio')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'cardapio' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:text-white'
                }`}
              >
                Gestão de Cardápio
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200">
            <div className="text-xs text-gray-500 font-semibold uppercase">Pendentes / Novos</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.novos}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200">
            <div className="text-xs text-gray-500 font-semibold uppercase">Em Preparo</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{stats.preparando}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200">
            <div className="text-xs text-gray-500 font-semibold uppercase">Saiu p/ Entrega</div>
            <div className="text-2xl font-black text-purple-600 mt-1">{stats.entrega}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200">
            <div className="text-xs text-gray-500 font-semibold uppercase">Concluídos Hoje</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.concluido}</div>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl shadow-xs border border-gray-200">
            <div className="text-xs text-gray-500 font-semibold uppercase">Faturamento Concluído</div>
            <div className="text-xl font-black text-gray-900 mt-1">
              {stats.faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>

        {activeTab === 'kanban' ? (
          /* --- KANBAN BOARD DE PEDIDOS --- */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Coluna 1: Novos / Pendentes */}
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between">
                <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Novos / Pendentes</span>
                </h3>
                <span className="bg-amber-200 text-amber-900 font-black text-xs px-2.5 py-0.5 rounded-full">
                  {restaurantOrders.filter(o => o.status === 'pendente').length}
                </span>
              </div>

              <div className="space-y-3">
                {restaurantOrders.filter(o => o.status === 'pendente').length === 0 ? (
                  <div className="bg-white/60 border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-400 text-xs">
                    Nenhum pedido pendente
                  </div>
                ) : (
                  restaurantOrders
                    .filter(o => o.status === 'pendente')
                    .map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={onUpdateOrderStatus}
                        onOpenReceipt={() => setReceiptOrder(order)}
                      />
                    ))
                )}
              </div>
            </div>

            {/* Coluna 2: Em Preparo */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl flex items-center justify-between">
                <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-blue-600" />
                  <span>Em Preparo</span>
                </h3>
                <span className="bg-blue-200 text-blue-900 font-black text-xs px-2.5 py-0.5 rounded-full">
                  {restaurantOrders.filter(o => o.status === 'preparando').length}
                </span>
              </div>

              <div className="space-y-3">
                {restaurantOrders.filter(o => o.status === 'preparando').length === 0 ? (
                  <div className="bg-white/60 border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-400 text-xs">
                    Nenhum pedido em preparo
                  </div>
                ) : (
                  restaurantOrders
                    .filter(o => o.status === 'preparando')
                    .map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={onUpdateOrderStatus}
                        onOpenReceipt={() => setReceiptOrder(order)}
                      />
                    ))
                )}
              </div>
            </div>

            {/* Coluna 3: Saiu para Entrega */}
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl flex items-center justify-between">
                <h3 className="font-bold text-purple-900 text-sm flex items-center gap-2">
                  <Bike className="w-4 h-4 text-purple-600" />
                  <span>Saiu para Entrega</span>
                </h3>
                <span className="bg-purple-200 text-purple-900 font-black text-xs px-2.5 py-0.5 rounded-full">
                  {restaurantOrders.filter(o => o.status === 'entrega').length}
                </span>
              </div>

              <div className="space-y-3">
                {restaurantOrders.filter(o => o.status === 'entrega').length === 0 ? (
                  <div className="bg-white/60 border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-400 text-xs">
                    Nenhum pedido em rota
                  </div>
                ) : (
                  restaurantOrders
                    .filter(o => o.status === 'entrega')
                    .map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={onUpdateOrderStatus}
                        onOpenReceipt={() => setReceiptOrder(order)}
                      />
                    ))
                )}
              </div>
            </div>

            {/* Coluna 4: Concluídos */}
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between">
                <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concluídos</span>
                </h3>
                <span className="bg-emerald-200 text-emerald-900 font-black text-xs px-2.5 py-0.5 rounded-full">
                  {restaurantOrders.filter(o => o.status === 'concluido').length}
                </span>
              </div>

              <div className="space-y-3">
                {restaurantOrders.filter(o => o.status === 'concluido').length === 0 ? (
                  <div className="bg-white/60 border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-400 text-xs">
                    Nenhum pedido concluído
                  </div>
                ) : (
                  restaurantOrders
                    .filter(o => o.status === 'concluido')
                    .map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={onUpdateOrderStatus}
                        onOpenReceipt={() => setReceiptOrder(order)}
                      />
                    ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* --- GESTÃO RÁPIDA DE CARDÁPIO --- */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Gerenciamento Rápido do Cardápio</h3>
                <p className="text-xs text-gray-500">Pause itens esgotados ou altere preços instantaneamente para os clientes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurantProducts.map((prod) => (
                <MenuProductCard
                  key={prod.id}
                  product={prod}
                  onUpdateProduct={onUpdateProduct}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Thermal Receipt Modal */}
      {receiptOrder && (
        <ThermalReceiptModal
          order={receiptOrder}
          restaurant={currentRestaurant}
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </div>
  );
}

// Subcomponent: Order Kanban Card
interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onOpenReceipt: () => void;
}

function OrderCard({ order, onUpdateStatus, onOpenReceipt }: OrderCardProps) {
  const timeStr = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-200 space-y-3 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-900 text-sm">#{order.id}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-lg">
            {timeStr}
          </span>
          <button
            onClick={onOpenReceipt}
            title="Imprimir Comanda Térmica"
            className="text-gray-600 hover:text-emerald-600 p-1 bg-gray-50 hover:bg-emerald-50 rounded-lg transition-colors border border-gray-200"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1 text-xs">
        <div className="font-bold text-gray-800">{order.customerName}</div>
        <div className="text-gray-500 flex items-center gap-1">
          <Phone className="w-3 h-3" />
          <a href={`https://wa.me/55${order.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
            {order.phone}
          </a>
        </div>
        <div className="text-gray-500 flex items-start gap-1">
          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
          <span>{order.address.street}, {order.address.number} - {order.address.neighborhood}</span>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Items */}
      <div className="space-y-1.5 text-xs">
        <div className="font-semibold text-gray-700">Itens:</div>
        {order.items.map((item, idx) => (
          <div key={idx} className="text-gray-600">
            <div><strong className="text-gray-900">{item.quantity}x</strong> {item.product.name}</div>
            {item.observations && (
              <div className="text-amber-800 bg-amber-50 p-1 rounded-md mt-0.5 font-medium">
                Obs: {item.observations}
              </div>
            )}
          </div>
        ))}
      </div>

      <hr className="border-gray-100" />

      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-gray-500 uppercase">{order.paymentMethod} {order.paymentMethod === 'dinheiro' && order.changeFor ? `(Troco R$ ${order.changeFor.toFixed(2)})` : ''}</span>
        <span className="font-black text-emerald-600 text-sm">
          {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-wrap gap-1.5">
        {order.status === 'pendente' && (
          <>
            <button
              onClick={() => onUpdateStatus(order.id, 'preparando')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <span>Aceitar / Preparar</span>
            </button>
            <button
              onClick={() => onUpdateStatus(order.id, 'recusado')}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-3 rounded-xl text-xs transition-all border border-red-200"
            >
              Recusar
            </button>
          </>
        )}

        {order.status === 'preparando' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'entrega')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1"
          >
            <Bike className="w-4 h-4" />
            <span>Despachar Entrega</span>
          </button>
        )}

        {order.status === 'entrega' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'concluido')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Concluir Pedido</span>
          </button>
        )}

        {order.status === 'concluido' && (
          <div className="w-full text-center text-xs text-emerald-600 font-bold bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
            ✓ Pedido Concluído
          </div>
        )}

        {order.status === 'recusado' && (
          <div className="w-full text-center text-xs text-red-600 font-bold bg-red-50 py-1.5 rounded-lg border border-red-200">
            ✕ Pedido Recusado
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponent: Menu Product Card for quick stock/price management
interface MenuProductCardProps {
  product: Product;
  onUpdateProduct: (product: Product) => void;
}

function MenuProductCard({ product, onUpdateProduct }: MenuProductCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(product.price.toString());

  const handleSavePrice = () => {
    const num = parseFloat(price.replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      onUpdateProduct({ ...product, price: num });
      setIsEditing(false);
    }
  };

  const toggleAvailability = () => {
    onUpdateProduct({ ...product, available: !product.available });
  };

  return (
    <div className={`bg-white rounded-2xl p-4 border shadow-xs flex flex-col justify-between space-y-3 ${product.available ? 'border-gray-200' : 'border-red-300 bg-red-50/30'}`}>
      <div className="flex gap-3">
        <img 
          src={product.image} 
          alt="" 
          className="w-16 h-16 rounded-xl object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-sm">{product.name}</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${product.available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {product.available ? 'Ativo' : 'Esgotado'}
            </span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input 
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-xs"
            />
            <button onClick={handleSavePrice} className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold">Salvar</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-black text-emerald-600 text-sm">
              {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-emerald-600">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={toggleAvailability}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            product.available 
              ? 'bg-red-100 hover:bg-red-200 text-red-700' 
              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
          }`}
        >
          {product.available ? 'Pausar Item' : 'Ativar Item'}
        </button>
      </div>
    </div>
  );
}
