import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { DomainException } from '@snaptix/common';

@Catch(DomainException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): any {
    console.log('catch');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { stack, ...res } = exception;
    console.log(res);

    // const rpc = host.switchToRpc()
    // console.log(rpc.getData());
    // console.log(rpc.getContext());
    return host.switchToHttp().getResponse<Response>();
  }
}
