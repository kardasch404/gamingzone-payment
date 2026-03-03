import { generateUuidV7 } from './uuid.util';

describe('UUID Utility', () => {
  it('should generate valid UUIDv7', () => {
    const uuid = generateUuidV7();
    expect(uuid).toBeDefined();
    expect(typeof uuid).toBe('string');
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should generate unique UUIDs', () => {
    const uuid1 = generateUuidV7();
    const uuid2 = generateUuidV7();
    expect(uuid1).not.toBe(uuid2);
  });
});
