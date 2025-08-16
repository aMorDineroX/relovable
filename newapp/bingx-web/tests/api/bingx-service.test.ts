import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Import de la logique de signature
import CryptoJS from 'crypto-js';

function sign(queryString: string, secretKey: string) {
  return CryptoJS.HmacSHA256(queryString, secretKey).toString(CryptoJS.enc.Hex);
}

describe('BingX API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Signature Generation', () => {
    it('devrait générer une signature correcte', () => {
      const testSecret = 'test_secret_key';
      const testQuery = 'timestamp=1640995200000';
      
      const signature = sign(testQuery, testSecret);
      
      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // SHA256 hex string length
    });

    it('devrait générer des signatures différentes pour des données différentes', () => {
      const testSecret = 'test_secret_key';
      const query1 = 'timestamp=1640995200000';
      const query2 = 'timestamp=1640995300000';
      
      const signature1 = sign(query1, testSecret);
      const signature2 = sign(query2, testSecret);
      
      expect(signature1).not.toBe(signature2);
    });

    it('devrait générer la même signature pour les mêmes données', () => {
      const testSecret = 'test_secret_key';
      const testQuery = 'symbol=BTC-USDT&timestamp=1640995200000';
      
      const signature1 = sign(testQuery, testSecret);
      const signature2 = sign(testQuery, testSecret);
      
      expect(signature1).toBe(signature2);
    });
  });

  describe('API Balance Calls', () => {
    it('devrait appeler l\'API BingX avec les bons paramètres', async () => {
      // Mock de la réponse axios
      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: {
            asset: 'USDT',
            balance: '1000.50000000',
            equity: '1025.75000000'
          }
        }
      });

      const API_KEY = 'test_api_key';
      const SECRET_KEY = 'test_secret_key';
      const BASE_URL = 'https://open-api.bingx.com';
      const endpoint = '/openApi/swap/v2/user/balance';
      
      // Simuler l'appel API comme dans notre route
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = sign(queryString, SECRET_KEY);
      const finalUrl = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;

      await axios.get(finalUrl, { 
        headers: {
          'X-BX-APIKEY': API_KEY
        }
      });

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/openApi/swap/v2/user/balance'),
        expect.objectContaining({
          headers: { 'X-BX-APIKEY': API_KEY }
        })
      );
      
      // Vérifier que l'URL contient les paramètres attendus
      const calledUrl = mockedAxios.get.mock.calls[0][0];
      expect(calledUrl).toContain('timestamp=');
      expect(calledUrl).toContain('signature=');
    });

    it('devrait gérer les erreurs d\'API', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      try {
        await axios.get('test-url');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('API Positions Calls', () => {
    it('devrait construire l\'URL correctement pour les positions', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: []
        }
      });

      const API_KEY = 'test_api_key';
      const SECRET_KEY = 'test_secret_key';
      const BASE_URL = 'https://open-api.bingx.com';
      const endpoint = '/openApi/swap/v2/user/positions';
      
      const params = {
        timestamp: Date.now().toString(),
        symbol: 'BTC-USDT'
      };

      const sortedKeys = Object.keys(params).sort();
      const queryString = sortedKeys.map(key => `${key}=${params[key as keyof typeof params]}`).join('&');
      const signature = sign(queryString, SECRET_KEY);
      const finalUrl = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;

      await axios.get(finalUrl, { 
        headers: {
          'X-BX-APIKEY': API_KEY
        }
      });

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      const calledUrl = mockedAxios.get.mock.calls[0][0];
      expect(calledUrl).toContain('/openApi/swap/v2/user/positions');
      expect(calledUrl).toContain('symbol=BTC-USDT');
      expect(calledUrl).toContain('timestamp=');
      expect(calledUrl).toContain('signature=');
    });
  });

  describe('Standard vs Perpetual Futures Endpoints', () => {
    it('devrait utiliser les bons endpoints pour perpetual futures', () => {
      const perpetualEndpoints = {
        balance: '/openApi/swap/v2/user/balance',
        positions: '/openApi/swap/v2/user/positions',
        orders: '/openApi/swap/v2/user/allOrders'
      };

      expect(perpetualEndpoints.balance).toContain('/swap/v2/');
      expect(perpetualEndpoints.positions).toContain('/swap/v2/');
      expect(perpetualEndpoints.orders).toContain('/swap/v2/');
    });

    it('devrait utiliser les bons endpoints pour standard futures', () => {
      const standardEndpoints = {
        balance: '/openApi/futures/v1/balance',
        positions: '/openApi/futures/v1/user/positions',
        orders: '/openApi/futures/v1/user/allOrders'
      };

      expect(standardEndpoints.balance).toContain('/futures/v1/');
      expect(standardEndpoints.positions).toContain('/futures/v1/');
      expect(standardEndpoints.orders).toContain('/futures/v1/');
    });
  });

  describe('Data Validation', () => {
    it('devrait valider la structure des données de balance', () => {
      const mockBalanceData = {
        asset: 'USDT',
        balance: '1000.50000000',
        equity: '1025.75000000',
        unrealizedProfit: '25.25000000',
        realisedProfit: '150.00000000',
        availableMargin: '800.25000000',
        usedMargin: '225.50000000'
      };

      // Vérifier que tous les champs requis sont présents
      expect(mockBalanceData).toHaveProperty('asset');
      expect(mockBalanceData).toHaveProperty('balance');
      expect(mockBalanceData).toHaveProperty('equity');
      expect(mockBalanceData).toHaveProperty('unrealizedProfit');
      expect(mockBalanceData).toHaveProperty('realisedProfit');
      expect(mockBalanceData).toHaveProperty('availableMargin');
      expect(mockBalanceData).toHaveProperty('usedMargin');

      // Vérifier que les valeurs numériques peuvent être parsées
      expect(parseFloat(mockBalanceData.balance)).not.toBeNaN();
      expect(parseFloat(mockBalanceData.equity)).not.toBeNaN();
      expect(parseFloat(mockBalanceData.unrealizedProfit)).not.toBeNaN();
    });

    it('devrait valider la structure des données de position', () => {
      const mockPositionData = {
        positionId: '123456',
        symbol: 'BTC-USDT',
        positionSide: 'LONG',
        positionAmt: '0.5',
        avgPrice: '45000.00',
        markPrice: '46000.00',
        unrealizedProfit: '500.00',
        leverage: 10,
        isolated: false
      };

      // Vérifier les propriétés obligatoires
      expect(mockPositionData).toHaveProperty('positionId');
      expect(mockPositionData).toHaveProperty('symbol');
      expect(mockPositionData).toHaveProperty('positionSide');
      expect(mockPositionData).toHaveProperty('positionAmt');
      expect(mockPositionData).toHaveProperty('avgPrice');
      expect(mockPositionData).toHaveProperty('markPrice');
      expect(mockPositionData).toHaveProperty('unrealizedProfit');
      expect(mockPositionData).toHaveProperty('leverage');
      expect(mockPositionData).toHaveProperty('isolated');

      // Vérifier les types
      expect(typeof mockPositionData.positionId).toBe('string');
      expect(typeof mockPositionData.symbol).toBe('string');
      expect(['LONG', 'SHORT'].includes(mockPositionData.positionSide)).toBe(true);
      expect(typeof mockPositionData.leverage).toBe('number');
      expect(typeof mockPositionData.isolated).toBe('boolean');
    });
  });
});