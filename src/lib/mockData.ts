/**
 * Mock data para simular backend tRPC
 * Dados realistas de um ERP brasileiro - Confeccao Textil Personalizada
 */

// ─── Usuarios ──────────────────────────────────────────────────────────────
export const mockUsers = [
  { id: 1, name: "Fernando Silva", email: "fernando@empresa.com" },
  { id: 2, name: "Ana Costa", email: "ana@empresa.com" },
  { id: 3, name: "Carlos Oliveira", email: "carlos@empresa.com" },
];

// ─── Categorias ───────────────────────────────────────────────────────────
export let mockCategories = [
  { id: 1, name: "Camisetas", description: "Camisetas personalizadas em diversos tamanhos", isActive: true, createdAt: new Date("2025-01-10").toISOString() },
  { id: 2, name: "Guardanapos", description: "Guardanapos de tecido personalizados para eventos e restaurantes", isActive: true, createdAt: new Date("2025-01-10").toISOString() },
  { id: 3, name: "Toalhas", description: "Toalhas de mesa e banho personalizadas", isActive: true, createdAt: new Date("2025-01-10").toISOString() },
  { id: 4, name: "Aventais", description: "Aventais personalizados para cozinha e churrasco", isActive: true, createdAt: new Date("2025-01-12").toISOString() },
  { id: 5, name: "Bandanas", description: "Bandanas e lencos personalizados", isActive: true, createdAt: new Date("2025-01-15").toISOString() },
  { id: 6, name: "Personalizados", description: "Produtos texteis sob medida e projetos especiais", isActive: true, createdAt: new Date("2025-02-01").toISOString() },
];

let nextCategoryId = 7;

// ─── Clientes ──────────────────────────────────────────────────────────────
export let mockCustomers = [
  { id: 1, name: "Boutique Fios de Ouro", email: "compras@fiosdeouro.com.br", phone: "(11) 99999-1234", type: "PJ" as const, document: "12.345.678/0001-90", address: "Rua Augusta, 1500", city: "São Paulo", state: "SP", notes: "Cliente VIP - coleções exclusivas", isActive: true },
  { id: 2, name: "Restaurante Sabor & Arte", email: "chef@saborarte.com", phone: "(11) 98765-4321", type: "PJ" as const, document: "23.456.789/0001-01", address: "Av. Paulista, 2000", city: "São Paulo", state: "SP", notes: "Pedidos recorrentes de guardanapos", isActive: true },
  { id: 3, name: "Eventos Premium Ltda", email: "contato@eventospremium.com.br", phone: "(21) 99876-5432", type: "PJ" as const, document: "34.567.890/0001-12", address: "Rua Visconde de Pirajá, 330", city: "Rio de Janeiro", state: "RJ", notes: "Eventos corporativos de grande porte", isActive: true },
  { id: 4, name: "Loja Moda Urbana", email: "gerencia@modaurbana.com.br", phone: "(31) 97654-3210", type: "PJ" as const, document: "45.678.901/0001-23", address: "Rua da Bahia, 1200", city: "Belo Horizonte", state: "MG", notes: "Revenda streetwear", isActive: true },
  { id: 5, name: "Buffet Festa Completa", email: "pedidos@festacompleta.com", phone: "(11) 96543-2109", type: "PJ" as const, document: "56.789.012/0001-34", address: "Rua dos Pinheiros, 800", city: "São Paulo", state: "SP", notes: "", isActive: true },
  { id: 6, name: "Churrascaria Brasa Viva", email: "compras@brasaviva.com", phone: "(41) 95432-1098", type: "PJ" as const, document: "67.890.123/0001-45", address: "Av. Batel, 1500", city: "Curitiba", state: "PR", notes: "Aventais personalizados", isActive: true },
  { id: 7, name: "Escola de Gastronomia SP", email: "admin@gastronomiasp.edu.br", phone: "(11) 94321-0987", type: "PJ" as const, document: "78.901.234/0001-56", address: "Rua Consolação, 2300", city: "São Paulo", state: "SP", notes: "Kit aluno semestral", isActive: true },
  { id: 8, name: "Hotel Pousada das Flores", email: "recepcao@pousadadasflores.com.br", phone: "(22) 93210-9876", type: "PJ" as const, document: "89.012.345/0001-67", address: "Rua das Flores, 100", city: "Petrópolis", state: "RJ", notes: "Toalhas com logo do hotel", isActive: true },
  { id: 9, name: "Confeitaria Doce Mel", email: "contato@docemel.com.br", phone: "(51) 92109-8765", type: "PJ" as const, document: "90.123.456/0001-78", address: "Av. Independência, 900", city: "Porto Alegre", state: "RS", notes: "", isActive: true },
  { id: 10, name: "Loja Estilo Radical", email: "vendas@estiloradical.com", phone: "(61) 91098-7654", type: "PJ" as const, document: "01.234.567/0001-89", address: "SCS Quadra 7", city: "Brasília", state: "DF", notes: "Inativo - inadimplente", isActive: false },
];

