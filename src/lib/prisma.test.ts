const PrismaClientMock = vi.fn(function PrismaClientMockImpl() {
  return { _tag: 'prisma-client' };
});

vi.mock('@prisma/client', () => ({
  PrismaClient: PrismaClientMock,
}));

describe('prisma singleton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    delete (globalThis as Record<string, unknown>).prismaGlobal;
  });

  it('reutiliza prismaGlobal cuando ya existe', async () => {
    const existing = { existing: true };
    (globalThis as Record<string, unknown>).prismaGlobal = existing;

    const mod = await import('./prisma');

    expect(mod.prisma).toBe(existing);
    expect(PrismaClientMock).not.toHaveBeenCalled();
  });

  it('crea instancia y la guarda en global en no-producción', async () => {
    process.env.NODE_ENV = 'development';

    const mod = await import('./prisma');

    expect(PrismaClientMock).toHaveBeenCalledTimes(1);
    expect(mod.prisma).toEqual({ _tag: 'prisma-client' });
    expect((globalThis as Record<string, unknown>).prismaGlobal).toEqual({
      _tag: 'prisma-client',
    });
  });
});
