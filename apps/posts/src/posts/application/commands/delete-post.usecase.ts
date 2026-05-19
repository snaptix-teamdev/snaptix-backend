import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '@snaptix/common';
import { POSTS_ERRORS } from '@snaptix/contracts';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsEventPublisher } from '../../../infrastructure/rabbitmq/posts-event.publisher';

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
    private postsEventPublisher: PostsEventPublisher,
  ) {}

  async execute({ dto }: DeletePostCommand): Promise<void> {
    const post = await this.postsRepository.findById(dto.postId);

    if (!post) {
      throw new DomainException(POSTS_ERRORS.POST_NOT_FOUND);
    }

    if (!post.isOwner(dto.userId)) {
      throw new DomainException(POSTS_ERRORS.POST_FORBIDDEN);
    }

    await this.postsRepository.softDelete(post.id);

    await this.postsEventPublisher.postDeleted({
      postId: post.id,
      userId: post.userId,
    });
  }
}
