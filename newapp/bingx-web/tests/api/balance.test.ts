import { GET } from '@/app/api/balance/route';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('/api/balance', () => {
  beforeEach(() => {
    // Reset des mocks avant chaque test
    jest.clearAllMocks();
    
    // Configuration des variables d'environnement
    process.env.API_KEY = 'test_api_key';
    process.env.SECRET_KEY = 'test_secret_key';
  });

  it('devrait retourner le balance du compte perpetual', async () => {
    // Mock de la réponse axios
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          asset: 'USDT',
          balance: '1000.50000000',
          equity: '1025.75000000',
          unrealizedProfit: '25.25000000',
          realisedProfit: '150.00000000',
          availableMargin: '800.25000000',
          usedMargin: '225.50000000'
        }
      }
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('asset');
    expect(data.data).toHaveProperty('balance');
    expect(data.data).toHaveProperty('equity');
    expect(data.data.asset).toBe('USDT');
    
    // Vérifier que l'API a été appelée
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/openApi/swap/v2/user/balance'),
      expect.objectContaining({
        headers: { 'X-BX-APIKEY': 'test_api_key' }
      })
    );
  });

  it('devrait gérer les erreurs d\'API quand les clés sont manquantes', async () => {
    // Supprimer les clés API pour simuler une erreur
    delete process.env.API_KEY;
    delete process.env.SECRET_KEY;

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('API keys not configured');
    
    // Vérifier que axios n'a pas été appelé
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('devrait gérer les erreurs d\'axios', async () => {
    // Mock d'une erreur axios
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Network error');
    
    // Vérifier que l'API a été appelée
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('devrait valider la structure des données de balance', async () => {
    // Mock de la réponse axios avec tous les champs attendus
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          asset: 'USDT',
          balance: '1000.50000000',
          equity: '1025.75000000',
          unrealizedProfit: '25.25000000',
          realisedProfit: '150.00000000',
          availableMargin: '800.25000000',
          usedMargin: '225.50000000'
        }
      }
    });

    const response = await GET();
    const data = await response.json();

    expect(data.data).toHaveProperty('asset');
    expect(data.data).toHaveProperty('balance');
    expect(data.data).toHaveProperty('equity');
    expect(data.data).toHaveProperty('unrealizedProfit');
    expect(data.data).toHaveProperty('realisedProfit');
    expect(data.data).toHaveProperty('availableMargin');
    expect(data.data).toHaveProperty('usedMargin');

    // Vérifier que les valeurs sont des chaînes de nombres
    expect(typeof data.data.balance).toBe('string');
    expect(parseFloat(data.data.balance)).not.toBeNaN();
    expect(parseFloat(data.data.equity)).not.toBeNaN();
  });
});