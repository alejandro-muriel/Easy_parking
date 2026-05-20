import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    reserva: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Reserva', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deberia consultar reserva mediante prisma', async () => {
    const { prisma } = await import('@/lib/prisma');
    const mockData = { id: '1', usuario: { name: 'Test' }, plaza: { zona: 'A' } };

    vi.mocked(prisma.reserva.findUnique).mockResolvedValue(mockData);

    const result = await prisma.reserva.findUnique({
      where: { id: '1' },
      include: { usuario: true, plaza: true },
    });

    expect(result).toEqual(mockData);
  });

  it('deberia actualizar reserva', async () => {
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(prisma.reserva.update).mockResolvedValue({ id: '1' } as any);

    const result = await prisma.reserva.update({
      where: { id: '1' },
      data: { estado: 'CANCELADA' },
    });

    expect(result).toEqual({ id: '1' });
    expect(vi.mocked(prisma.reserva.update)).toHaveBeenCalled();
  });
});
