import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '@snaptix/common';
import { POSTS_ERRORS } from '@snaptix/contracts';
import { TransactionManager } from '../../../infrastructure/prisma/transaction.manager';
import { PostsOutboxPublisher } from '../../infrastructure/posts-outbox.publisher';
import { PostsRepository } from '../../infrastructure/posts.repository';

class DeletePostCommandRequest {
  postId: string;
  userId: string;
}

export class DeletePostCommand extends Command<void> {
  constructor(public dto: DeletePostCommandRequest) {
    super();
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<
  DeletePostCommand,
  void
> {
  constructor(
    private postsRepository: PostsRepository,
    private postsOutboxPublisher: PostsOutboxPublisher,
    private transactionManager: TransactionManager,
  ) {}

  async execute({ dto }: DeletePostCommand): Promise<void> {
    const post = await this.postsRepository.findById(dto.postId);

    if (!post) {
      throw new DomainException(POSTS_ERRORS.POST_NOT_FOUND);
    }

    if (!post.isOwner(dto.userId)) {
      throw new DomainException(POSTS_ERRORS.POST_FORBIDDEN);
    }

    await this.transactionManager.run(async (tx) => {
      await this.postsRepository.softDelete(post.id, tx);
      await this.postsOutboxPublisher.postDeleted(
        { postId: post.id, userId: post.userId },
        tx,
      );
    });
  }
}