let nextCustomerId = 11;

// ─── Produtos ──────────────────────────────────────────────────────────────
export let mockProducts = [
  { id: 1, name: "Camiseta Personalizada Tam P", sku: "CAM-P-001", price: "49.90", salePrice: "49.90", costPrice: "18.00", stockQuantity: 120, minStockLevel: 30, category: "Camisetas", categoryId: 1, unit: "un", description: "Camiseta algodao 100% personalizada sublimacao tamanho P", isActive: true },
  { id: 2, name: "Camiseta Personalizada Tam M", sku: "CAM-M-001", price: "49.90", salePrice: "49.90", costPrice: "18.50", stockQuantity: 200, minStockLevel: 50, category: "Camisetas", categoryId: 1, unit: "un", description: "Camiseta algodao 100% personalizada sublimacao tamanho M", isActive: true },
  { id: 3, name: "Camiseta Personalizada Tam G", sku: "CAM-G-001", price: "54.90", salePrice: "54.90", costPrice: "19.00", stockQuantity: 150, minStockLevel: 40, category: "Camisetas", categoryId: 1, unit: "un", description: "Camiseta algodao 100% personalizada sublimacao tamanho G", isActive: true },
  { id: 4, name: "Camiseta Personalizada Tam GG", sku: "CAM-GG-001", price: "59.90", salePrice: "59.90", costPrice: "20.00", stockQuantity: 80, minStockLevel: 20, category: "Camisetas", categoryId: 1, unit: "un", description: "Camiseta algodao 100% personalizada sublimacao tamanho GG", isActive: true },
  { id: 5, name: "Guardanapo de Tecido 40x40cm", sku: "GRD-40-001", price: "12.90", salePrice: "12.90", costPrice: "4.50", stockQuantity: 500, minStockLevel: 100, category: "Guardanapos", categoryId: 2, unit: "un", description: "Guardanapo de tecido personalizado 40x40cm algodao/poliester", isActive: true },
  { id: 6, name: "Guardanapo de Tecido 50x50cm", sku: "GRD-50-001", price: "16.90", salePrice: "16.90", costPrice: "5.80", stockQuantity: 300, minStockLevel: 80, category: "Guardanapos", categoryId: 2, unit: "un", description: "Guardanapo de tecido personalizado 50x50cm algodao premium", isActive: true },
  { id: 7, name: "Toalha de Mesa Redonda 1.60m", sku: "TWL-RD-001", price: "89.90", salePrice: "89.90", costPrice: "32.00", stockQuantity: 40, minStockLevel: 10, category: "Toalhas", categoryId: 3, unit: "un", description: "Toalha de mesa redonda 1.60m personalizada", isActive: true },
  { id: 8, name: "Toalha de Mesa Retangular 2.0m", sku: "TWL-RT-001", price: "109.90", salePrice: "109.90", costPrice: "38.00", stockQuantity: 35, minStockLevel: 10, category: "Toalhas", categoryId: 3, unit: "un", description: "Toalha de mesa retangular 2.0x1.4m personalizada", isActive: true },
  { id: 9, name: "Avental de Cozinha Personalizado", sku: "AVT-CZ-001", price: "39.90", salePrice: "39.90", costPrice: "14.00", stockQuantity: 90, minStockLevel: 20, category: "Aventais", categoryId: 4, unit: "un", description: "Avental de cozinha personalizado com bolso frontal", isActive: true },
  { id: 10, name: "Avental Churrasqueiro Premium", sku: "AVT-CH-001", price: "59.90", salePrice: "59.90", costPrice: "22.00", stockQuantity: 60, minStockLevel: 15, category: "Aventais", categoryId: 4, unit: "un", description: "Avental churrasqueiro couro sintetico com personalizacao", isActive: true },
  { id: 11, name: "Bandana Personalizada 55x55cm", sku: "BND-55-001", price: "19.90", salePrice: "19.90", costPrice: "6.00", stockQuantity: 250, minStockLevel: 50, category: "Bandanas", categoryId: 5, unit: "un", description: "Bandana personalizada sublimacao total 55x55cm", isActive: true },
  { id: 12, name: "Kit Toalha de Rosto Bordada", sku: "PRS-TR-001", price: "34.90", salePrice: "34.90", costPrice: "12.00", stockQuantity: 8, minStockLevel: 15, category: "Personalizados", categoryId: 6, unit: "un", description: "Kit com 2 toalhas de rosto com bordado personalizado", isActive: true },
  { id: 13, name: "Sacola Ecobag Personalizada", sku: "PRS-EB-001", price: "24.90", salePrice: "24.90", costPrice: "8.50", stockQuantity: 180, minStockLevel: 40, category: "Personalizados", categoryId: 6, unit: "un", description: "Sacola ecobag algodao cru com estampa personalizada", isActive: true },
  { id: 14, name: "Toalha de Banho Sublimada", sku: "TWL-BN-001", price: "79.90", salePrice: "79.90", costPrice: "28.00", stockQuantity: 25, minStockLevel: 10, category: "Toalhas", categoryId: 3, unit: "un", description: "Toalha de banho 70x140cm sublimacao total", isActive: true },
];

