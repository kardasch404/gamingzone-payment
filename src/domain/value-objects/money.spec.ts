import { Money } from './money';

describe('Money', () => {
  describe('constructor', () => {
    it('should create money with valid values', () => {
      const money = new Money(100, 'MAD');
      expect(money.value).toBe(100);
      expect(money.currency).toBe('MAD');
    });

    it('should throw error for negative value', () => {
      expect(() => new Money(-100, 'MAD')).toThrow('Money value cannot be negative');
    });

    it('should throw error for invalid currency', () => {
      expect(() => new Money(100, 'US')).toThrow('Invalid currency code');
    });
  });

  describe('add', () => {
    it('should add two money objects with same currency', () => {
      const money1 = new Money(100, 'MAD');
      const money2 = new Money(50, 'MAD');
      const result = money1.add(money2);
      expect(result.value).toBe(150);
      expect(result.currency).toBe('MAD');
    });

    it('should throw error for different currencies', () => {
      const money1 = new Money(100, 'MAD');
      const money2 = new Money(50, 'USD');
      expect(() => money1.add(money2)).toThrow('Cannot operate on different currencies');
    });
  });

  describe('subtract', () => {
    it('should subtract two money objects', () => {
      const money1 = new Money(100, 'MAD');
      const money2 = new Money(30, 'MAD');
      const result = money1.subtract(money2);
      expect(result.value).toBe(70);
    });
  });

  describe('isGreaterThan', () => {
    it('should return true when value is greater', () => {
      const money1 = new Money(100, 'MAD');
      const money2 = new Money(50, 'MAD');
      expect(money1.isGreaterThan(money2)).toBe(true);
    });

    it('should return false when value is not greater', () => {
      const money1 = new Money(50, 'MAD');
      const money2 = new Money(100, 'MAD');
      expect(money1.isGreaterThan(money2)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for equal money', () => {
      const money1 = new Money(100, 'MAD');
      const money2 = new Money(100, 'MAD');
      expect(money1.equals(money2)).toBe(true);
    });

    it('should return false for different values', () => {
      const money1 = new Money(100, 'MAD');
      const money2 = new Money(50, 'MAD');
      expect(money1.equals(money2)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const money1 = new Money(100, 'MAD');
      const money2 = new Money(100, 'USD');
      expect(money1.equals(money2)).toBe(false);
    });
  });
});
