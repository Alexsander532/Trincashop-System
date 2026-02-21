export interface Order {
    id: number;
    productId: number;
    productName: string;
    productPrice: number;
    status: 'PENDING' | 'PAID' | 'RELEASED';
    createdAt: string;
}

export interface OrderStats {
    totalPedidos: number;
    pedidosPendentes: number;
    pedidosPagos: number;
    totalArrecadado: number;
}