let nextProductId = 15;

// ─── Pedidos ──────────────────────────────────────────────────────────────
const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

export let mockOrders = [
  {
    id: 1, orderNumber: "PED-001", customerId: 2, customerName: "Restaurante Sabor & Arte",
    status: "delivered" as const, paymentStatus: "paid" as const,
    items: [
      { productId: 5, productName: "Guardanapo de Tecido 40x40cm", quantity: 100, unitPrice: "12.90", total: "1290.00" },
      { productId: 7, productName: "Toalha de Mesa Redonda 1.60m", quantity: 10, unitPrice: "89.90", total: "899.00" },
    ],
    totalAmount: "2189.00", notes: "Logo do restaurante bordado nos guardanapos",
    createdAt: daysAgo(25), updatedAt: daysAgo(20),
  },
  {
    id: 2, orderNumber: "PED-002", customerId: 3, customerName: "Eventos Premium Ltda",
    status: "delivered" as const, paymentStatus: "paid" as const,
    items: [
      { productId: 1, productName: "Camiseta Personalizada Tam P", quantity: 20, unitPrice: "49.90", total: "998.00" },
      { productId: 2, productName: "Camiseta Personalizada Tam M", quantity: 50, unitPrice: "49.90", total: "2495.00" },
      { productId: 3, productName: "Camiseta Personalizada Tam G", quantity: 30, unitPrice: "54.90", total: "1647.00" },
      { productId: 11, productName: "Bandana Personalizada 55x55cm", quantity: 100, unitPrice: "19.90", total: "1990.00" },
    ],
    totalAmount: "7130.00", notes: "Evento corporativo - entrega ate dia 15",
    createdAt: daysAgo(22), updatedAt: daysAgo(18),
  },
  {
    id: 3, orderNumber: "PED-003", customerId: 5, customerName: "Buffet Festa Completa",
    status: "production" as const, paymentStatus: "paid" as const,
    items: [
      { productId: 6, productName: "Guardanapo de Tecido 50x50cm", quantity: 200, unitPrice: "16.90", total: "3380.00" },
      { productId: 8, productName: "Toalha de Mesa Retangular 2.0m", quantity: 15, unitPrice: "109.90", total: "1648.50" },
    ],
    totalAmount: "5028.50", notes: "Personalizacao para casamento - monograma",
    createdAt: daysAgo(15), updatedAt: daysAgo(12),
  },
  {
    id: 4, orderNumber: "PED-004", customerId: 6, customerName: "Churrascaria Brasa Viva",
    status: "production" as const, paymentStatus: "partial" as const,
    items: [
      { productId: 10, productName: "Avental Churrasqueiro Premium", quantity: 20, unitPrice: "59.90", total: "1198.00" },
      { productId: 9, productName: "Avental de Cozinha Personalizado", quantity: 15, unitPrice: "39.90", total: "598.50" },
      { productId: 5, productName: "Guardanapo de Tecido 40x40cm", quantity: 50, unitPrice: "12.90", total: "645.00" },
    ],
    totalAmount: "2441.50", notes: "Logo da churrascaria nos aventais e guardanapos",
    createdAt: daysAgo(10), updatedAt: daysAgo(8),
  },
  {
    id: 5, orderNumber: "PED-005", customerId: 1, customerName: "Boutique Fios de Ouro",
    status: "production" as const, paymentStatus: "pending" as const,
    items: [
      { productId: 1, productName: "Camiseta Personalizada Tam P", quantity: 30, unitPrice: "49.90", total: "1497.00" },
      { productId: 2, productName: "Camiseta Personalizada Tam M", quantity: 40, unitPrice: "49.90", total: "1996.00" },
      { productId: 3, productName: "Camiseta Personalizada Tam G", quantity: 20, unitPrice: "54.90", total: "1098.00" },
      { productId: 4, productName: "Camiseta Personalizada Tam GG", quantity: 10, unitPrice: "59.90", total: "599.00" },
    ],
    totalAmount: "5190.00", notes: "Colecao verao - estampas exclusivas",
    createdAt: daysAgo(7), updatedAt: daysAgo(5),
  },
  {
    id: 6, orderNumber: "PED-006", customerId: 8, customerName: "Hotel Pousada das Flores",
    status: "pending" as const, paymentStatus: "pending" as const,
    items: [
      { productId: 14, productName: "Toalha de Banho Sublimada", quantity: 50, unitPrice: "79.90", total: "3995.00" },
      { productId: 12, productName: "Kit Toalha de Rosto Bordada", quantity: 30, unitPrice: "34.90", total: "1047.00" },
    ],
    totalAmount: "5042.00", notes: "Toalhas com logo do hotel - urgente",
    createdAt: daysAgo(3), updatedAt: daysAgo(3),
  },
  {
    id: 7, orderNumber: "PED-007", customerId: 4, customerName: "Loja Moda Urbana",
    status: "pending" as const, paymentStatus: "pending" as const,
    items: [
      { productId: 2, productName: "Camiseta Personalizada Tam M", quantity: 60, unitPrice: "49.90", total: "2994.00" },
      { productId: 3, productName: "Camiseta Personalizada Tam G", quantity: 40, unitPrice: "54.90", total: "2196.00" },
      { productId: 13, productName: "Sacola Ecobag Personalizada", quantity: 100, unitPrice: "24.90", total: "2490.00" },
    ],
    totalAmount: "7680.00", notes: "Revenda - serie streetwear",
    createdAt: daysAgo(1), updatedAt: daysAgo(1),
  },
  {
    id: 8, orderNumber: "PED-008", customerId: 7, customerName: "Escola de Gastronomia SP",
    status: "pending" as const, paymentStatus: "pending" as const,
    items: [
      { productId: 9, productName: "Avental de Cozinha Personalizado", quantity: 40, unitPrice: "39.90", total: "1596.00" },
      { productId: 11, productName: "Bandana Personalizada 55x55cm", quantity: 40, unitPrice: "19.90", total: "796.00" },
    ],
    totalAmount: "2392.00", notes: "Kit aluno - avental + bandana com logo da escola",
    createdAt: daysAgo(0.5), updatedAt: daysAgo(0.5),
  },
];

