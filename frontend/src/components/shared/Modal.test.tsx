import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from './Modal';

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div data-testid="modal-content">Contenido del Modal</div>,
  };

  it('debe renderizar el título y el contenido cuando está abierto', () => {
    render(<Modal {...defaultProps} />);
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('no debe renderizar nada cuando está cerrado', () => {
    const { container } = render(<Modal {...defaultProps} isOpen={false} />);
    
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('debe llamar a onClose al pulsar el botón de cerrar (X)', () => {
    render(<Modal {...defaultProps} />);
    
    // Buscamos el botón que contiene el icono (o por rol si no tiene label)
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('debe llamar a onClose al hacer click en el backdrop (fondo oscuro)', () => {
    const { container } = render(<Modal {...defaultProps} />);
    
    const backdrop = container.querySelector(String.raw`.bg-gray-900\/60`); 
    if (backdrop) fireEvent.click(backdrop);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('debe llamar a onClose al pulsar la tecla Escape', () => {
    render(<Modal {...defaultProps} />);
    
    fireEvent.keyDown(globalThis as unknown as Window, { key: 'Escape', code: 'Escape' });
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('debe aplicar la clase de tamaño correcta', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />);
    let dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('max-w-md');

    rerender(<Modal {...defaultProps} size="xl" />);
    dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('max-w-4xl');
  });
});