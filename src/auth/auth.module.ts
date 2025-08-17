import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schema/auth.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    JwtModule.register({
      secret:'123',
      signOptions: {expiresIn: '1h'}
    })
    
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService,JwtModule]
})
export class AuthModule {}