let nextOrderId = 9;

// ─── Transacoes Financeiras ────────────────────────────────────────────────
export let mockTransactions = [
  { id: 1, type: "income" as const, category: "Vendas", description: "Venda guardanapos e toalhas - Restaurante Sabor & Arte (PED-001)", amount: "2189.00", status: "paid" as const, dueDate: daysAgo(20), paidDate: daysAgo(19), paymentMethod: "PIX", notes: "", createdAt: daysAgo(25) },
  { id: 2, type: "income" as const, category: "Vendas", description: "Venda camisetas e bandanas - Eventos Premium (PED-002)", amount: "7130.00", status: "paid" as const, dueDate: daysAgo(18), paidDate: daysAgo(18), paymentMethod: "Boleto", notes: "", createdAt: daysAgo(22) },
  { id: 3, type: "income" as const, category: "Vendas", description: "Venda guardanapos e toalhas casamento - Buffet Festa Completa (PED-003)", amount: "5028.50", status: "paid" as const, dueDate: daysAgo(12), paidDate: daysAgo(11), paymentMethod: "Transferencia", notes: "", createdAt: daysAgo(15) },
  { id: 4, type: "income" as const, category: "Vendas", description: "Venda aventais e guardanapos - Churrascaria Brasa Viva (PED-004)", amount: "1220.75", status: "paid" as const, dueDate: daysAgo(8), paidDate: daysAgo(7), paymentMethod: "PIX", notes: "Parcela 1/2", createdAt: daysAgo(10) },
  { id: 5, type: "income" as const, category: "Vendas", description: "Venda camisetas colecao verao - Boutique Fios de Ouro (PED-005)", amount: "5190.00", status: "pending" as const, dueDate: daysAgo(-5), paidDate: null, paymentMethod: "Boleto", notes: "Aguardando pagamento", createdAt: daysAgo(7) },
  { id: 6, type: "income" as const, category: "Vendas", description: "Venda toalhas bordadas - Hotel Pousada das Flores (PED-006)", amount: "5042.00", status: "pending" as const, dueDate: daysAgo(-10), paidDate: null, paymentMethod: "Cartao de Credito", notes: "", createdAt: daysAgo(3) },
  { id: 7, type: "income" as const, category: "Vendas", description: "Saldo aventais - Churrascaria Brasa Viva (PED-004)", amount: "1220.75", status: "overdue" as const, dueDate: daysAgo(2), paidDate: null, paymentMethod: "Boleto", notes: "Atraso no pagamento da 2a parcela", createdAt: daysAgo(10) },
  { id: 8, type: "income" as const, category: "Servicos", description: "Servico de design - arte para sublimacao evento corporativo", amount: "1500.00", status: "paid" as const, dueDate: daysAgo(7), paidDate: daysAgo(6), paymentMethod: "PIX", notes: "", createdAt: daysAgo(8) },
  { id: 9, type: "expense" as const, category: "Fornecedores", description: "Compra tecido algodao cru - Textil Brasileira", amount: "8500.00", status: "paid" as const, dueDate: daysAgo(20), paidDate: daysAgo(19), paymentMethod: "Boleto", notes: "NF 78901", createdAt: daysAgo(22) },
  { id: 10, type: "expense" as const, category: "Fornecedores", description: "Compra tintas sublimacao e transfer - InkSupply", amount: "3200.00", status: "paid" as const, dueDate: daysAgo(15), paidDate: daysAgo(14), paymentMethod: "PIX", notes: "NF 78950", createdAt: daysAgo(17) },
  { id: 11, type: "expense" as const, category: "Salarios", description: "Folha pagamento - Marco 2026 (costureiras + estampadores)", amount: "18500.00", status: "paid" as const, dueDate: daysAgo(5), paidDate: daysAgo(5), paymentMethod: "Transferencia", notes: "", createdAt: daysAgo(6) },
  { id: 12, type: "expense" as const, category: "Aluguel", description: "Aluguel atelie e oficina de costura - Abril 2026", amount: "4200.00", status: "pending" as const, dueDate: daysAgo(-4), paidDate: null, paymentMethod: "Boleto", notes: "", createdAt: daysAgo(2) },
  { id: 13, type: "expense" as const, category: "Utilidades", description: "Conta de luz (maquinas de costura e prensas) + internet", amount: "1350.00", status: "paid" as const, dueDate: daysAgo(8), paidDate: daysAgo(7), paymentMethod: "PIX", notes: "", createdAt: daysAgo(10) },
  { id: 14, type: "expense" as const, category: "Marketing", description: "Instagram Ads + Google Ads - Campanha camisetas personalizadas", amount: "2500.00", status: "pending" as const, dueDate: daysAgo(-15), paidDate: null, paymentMethod: "Cartao de Credito", notes: "", createdAt: daysAgo(1) },
  { id: 15, type: "expense" as const, category: "Impostos", description: "DAS Simples Nacional - Marco", amount: "3200.00", status: "overdue" as const, dueDate: daysAgo(3), paidDate: null, paymentMethod: "", notes: "Verificar multa", createdAt: daysAgo(25) },
  { id: 16, type: "expense" as const, category: "Logistica", description: "Frete Correios + Jadlog - lote pedidos camisetas e guardanapos", amount: "1450.00", status: "paid" as const, dueDate: daysAgo(12), paidDate: daysAgo(12), paymentMethod: "PIX", notes: "", createdAt: daysAgo(14) },
  { id: 17, type: "expense" as const, category: "Fornecedores", description: "Compra linhas e aviamentos - Armarinho Textil", amount: "1800.00", status: "pending" as const, dueDate: daysAgo(-7), paidDate: null, paymentMethod: "Boleto", notes: "NF 79010", createdAt: daysAgo(3) },
  { id: 18, type: "expense" as const, category: "Fornecedores", description: "Manutencao prensa termica e maquina de bordar", amount: "950.00", status: "paid" as const, dueDate: daysAgo(6), paidDate: daysAgo(5), paymentMethod: "PIX", notes: "", createdAt: daysAgo(8) },
];

