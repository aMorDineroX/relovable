import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MultiAssetsManagement from '../components/MultiAssetsManagement';

// Mock fetch
global.fetch = jest.fn();

// Mock des icônes Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  CurrencyDollarIcon: ({ className }: { className: string }) => <div className={className} data-testid="currency-icon" />,
  ArrowPathIcon: ({ className }: { className: string }) => <div className={className} data-testid="refresh-icon" />,
  CheckCircleIcon: ({ className }: { className: string }) => <div className={className} data-testid="check-icon" />,
  ExclamationTriangleIcon: ({ className }: { className: string }) => <div className={className} data-testid="warning-icon" />,
  ChartBarIcon: ({ className }: { className: string }) => <div className={className} data-testid="chart-icon" />,
  CogIcon: ({ className }: { className: string }) => <div className={className} data-testid="cog-icon" />,
}));

describe('MultiAssetsManagement', () => {
  beforeEach(() => {
    // Reset des mocks avant chaque test
    (fetch as jest.Mock).mockClear();
  });

  test('devrait rendre sans erreur même quand les APIs échouent', async () => {
    // Mock des réponses API qui échouent
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    expect(() => {
      render(<MultiAssetsManagement />);
    }).not.toThrow();

    // Vérifier que le titre est affiché
    expect(screen.getByText('Gestion Multi-Assets')).toBeInTheDocument();
  });

  test('devrait initialiser avec des valeurs par défaut sûres', () => {
    // Mock des réponses API qui échouent
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<MultiAssetsManagement />);

    // Le composant devrait s'afficher avec l'état de chargement
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  test('devrait gérer les réponses API avec des données manquantes', async () => {
    // Mock d'une réponse API avec des données partielles
    (fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        success: true,
        data: null // Données manquantes
      })
    });

    expect(() => {
      render(<MultiAssetsManagement />);
    }).not.toThrow();
  });

  test('devrait avoir un bouton actualiser fonctionnel', () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<MultiAssetsManagement />);

    const refreshButton = screen.getByText('Actualiser');
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).not.toBeDisabled();
  });
});
