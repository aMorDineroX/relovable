import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountTypeSelector from '@/components/AccountTypeSelector';

describe('AccountTypeSelector', () => {
  const mockOnAccountTypeChange = jest.fn();

  beforeEach(() => {
    mockOnAccountTypeChange.mockClear();
  });

  it('devrait afficher le composant avec la valeur perpetual', () => {
    render(
      <AccountTypeSelector 
        accountType="perpetual" 
        onAccountTypeChange={mockOnAccountTypeChange} 
      />
    );
    
    expect(screen.getByText('Type de Compte Futures')).toBeInTheDocument();
    expect(screen.getByText('Perpetual Futures')).toBeInTheDocument();
    expect(screen.getByText('Standard Futures')).toBeInTheDocument();
    expect(screen.getByText('Perpetual')).toBeInTheDocument();
    
    // Vérifier que le bouton perpetual a les bonnes classes
    const perpetualButton = screen.getByRole('button', { name: /perpetual futures/i });
    expect(perpetualButton).toHaveClass('bg-blue-500/20', 'border-blue-400');
  });

  it('devrait afficher le composant avec la valeur standard', () => {
    render(
      <AccountTypeSelector 
        accountType="standard" 
        onAccountTypeChange={mockOnAccountTypeChange} 
      />
    );
    
    expect(screen.getByText('Standard')).toBeInTheDocument();
    
    // Vérifier que le bouton standard a les bonnes classes
    const standardButton = screen.getByRole('button', { name: /standard futures/i });
    expect(standardButton).toHaveClass('bg-orange-500/20', 'border-orange-400');
    
    // Vérifier que le bouton perpetual n'est pas sélectionné
    const perpetualButton = screen.getByRole('button', { name: /perpetual futures/i });
    expect(perpetualButton).toHaveClass('bg-white/5', 'border-white/10');
  });

  it('devrait appeler onAccountTypeChange quand on clique sur perpetual', () => {
    render(
      <AccountTypeSelector 
        accountType="standard" 
        onAccountTypeChange={mockOnAccountTypeChange} 
      />
    );
    
    const perpetualButton = screen.getByRole('button', { name: /perpetual futures/i });
    fireEvent.click(perpetualButton);
    
    expect(mockOnAccountTypeChange).toHaveBeenCalledTimes(1);
    expect(mockOnAccountTypeChange).toHaveBeenCalledWith('perpetual');
  });

  it('devrait appeler onAccountTypeChange quand on clique sur standard', () => {
    render(
      <AccountTypeSelector 
        accountType="perpetual" 
        onAccountTypeChange={mockOnAccountTypeChange} 
      />
    );
    
    const standardButton = screen.getByRole('button', { name: /standard futures/i });
    fireEvent.click(standardButton);
    
    expect(mockOnAccountTypeChange).toHaveBeenCalledTimes(1);
    expect(mockOnAccountTypeChange).toHaveBeenCalledWith('standard');
  });

  it('devrait afficher les descriptions des types de compte', () => {
    render(
      <AccountTypeSelector 
        accountType="perpetual" 
        onAccountTypeChange={mockOnAccountTypeChange} 
      />
    );
    
    expect(screen.getByText('Contrats sans expiration')).toBeInTheDocument();
    expect(screen.getByText('Contrats avec expiration')).toBeInTheDocument();
  });

  it('devrait afficher les endpoints appropriés selon le type sélectionné', () => {
    const { rerender } = render(
      <AccountTypeSelector 
        accountType="perpetual" 
        onAccountTypeChange={mockOnAccountTypeChange} 
      />
    );
    
    expect(screen.getByText('/openApi/swap/v2/...')).toBeInTheDocument();
    
    rerender(
      <AccountTypeSelector 
        accountType="standard" 
        onAccountTypeChange={mockOnAccountTypeChange} 
      />
    );
    
    expect(screen.getByText('/openApi/futures/v1/...')).toBeInTheDocument();
  });

  it('devrait afficher l\'indicateur visuel du type sélectionné', () => {
    const { rerender } = render(
      <AccountTypeSelector 
        accountType="perpetual" 
        onAccountTypeChange={mockOnAccountTypeChange} 
      />
    );
    
    // Vérifier l'indicateur bleu pour perpetual
    const perpetualIndicator = document.querySelector('.bg-blue-400');
    expect(perpetualIndicator).toBeInTheDocument();
    
    rerender(
      <AccountTypeSelector 
        accountType="standard" 
        onAccountTypeChange={mockOnAccountTypeChange} 
      />
    );
    
    // Vérifier l'indicateur orange pour standard
    const standardIndicator = document.querySelector('.bg-orange-400');
    expect(standardIndicator).toBeInTheDocument();
  });

  it('devrait avoir les bonnes classes CSS de base', () => {
    const { container } = render(
      <AccountTypeSelector 
        accountType="perpetual" 
        onAccountTypeChange={mockOnAccountTypeChange} 
      />
    );
    
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-white/10', 'backdrop-blur-sm', 'border', 'border-white/20', 'rounded-lg', 'p-4', 'mb-6');
  });
});