let nextTransactionId = 19;

// ─── Logs de auditoria ─────────────────────────────────────────────────────
export const mockAuditLogs = [
  { id: 1, userId: 1, action: "create", entity: "product", entityId: 1, details: '{"name":"Camiseta Personalizada Tam P","amount":"49.90"}', createdAt: daysAgo(30) },
  { id: 2, userId: 1, action: "create", entity: "customer", entityId: 1, details: '{"name":"Boutique Fios de Ouro"}', createdAt: daysAgo(28) },
  { id: 3, userId: 2, action: "create", entity: "order", entityId: 1, details: '{"orderNumber":"PED-001","status":"pending"}', createdAt: daysAgo(25) },
  { id: 4, userId: 1, action: "update_status", entity: "order", entityId: 1, details: '{"status":"confirmed"}', createdAt: daysAgo(24) },
  { id: 5, userId: 2, action: "create", entity: "financial_transaction", entityId: 1, details: '{"type":"income","amount":"2189.00"}', createdAt: daysAgo(20) },
  { id: 6, userId: 1, action: "mark_paid", entity: "financial_transaction", entityId: 1, details: '{"amount":"2189.00","status":"paid"}', createdAt: daysAgo(19) },
  { id: 7, userId: 3, action: "stock_adjustment", entity: "product", entityId: 12, details: '{"name":"Kit Toalha de Rosto Bordada","from":20,"to":8}', createdAt: daysAgo(12) },
  { id: 8, userId: 2, action: "create", entity: "financial_transaction", entityId: 9, details: '{"type":"expense","amount":"8500.00","name":"Compra tecido algodao"}', createdAt: daysAgo(22) },
  { id: 9, userId: 1, action: "update", entity: "customer", entityId: 2, details: '{"name":"Restaurante Sabor & Arte","field":"phone"}', createdAt: daysAgo(10) },
  { id: 10, userId: 3, action: "create", entity: "order", entityId: 4, details: '{"orderNumber":"PED-004","status":"pending"}', createdAt: daysAgo(10) },
  { id: 11, userId: 1, action: "update_payment", entity: "order", entityId: 4, details: '{"status":"partial"}', createdAt: daysAgo(8) },
  { id: 12, userId: 2, action: "delete", entity: "product", entityId: 99, details: '{"name":"Modelo descontinuado de bandana"}', createdAt: daysAgo(5) },
  { id: 13, userId: 1, action: "reconcile", entity: "bank_transaction", entityId: 50, details: '{"amount":"7130.00"}', createdAt: daysAgo(4) },
  { id: 14, userId: 3, action: "import", entity: "product", entityId: null, details: '{"count":5,"source":"catalogo_textil.csv"}', createdAt: daysAgo(3) },
  { id: 15, userId: 1, action: "create", entity: "financial_transaction", entityId: 14, details: '{"type":"expense","amount":"2500.00","name":"Instagram Ads camisetas"}', createdAt: daysAgo(1) },
  { id: 16, userId: 2, action: "update_status", entity: "order", entityId: 5, details: '{"status":"in_production"}', createdAt: daysAgo(0.5) },
];

