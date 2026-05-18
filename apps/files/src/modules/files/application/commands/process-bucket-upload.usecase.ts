// import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { Logger } from '@nestjs/common';
// import { FilesRepository } from '../../infrastructure/files.repository';
// import { FileVariantsRepository } from '../../infrastructure/file-variants.repository';
// import { S3Service } from '../../../../infrastructure/s3/s3.service';
//
// // const IMAGE_VARIANTS = [
// //   { width: 30, height: 30 },
// //   { width: 300, height: 300 },
// //   { width: 600, height: 600 },
// // ] as const;
//
// class ProcessMainUploadCommandRequest {
//   storageKey: string;
// }
//
// export class ProcessMainUploadCommand extends Command<void> {
//   constructor(public readonly dto: ProcessMainUploadCommandRequest) {
//     super();
//   }
// }
//
// @CommandHandler(ProcessMainUploadCommand)
// export class ProcessBucketUploadUseCase implements ICommandHandler<
//   ProcessMainUploadCommand,
//   void
// > {
//   private readonly logger = new Logger(ProcessBucketUploadUseCase.name);
//
//   constructor(
//     private readonly filesRepository: FilesRepository,
//     private readonly fileVariantsRepository: FileVariantsRepository,
//     private readonly s3Service: S3Service,
//   ) {}
//
//   async execute({ dto }: ProcessMainUploadCommand): Promise<void> {
//     this.logger.log(`Processing main upload: ${dto.storageKey}`);
//
//     // const file = await this.filesRepository.findByStorageKey(
//     //   dto.storageKey,
//     // );
//     //
//     // if (!file) {
//     //   this.logger.warn(
//     //     `FileRecord not found for storageKey: ${dto.storageKey}`,
//     //   );
//     //   return;
//     // }
//     //
//     // if (file.fileSize && file.fileSize > BigInt(MAX_FILE_SIZE)) {
//     //   this.logger.warn(`File too large: ${file.fileSize} bytes`);
//     //   file.markInvalid();
//     //   await this.filesRepository.update(file);
//     //   return;
//     // }
//     //
//     // if (file.mimeType.startsWith('image/')) {
//     //   try {
//     //     this.logger.log(`Downloading buffer for resize: ${dto.storageKey}`);
//     //     const buffer = await this.s3Service.getObjectBufferLength(dto.storageKey);
//     //
//     //     for (const { width, height } of IMAGE_VARIANTS) {
//     //       this.logger.log(`Resizing to ${width}x${height}`);
//     //       const resized = await sharp(buffer)
//     //         .resize(width, height, {
//     //           fit: 'contain',
//     //           background: { r: 50, g: 50, b: 50, alpha: 1 },
//     //         })
//     //         .webp()
//     //         .toBuffer();
//     //
//     //       const variantKey = `${dto.storageKey}_${width}x${height}.webp`;
//     //
//     //       await this.s3Service.putObject(variantKey, resized, 'image/webp');
//     //       this.logger.log(`Variant saved to S3: ${variantKey}`);
//     //
//     //       const variant = FileVariantEntity.create({
//     //         fileRecordId: file.id,
//     //         width,
//     //         height,
//     //         storageKey: variantKey,
//     //       });
//     //
//     //       await this.fileVariantsRepository.create(variant);
//     //       this.logger.log(`Variant saved to DB: ${variantKey}`);
//     //     }
//     //
//     //     file.markValid();
//     //     this.logger.log(`File processed successfully: ${dto.storageKey}`);
//     //   } catch (err) {
//     //     this.logger.error(`Failed to process image: ${dto.storageKey}`, err);
//     //     file.markInvalid();
//     //   }
//     // } else {
//     //   file.markValid();
//     //   this.logger.log(`Non-image file marked valid: ${dto.storageKey}`);
//     // }
//     //
//     // await this.filesRepository.update(file);
//   }
// }
