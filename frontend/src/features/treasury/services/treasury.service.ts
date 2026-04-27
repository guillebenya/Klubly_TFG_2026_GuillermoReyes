// src/features/treasury/services/treasury.service.ts
import api from "../../../api/axios";

export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const PaymentMethod = {
  CARD: "CARD",
  CASH: "CASH",
  TRANSFER: "TRANSFER",
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

//INTERFACES
export interface Transaction {
  id: number;
  amount: number;
  concept: string;
  transactionDate: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  userId?: number;
  userFullName?: string;
  active: boolean;
  createdAt?: string;
  deletedAt?: string | null;
}

export interface TreasurySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const ENDPOINT = "/treasury/transactions";

export const treasuryService = {
    
  // ACCIONES DE ADMIN
  // Obtener todas las transacciones activas
  getAll: () => api.get<Transaction[]>(ENDPOINT),

  // Obtener el resumen global de cuentas
  getGlobalSummary: () => api.get<TreasurySummary>(`${ENDPOINT}/summary`),

  // Obtener historial de movimientos eliminados
  getDeletedHistory: () => api.get<Transaction[]>(`${ENDPOINT}/history/deleted`),

  // Registrar un nuevo ingreso o gasto
  create: (data: Partial<Transaction>) => api.post<Transaction>(ENDPOINT, data),

  // Dar de baja una transacción
  delete: (id: number) => api.delete(`${ENDPOINT}/${id}`),

  // ACCIONES DE MEMBER (MIS PAGOS)

  // Obtener los pagos de un socio específico
  getByUserId: (userId: number) => 
    api.get<Transaction[]>(`${ENDPOINT}/user/${userId}`),

  // Obtener el total acumulado pagado por un socio
  getUserTotalPaid: (userId: number) => 
    api.get<number>(`${ENDPOINT}/user/${userId}/total`),
};