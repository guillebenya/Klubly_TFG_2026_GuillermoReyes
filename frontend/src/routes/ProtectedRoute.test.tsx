import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    // Limpiamos el localStorage antes de cada prueba para evitar interferencias
    localStorage.clear();
    // Limpiamos los mocks (si los hubiera)
    vi.clearAllMocks();
  });

  it("debe redirigir al login cuando NO existe un token", () => {
    // GIVEN: El localStorage está vacío (simulado por el beforeEach)

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          {/* Definimos la ruta protegida */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<h1>Panel de Control</h1>} />
          </Route>

          {/* Definimos la ruta de destino de la redirección */}
          <Route path="/login" element={<h1>Página de Login</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    // THEN: No deberíamos ver el panel, sino el login
    expect(screen.getByText("Página de Login")).toBeInTheDocument();
    expect(screen.queryByText("Panel de Control")).not.toBeInTheDocument();
  });

  it("debe permitir el acceso al contenido cuando sí existe un token", () => {
    // GIVEN: Simulamos que el usuario está logueado
    localStorage.setItem("token", "fake-jwt-token");

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<h1>Panel de Control</h1>} />
          </Route>
          <Route path="/login" element={<h1>Página de Login</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    // THEN: Deberíamos ver el panel de control
    expect(screen.getByText("Panel de Control")).toBeInTheDocument();
    expect(screen.queryByText("Página de Login")).not.toBeInTheDocument();
  });
});
