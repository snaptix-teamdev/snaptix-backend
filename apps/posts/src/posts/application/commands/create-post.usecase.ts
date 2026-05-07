import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IPost } from '@snaptix/common';
import { PostEntity } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';

class CreatePostCommandRequest {
  userId: string;
  description: string | null;
  media: { fileId: string }[];
}

export class CreatePostCommand extends Command<Pick<IPost, 'id'>> {
  constructor(public dto: CreatePostCommandRequest) {
    super();
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<
  CreatePostCommand,
  Pick<IPost, 'id'>
> {
  constructor(private postsRepository: PostsRepository) {}

  async execute({ dto }: CreatePostCommand): Promise<Pick<IPost, 'id'>> {
    //TODO: добавить RPC в микросервис files для проверки существования файлов и смены статуса
    // Если файлы отсутствуют то выкинуть ошибку

    const post = PostEntity.create({
      userId: dto.userId,
      description: dto.description,
      media: dto.media.map((a) => a.fileId),
    });

    const savedPost = await this.postsRepository.create(post);

    return { id: savedPost.id };
  }
}
