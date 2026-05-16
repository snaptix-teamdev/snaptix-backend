import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { BulkDomainException, FileEntityType, IPost } from '@snaptix/common';
import {
  BulkLinkFilesToEntityMsResponseDto,
  BulkLinkFilesToEntityPayload,
  FILES_MICROSERVICE_PATTERNS,
  MICROSERVICE_NAME,
} from '@snaptix/contracts';
import { PostEntity } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import * as uuid from 'uuid';

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
  constructor(
    private postsRepository: PostsRepository,
    @Inject(MICROSERVICE_NAME.FILES) private filesClient: ClientProxy,
  ) {}
  async execute({ dto }: CreatePostCommand): Promise<Pick<IPost, 'id'>> {
    // TODO outbox pattern

    const postId = uuid.v7();

    const payload: BulkLinkFilesToEntityPayload = {
      userId: dto.userId,
      fileIds: dto.media.map((m) => m.fileId),
      entityId: postId,
      entityType: FileEntityType.POST_PHOTO,
    };

    //TODO вынести в infrastructure
    const result = await firstValueFrom(
      this.filesClient.send<BulkLinkFilesToEntityMsResponseDto>(
        FILES_MICROSERVICE_PATTERNS.FILES.BULK_LINK_FILES_TO_ENTITY,
        payload,
      ),
    );

    if (result.failed.length > 0) {
      throw new BulkDomainException(result.failed);
    }

    const storageKeyByFileId = new Map(
      result.succeeded.map((s) => [s.fileId, s.storageKey]),
    );

    const post = PostEntity.create({
      id: postId,
      userId: dto.userId,
      description: dto.description,
      media: dto.media.map(({ fileId }) => ({
        fileId,
        storageKey: storageKeyByFileId.get(fileId) as string,
      })),
    });

    const savedPost = await this.postsRepository.create(post);

    return { id: savedPost.id };
  }
}
