import { GET } from '@/app/api/positions/route';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('/api/positions', () => {
  beforeEach(() => {
    // Reset des mocks avant chaque test
    jest.clearAllMocks();
    
    // Configuration des variables d'environnement
    process.env.API_KEY = 'test_api_key';
    process.env.SECRET_KEY = 'test_secret_key';
  });

  it('devrait retourner les positions du compte perpetual', async () => {
    // Mock de la réponse axios
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            positionId: '123456',
            symbol: 'BTC-USDT',
            positionSide: 'LONG',
            positionAmt: '0.5',
            avgPrice: '45000.00',
            markPrice: '46000.00',
            unrealizedProfit: '500.00',
            leverage: 10,
            isolated: false,
            percentage: '2.22'
          },
          {
            positionId: '789012',
            symbol: 'ETH-USDT',
            positionSide: 'SHORT',
            positionAmt: '-2.0',
            avgPrice: '2650.00',
            markPrice: '2600.00',
            unrealizedProfit: '100.00',
            leverage: 5,
            isolated: true,
            percentage: '1.89'
          }
        ]
      }
    });

    const request = new Request('http://localhost:3000/api/positions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data).toHaveLength(2);
    
    // Vérifier la première position
    const firstPosition = data.data[0];
    expect(firstPosition).toHaveProperty('positionId');
    expect(firstPosition).toHaveProperty('symbol');
    expect(firstPosition).toHaveProperty('positionSide');
    expect(firstPosition).toHaveProperty('positionAmt');
    expect(firstPosition.symbol).toBe('BTC-USDT');
    expect(firstPosition.positionSide).toBe('LONG');
    
    // Vérifier que l'API a été appelée
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/openApi/swap/v2/user/positions'),
      expect.objectContaining({
        headers: { 'X-BX-APIKEY': 'test_api_key' }
      })
    );
  });

  it('devrait retourner les positions filtrées par symbole', async () => {
    // Mock de la réponse axios
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            positionId: '123456',
            symbol: 'BTC-USDT',
            positionSide: 'LONG',
            positionAmt: '0.5',
            avgPrice: '45000.00',
            markPrice: '46000.00',
            unrealizedProfit: '500.00',
            leverage: 10,
            isolated: false
          }
        ]
      }
    });

    const request = new Request('http://localhost:3000/api/positions?symbol=BTC-USDT');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].symbol).toBe('BTC-USDT');
    
    // Vérifier que l'API a été appelée avec le paramètre symbol
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('symbol=BTC-USDT'),
      expect.objectContaining({
        headers: { 'X-BX-APIKEY': 'test_api_key' }
      })
    );
  });

  it('devrait retourner un tableau vide quand il n\'y a pas de positions', async () => {
    // Mock de la réponse axios avec tableau vide
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: []
      }
    });

    const request = new Request('http://localhost:3000/api/positions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data).toHaveLength(0);
  });

  it('devrait gérer les erreurs d\'API quand les clés sont manquantes', async () => {
    // Supprimer les clés API pour simuler une erreur
    delete process.env.API_KEY;
    delete process.env.SECRET_KEY;

    const request = new Request('http://localhost:3000/api/positions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('API keys not configured');
    
    // Vérifier que axios n'a pas été appelé
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('devrait gérer les erreurs d\'axios', async () => {
    // Mock d'une erreur axios
    mockedAxios.get.mockRejectedValue(new Error('API rate limit exceeded'));

    const request = new Request('http://localhost:3000/api/positions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('API rate limit exceeded');
    
    // Vérifier que l'API a été appelée
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('devrait valider la structure des données de position', async () => {
    // Mock de la réponse axios avec une position complète
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            positionId: '123456',
            symbol: 'BTC-USDT',
            positionSide: 'LONG',
            positionAmt: '0.5',
            avgPrice: '45000.00',
            markPrice: '46000.00',
            unrealizedProfit: '500.00',
            leverage: 10,
            isolated: false,
            percentage: '2.22',
            marginRatio: '15.5',
            maintMarginRatio: '0.5'
          }
        ]
      }
    });

    const request = new Request('http://localhost:3000/api/positions');
    const response = await GET(request);
    const data = await response.json();

    const position = data.data[0];
    
    // Vérifier les propriétés obligatoires
    expect(position).toHaveProperty('positionId');
    expect(position).toHaveProperty('symbol');
    expect(position).toHaveProperty('positionSide');
    expect(position).toHaveProperty('positionAmt');
    expect(position).toHaveProperty('avgPrice');
    expect(position).toHaveProperty('markPrice');
    expect(position).toHaveProperty('unrealizedProfit');
    expect(position).toHaveProperty('leverage');
    expect(position).toHaveProperty('isolated');
    
    // Vérifier les types
    expect(typeof position.positionId).toBe('string');
    expect(typeof position.symbol).toBe('string');
    expect(['LONG', 'SHORT'].includes(position.positionSide)).toBe(true);
    expect(typeof position.leverage).toBe('number');
    expect(typeof position.isolated).toBe('boolean');
    
    // Vérifier que les valeurs numériques peuvent être parsées
    expect(parseFloat(position.positionAmt)).not.toBeNaN();
    expect(parseFloat(position.avgPrice)).not.toBeNaN();
    expect(parseFloat(position.markPrice)).not.toBeNaN();
  });
});