import { IUser } from '@snaptix/common';

export class GetMePayload implements Pick<IUser, 'id'> {
  id: string;
}
