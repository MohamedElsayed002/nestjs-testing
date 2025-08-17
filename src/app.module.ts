import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://mohamed:secret123@cluster0.y2aft.mongodb.net/Testting?retryWrites=true&w=majority&appName=Cluster0'), 
    PassportModule,
    JwtModule.register({
      secret: '123',
      signOptions: {expiresIn: '1h'}
    }),   
    UserModule, AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
