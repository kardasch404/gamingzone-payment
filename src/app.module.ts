import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './shared/config/app.config';
import stripeConfig from './shared/config/stripe.config';
import databaseConfig from './shared/config/database.config';
import { StripeModule } from './infrastructure/external/stripe/stripe.module';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, stripeConfig, databaseConfig],
    }),
    PrismaModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
