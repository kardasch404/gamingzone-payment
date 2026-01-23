import appConfig from './app.config';
import stripeConfig from './stripe.config';
import databaseConfig from './database.config';

describe('Config', () => {
  describe('appConfig', () => {
    it('should return app configuration', () => {
      const config = appConfig();
      expect(config).toHaveProperty('port');
      expect(config).toHaveProperty('environment');
    });
  });

  describe('stripeConfig', () => {
    it('should return stripe configuration', () => {
      const config = stripeConfig();
      expect(config).toHaveProperty('secretKey');
      expect(config).toHaveProperty('publishableKey');
      expect(config).toHaveProperty('webhookSecret');
      expect(config).toHaveProperty('successUrl');
      expect(config).toHaveProperty('cancelUrl');
    });
  });

  describe('databaseConfig', () => {
    it('should return database configuration', () => {
      const config = databaseConfig();
      expect(config).toHaveProperty('url');
    });
  });
});
