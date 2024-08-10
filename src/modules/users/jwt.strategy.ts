// jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from './entities/user.entity';
import { PayloadInterface } from './interfaces/payload.interface';
import { UsersService } from './users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: `${process.env.JWT_SECRET}`,
    });
  }

  async validate(payload: PayloadInterface) {
    const user: User = await this.userService.findOneById(payload._id);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return payload;
  }
}
