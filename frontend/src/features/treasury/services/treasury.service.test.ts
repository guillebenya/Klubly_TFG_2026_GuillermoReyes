import {
  treasuryService,
  type Transaction,
  TransactionType,
  PaymentMethod,
} from "./treasury.service";
import api from "../../../api/axios";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mockeamos la instancia de axios
vi.mock("../../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("treasuryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Consultas (GET)", () => {
    it("debe obtener todas las transacciones activas", async () => {
      const mockTransactions = [
        { id: 1, amount: 50, concept: "Cuota Enero", type: "INCOME" },
        { id: 2, amount: 20, concept: "Material", type: "EXPENSE" },
      ];
      vi.mocked(api.get).mockResolvedValue({ data: mockTransactions });

      const result = await treasuryService.getAll();

      expect(api.get).toHaveBeenCalledWith("/treasury/transactions");
      expect(result.data).toEqual(mockTransactions);
    });

    it("debe obtener el resumen global de tesorería", async () => {
      const mockSummary = {
        totalIncome: 1000,
        totalExpense: 400,
        balance: 600,
      };
      vi.mocked(api.get).mockResolvedValue({ data: mockSummary });

      const result = await treasuryService.getGlobalSummary();

      expect(api.get).toHaveBeenCalledWith("/treasury/transactions/summary");
      expect(result.data).toEqual(mockSummary);
    });

    it("debe obtener el total pagado por un usuario específico", async () => {
      const userId = 5;
      vi.mocked(api.get).mockResolvedValue({ data: 150.75 });

      const result = await treasuryService.getUserTotalPaid(userId);

      expect(api.get).toHaveBeenCalledWith(
        `/treasury/transactions/user/${userId}/total`,
      );
      expect(result.data).toBe(150.75);
    });
  });

  describe("Mutaciones (POST, PUT, DELETE)", () => {
    it("debe crear una nueva transacción correctamente", async () => {
      const newTransaction: Partial<Transaction> = {
        amount: 100,
        concept: "Donación",
        type: TransactionType.INCOME,
        paymentMethod: PaymentMethod.CASH,
      };
      vi.mocked(api.post).mockResolvedValue({
        data: { id: 99, ...newTransaction },
      });

      const result = await treasuryService.create(newTransaction);

      expect(api.post).toHaveBeenCalledWith(
        "/treasury/transactions",
        newTransaction,
      );
      expect(result.data.id).toBe(99);
    });

    it("debe actualizar una transacción existente", async () => {
      const id = 10;
      const updateData = { concept: "Concepto Editado" };
      vi.mocked(api.put).mockResolvedValue({ data: { id, ...updateData } });

      const result = await treasuryService.update(id, updateData);

      expect(api.put).toHaveBeenCalledWith(
        `/treasury/transactions/${id}`,
        updateData,
      );
      expect(result.data.concept).toBe("Concepto Editado");
    });

    it("debe realizar el borrado lógico de una transacción", async () => {
      const id = 123;
      vi.mocked(api.delete).mockResolvedValue({ status: 200 });

      await treasuryService.delete(id);

      expect(api.delete).toHaveBeenCalledWith(`/treasury/transactions/${id}`);
    });
  });
});
