export interface Order {
  id: number;
  title: string;
  date: string;
  description: string;
}

export interface Product {
  id: number;
  serialNumber: number;
  isNew: number;
  photo: string;
  title: string;
  type: string;
  specification: string;
  guarantee: {
    start: string;
    end: string;
  };
  price: Price[];
  order: number;
  date: string;
}

export interface Price {
  value: number;
  symbol: string;
  isDefault: number;
}

export interface OrderStats {
  productsCount: number;
  priceUSD: number;
  priceUAH: number;
}

export interface OrderCardProps {
  orderId: string;
  title: string;
  productsCount: number;
  date: string;
  dateShort: string;
  priceUSD: number;
  priceUAH: number;
}
export interface ProductCardProps {
  title: string;
  productType: string;
  guaranteeStartDate: string;
  guaranteeEndDate: string;
  priceUSD: string;
  priceUAH: string;
  date: string;
  order: number;
}