// ─── Dashboard Stats ───────────────────────────────────────────────────────
export function getDashboardStats() {
  const incomeTransactions = mockTransactions.filter(t => t.type === "income");
  const expenseTransactions = mockTransactions.filter(t => t.type === "expense");

  const paidIncome = incomeTransactions.filter(t => t.status === "paid").reduce((s, t) => s + parseFloat(t.amount), 0);
  const paidExpense = expenseTransactions.filter(t => t.status === "paid").reduce((s, t) => s + parseFloat(t.amount), 0);
  const pendingReceivables = incomeTransactions.filter(t => t.status === "pending" || t.status === "overdue").reduce((s, t) => s + parseFloat(t.amount), 0);
  const pendingPayables = expenseTransactions.filter(t => t.status === "pending" || t.status === "overdue").reduce((s, t) => s + parseFloat(t.amount), 0);
  const overdueCount = mockTransactions.filter(t => t.status === "overdue").length;
  const lowStockProducts = mockProducts.filter(p => p.stockQuantity <= p.minStockLevel);

  const pendingOrders = mockOrders.filter(o => o.status === "pending" || o.status === "production");
  const monthlyTotal = mockOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);

  return {
    totalCustomers: mockCustomers.filter(c => c.isActive).length,
    totalProducts: mockProducts.length,
    monthlyOrdersCount: mockOrders.length,
    monthlyOrdersTotal: monthlyTotal.toFixed(2),
    pendingOrdersCount: pendingOrders.length,
    incomeThisMonth: paidIncome.toFixed(2),
    expensesThisMonth: paidExpense.toFixed(2),
    pendingReceivables: pendingReceivables.toFixed(2),
    pendingPayables: pendingPayables.toFixed(2),
    overdueCount,
    lowStockCount: lowStockProducts.length,
  };
}

