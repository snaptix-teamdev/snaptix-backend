export interface GetUploadUrlResponseDto {
  fileId: string;
  url: string;
  fields: Record<string, string>;
}
