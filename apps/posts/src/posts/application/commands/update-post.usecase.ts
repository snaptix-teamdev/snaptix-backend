import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '@snaptix/common';
import { POSTS_ERRORS } from '@snaptix/contracts';
import { PostsRepository } from '../../infrastructure/posts.repository';

class UpdatePostCommandRequest {
  postId: string;
  userId: string;
  description: string | null;
}

export class UpdatePostCommand extends Command<void> {
  constructor(public dto: UpdatePostCommandRequest) {
    super();
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<
  UpdatePostCommand,
  void
> {
  constructor(private postsRepository: PostsRepository) {}

  async execute({ dto }: UpdatePostCommand): Promise<void> {
    const post = await this.postsRepository.findById(dto.postId);

    if (!post) {
      throw new DomainException(POSTS_ERRORS.POST_NOT_FOUND);
    }

    if (!post.isOwner(dto.userId)) {
      throw new DomainException(POSTS_ERRORS.POST_FORBIDDEN);
    }

    post.update({ description: dto.description });

    await this.postsRepository.update(post);
  }
}
