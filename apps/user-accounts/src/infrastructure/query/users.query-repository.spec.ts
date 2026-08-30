import { UsersQueryRepository } from './users.query-repository';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersQueryRepository.findByIdWithProfile', () => {
  let repository: UsersQueryRepository;
  let findUnique: jest.Mock;

  const userId = '0199b0e8-0000-7000-8000-000000000001';

  const user = {
    id: userId,
    username: 'some-username',
    profile: { firstName: 'Ivan' },
  };

  beforeEach(() => {
    findUnique = jest.fn();

    const prisma = { user: { findUnique } } as unknown as PrismaService;

    repository = new UsersQueryRepository(prisma);
  });

  it('ищет неудалённого юзера вместе с профилем', async () => {
    findUnique.mockResolvedValue(user);

    await repository.findByIdWithProfile(userId);

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: userId, deletedAt: null },
      include: { profile: true },
    });
  });

  it('возвращает юзера с загруженным профилем', async () => {
    findUnique.mockResolvedValue(user);

    await expect(repository.findByIdWithProfile(userId)).resolves.toEqual(user);
  });

  it('возвращает null, когда юзера нет', async () => {
    findUnique.mockResolvedValue(null);

    await expect(repository.findByIdWithProfile(userId)).resolves.toBeNull();
  });

  it('бросает, когда профиль отсутствует — это нарушенная консистентность', async () => {
    findUnique.mockResolvedValue({ ...user, profile: null });

    await expect(repository.findByIdWithProfile(userId)).rejects.toThrow(
      'User: required relation "profile" is not loaded or missing in database',
    );
  });
});
