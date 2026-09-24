import { Restaurant, Product } from '../types';

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Pizzaria Bella Napoli',
    category: 'Pizzas & Calzones',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1000',
    rating: 4.8,
    deliveryTime: '35-50 min',
    deliveryFee: 6.00,
    isOpen: true,
    minOrder: 35.00,
    address: 'Rua Principal, 142 - Centro',
    phone: '(35) 99876-5432'
  },
  {
    id: 'rest-2',
    name: 'Hamburgueria Artesanal Fogo & Brasa',
    category: 'Lanches & Artesanais',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=1000',
    rating: 4.9,
    deliveryTime: '25-40 min',
    deliveryFee: 5.00,
    isOpen: true,
    minOrder: 25.00,
    address: 'Av. Sete de Setembro, 890',
    phone: '(35) 99123-4567'
  },
  {
    id: 'rest-3',
    name: 'Marmitaria Sabor Caseiro',
    category: 'Marmitas & Pratos Feitos',
    logo: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=1000',
    rating: 4.7,
    deliveryTime: '20-35 min',
    deliveryFee: 4.00,
    isOpen: true,
    minOrder: 20.00,
    address: 'Rua das Flores, 305',
    phone: '(35) 98888-1122'
  },
  {
    id: 'rest-4',
    name: 'Açaí & Sorvetes Tropicália',
    category: 'Açaí, Sobremesas & Sucos',
    logo: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=1000',
    rating: 4.9,
    deliveryTime: '15-25 min',
    deliveryFee: 3.50,
    isOpen: true,
    minOrder: 15.00,
    address: 'Praça da Matriz, 45',
    phone: '(35) 98456-7890'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Pizzaria Bella Napoli (rest-1)
  {
    id: 'p-1',
    restaurantId: 'rest-1',
    name: 'Pizza Margherita Especial',
    description: 'Molho de tomate artesanal, muçarela de búfala fresca, rodelas de tomate, manjericão e azeite extra virgem.',
    price: 58.00,
    category: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&q=80&w=600',
    available: true,
    popular: true
  },
  {
    id: 'p-2',
    restaurantId: 'rest-1',
    name: 'Pizza Calabresa com Catupiry',
    description: 'Calabresa fatiada artesanalmente, cebola roxa marinada, generosas camadas de catupiry original e orégano.',
    price: 62.00,
    category: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600',
    available: true,
    popular: true
  },
  {
    id: 'p-3',
    restaurantId: 'rest-1',
    name: 'Pizza Quatro Queijos',
    description: 'Molho, muçarela, provolone defumado, gorgonzola cremoso e parmesão ralado na hora.',
    price: 68.00,
    category: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600',
    available: true
  },
  {
    id: 'p-4',
    restaurantId: 'rest-1',
    name: 'Calzone de Frango com Requeijão',
    description: 'Massa fechada recheada com frango desfiado temperado, requeijão cremoso, milho e ervas finas.',
    price: 49.00,
    category: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1629115918763-549f52f75727?auto=format&fit=crop&q=80&w=600',
    available: true
  },
  {
    id: 'p-5',
    restaurantId: 'rest-1',
    name: 'Refrigerant Cola 2 Litros',
    description: 'Garrafa 2L gelada.',
    price: 12.00,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600',
    available: true
  },

  // Fogo & Brasa (rest-2)
  {
    id: 'p-6',
    restaurantId: 'rest-2',
    name: 'Burger Angus Costela & Bacon',
    description: 'Blend artesanal de Angus 180g, queijo cheddar inglês derretido, bacon crocante em tiras, cebola caramelizada e maionese da casa no brioche tostado na manteiga.',
    price: 36.90,
    category: 'Lanches',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
    available: true,
    popular: true
  },
  {
    id: 'p-7',
    restaurantId: 'rest-2',
    name: 'Burger Smash Duplo Salada',
    description: 'Dois blends smash de 90g com crosta perfeita, duplo queijo prato, alface americana crocante, tomate fresco e molho especial.',
    price: 31.90,
    category: 'Lanches',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=600',
    available: true,
    popular: true
  },
  {
    id: 'p-8',
    restaurantId: 'rest-2',
    name: 'Batata Frita Rústica com Cheddar e Bacon',
    description: 'Porção generosa de batatas rústicas temperadas com páprica, cobertas com creme de cheddar quente e bacon crocante.',
    price: 24.50,
    category: 'Lanches',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600',
    available: true
  },
  {
    id: 'p-9',
    restaurantId: 'rest-2',
    name: 'Suco Natural de Laranja 500ml',
    description: 'Feito na hora com 100% frutas frescas, sem adição de água.',
    price: 9.00,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=600',
    available: true
  },

  // Marmitaria Sabor Caseiro (rest-3)
  {
    id: 'p-10',
    restaurantId: 'rest-3',
    name: 'Marmitex Executiva de Contra Filé',
    description: 'Contra filé grelhado com alho, arroz branco soltinho, feijão com caldinho temperado, batata frita crocante e salada fresca de alface e tomate.',
    price: 28.00,
    category: 'Marmitex',
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=600',
    available: true,
    popular: true
  },
  {
    id: 'p-11',
    restaurantId: 'rest-3',
    name: 'Marmitex de Frango à Parmegiana',
    description: 'Filé de frango empanado, coberto com molho de tomate caseiro e muçarela gratinada, acompanhado de arroz e purê de batatas.',
    price: 25.00,
    category: 'Marmitex',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
    available: true
  },
  {
    id: 'p-12',
    restaurantId: 'rest-3',
    name: 'Guaraná Natural 350ml',
    description: 'Lata gelada.',
    price: 6.50,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600',
    available: true
  },

  // Açaí & Sorvetes Tropicália (rest-4)
  {
    id: 'p-13',
    restaurantId: 'rest-4',
    name: 'Açaí Tradicional na Tigela 500ml',
    description: 'Açaí cremoso batido com banana, acompanhado de leite condensado, leite em pó ninho, granola artesanal e morangos frescos.',
    price: 24.00,
    category: 'Açaí',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=600',
    available: true,
    popular: true
  },
  {
    id: 'p-14',
    restaurantId: 'rest-4',
    name: 'Milkshake de Ninho com Nutella 400ml',
    description: 'Sorvete batido com creme de leite Ninho e bordas recheadas com Nutella pura.',
    price: 19.90,
    category: 'Sobremesas',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=600',
    available: true
  },
  {
    id: 'p-15',
    restaurantId: 'rest-4',
    name: 'Água Mineral 500ml (Com ou Sem Gás)',
    description: 'Garrafa 500ml.',
    price: 4.50,
    category: 'Bebidas',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&q=80&w=600',
    available: true
  }
];
