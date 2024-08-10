import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';

interface classConstructor {
  new (...arg: any[]): any;
}

export function Serialize(dto: classConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private Dto: any) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // run data before the request is sent to request handler
    // console.log('i am running before handler');

    return next.handle().pipe(
      map((data: any) => {
        //run some code before response sent out
        // console.log('i am running before data sent out', data);
        //plainToInstance === plainToClass
        return plainToInstance(this.Dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