export function getTopProducts() {
  return [
    { productId: 2, productName: "Camiseta Personalizada Tam M", totalQuantity: 150, totalRevenue: "7485.00" },
    { productId: 5, productName: "Guardanapo de Tecido 40x40cm", totalQuantity: 150, totalRevenue: "1935.00" },
    { productId: 3, productName: "Camiseta Personalizada Tam G", totalQuantity: 90, totalRevenue: "4941.00" },
    { productId: 6, productName: "Guardanapo de Tecido 50x50cm", totalQuantity: 200, totalRevenue: "3380.00" },
    { productId: 11, productName: "Bandana Personalizada 55x55cm", totalQuantity: 140, totalRevenue: "2786.00" },
    { productId: 1, productName: "Camiseta Personalizada Tam P", totalQuantity: 50, totalRevenue: "2495.00" },
    { productId: 10, productName: "Avental Churrasqueiro Premium", totalQuantity: 20, totalRevenue: "1198.00" },
    { productId: 9, productName: "Avental de Cozinha Personalizado", totalQuantity: 55, totalRevenue: "2194.50" },
    { productId: 8, productName: "Toalha de Mesa Retangular 2.0m", totalQuantity: 15, totalRevenue: "1648.50" },
    { productId: 13, productName: "Sacola Ecobag Personalizada", totalQuantity: 100, totalRevenue: "2490.00" },
  ];
}

export function getTopCustomers() {
  return [
    { customerId: 3, orderCount: 4, totalSpent: "7130.00" },
    { customerId: 4, orderCount: 3, totalSpent: "7680.00" },
    { customerId: 5, orderCount: 3, totalSpent: "5028.50" },
    { customerId: 1, orderCount: 2, totalSpent: "5190.00" },
    { customerId: 8, orderCount: 2, totalSpent: "5042.00" },
  ];
}

export function getSalesReport(startDate: Date, endDate: Date) {
  const days: { date: string; totalSales: string; orderCount: number }[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const sales = Math.random() * 8000 + 500;
    const orders = Math.floor(Math.random() * 8) + 1;
    days.push({
      date: current.toISOString(),
      totalSales: sales.toFixed(2),
      orderCount: orders,
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function getCashFlow(startDate: Date, endDate: Date) {
  const entries: { date: string; type: string; total: string }[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    entries.push({
      date: current.toISOString(),
      type: "income",
      total: (Math.random() * 5000 + 1000).toFixed(2),
    });
    entries.push({
      date: current.toISOString(),
      type: "expense",
      total: (Math.random() * 3000 + 500).toFixed(2),
    });
    current.setDate(current.getDate() + 1);
  }
  return entries;
}

// ─── Mutacoes Financeiras ─────────────────────────────────────────────────

export function createTransaction(data: any) {
  const newT = {
    id: nextTransactionId++,
    ...data,
    amount: data.amount?.toString() ?? "0",
    createdAt: new Date().toISOString(),
    paidDate: data.paidDate?.toISOString() ?? null,
    dueDate: data.dueDate?.toISOString() ?? null,
  };
  mockTransactions = [newT, ...mockTransactions];
  return newT;
}

export function updateTransaction(data: any) {
  mockTransactions = mockTransactions.map(t =>
    t.id === data.id ? { ...t, ...data, amount: data.amount?.toString() ?? t.amount } : t
  );
  return mockTransactions.find(t => t.id === data.id);
}

export function deleteTransaction(id: number) {
  mockTransactions = mockTransactions.filter(t => t.id !== id);
}

export function markTransactionPaid(id: number) {
  mockTransactions = mockTransactions.map(t =>
    t.id === id ? { ...t, status: "paid" as const, paidDate: new Date().toISOString() } : t
  );
}

// ─── Mutacoes Categorias ──────────────────────────────────────────────────

export function createCategory(data: { name: string; description?: string }) {
  const newCat = {
    id: nextCategoryId++,
    name: data.name,
    description: data.description ?? "",
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  mockCategories = [...mockCategories, newCat];
  return newCat;
}

export function updateCategory(data: { id: number; name?: string; description?: string; isActive?: boolean }) {
  mockCategories = mockCategories.map(c =>
    c.id === data.id ? { ...c, ...data } : c
  );
  return mockCategories.find(c => c.id === data.id);
}

export function deleteCategory(id: number) {
  mockCategories = mockCategories.filter(c => c.id !== id);
}

// ─── Mutacoes Clientes ────────────────────────────────────────────────────

export function createCustomer(data: { name: string; email: string; phone: string; type?: string; document?: string; address?: string; city?: string; state?: string; notes?: string }) {
  const newCust = {
    id: nextCustomerId++,
    name: data.name,
    email: data.email,
    phone: data.phone,
    type: (data.type ?? "PF") as any,
    document: data.document ?? "",
    address: data.address ?? "",
    city: data.city ?? "",
    state: data.state ?? "",
    notes: data.notes ?? "",
    isActive: true,
  };
  mockCustomers = [...mockCustomers, newCust];
  return newCust;
}

export function updateCustomer(data: { id: number; [key: string]: any }) {
  mockCustomers = mockCustomers.map(c =>
    c.id === data.id ? { ...c, ...data } : c
  ) as any;
  return mockCustomers.find(c => c.id === data.id);
}

export function deleteCustomer(id: number) {
  mockCustomers = mockCustomers.map(c =>
    c.id === id ? { ...c, isActive: false } : c
  );
}

// ─── Mutacoes Produtos ────────────────────────────────────────────────────

export function createProduct(data: {
  name: string; sku: string; price?: string; salePrice?: string; costPrice: string;
  stockQuantity: number; minStockLevel: number; category?: string;
  categoryId: number; unit: string; description: string;
}) {
  const sp = data.salePrice ?? data.price ?? "0";
  const cat = data.category ?? mockCategories.find(c => c.id === data.categoryId)?.name ?? "";
  const newProd = {
    id: nextProductId++,
    ...data,
    price: sp,
    salePrice: sp,
    category: cat,
    isActive: true,
  };
  mockProducts = [...mockProducts, newProd];
  return newProd;
}

export function updateProduct(data: { id: number; [key: string]: any }) {
  mockProducts = mockProducts.map(p =>
    p.id === data.id ? { ...p, ...data } : p
  );
  return mockProducts.find(p => p.id === data.id);
}

export function deleteProduct(id: number) {
  mockProducts = mockProducts.filter(p => p.id !== id);
}

export function adjustStock(productId: number, newQuantity: number) {
  mockProducts = mockProducts.map(p =>
    p.id === productId ? { ...p, stockQuantity: newQuantity } : p
  );
  return mockProducts.find(p => p.id === productId);
}

// ─── Mutacoes Pedidos ─────────────────────────────────────────────────────

export function createOrder(data: {
  customerId: number; customerName: string; notes?: string;
  items: { productId: number; productName: string; quantity: number; unitPrice: string; total: string }[];
}) {
  const totalAmount = data.items.reduce((s, i) => s + parseFloat(i.total), 0).toFixed(2);
  const orderNumber = `PED-${String(nextOrderId).padStart(3, "0")}`;
  const newOrder = {
    id: nextOrderId++,
    orderNumber,
    customerId: data.customerId,
    customerName: data.customerName,
    status: "pending" as const,
    paymentStatus: "pending" as const,
    items: data.items,
    totalAmount,
    notes: data.notes ?? "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockOrders = [...mockOrders, newOrder];
  return newOrder;
}

export function updateOrderStatus(orderId: number, status: string) {
  mockOrders = mockOrders.map(o =>
    o.id === orderId ? { ...o, status: status as any, updatedAt: new Date().toISOString() } : o
  );
  return mockOrders.find(o => o.id === orderId);
}

export function updateOrderPayment(orderId: number, paymentStatus: string) {
  mockOrders = mockOrders.map(o =>
    o.id === orderId ? { ...o, paymentStatus: paymentStatus as any, updatedAt: new Date().toISOString() } : o
  );
  return mockOrders.find(o => o.id === orderId);
}
