import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {EquipmentModule} from './equipment/equipment.module';
import {Web3Module} from './web3/web3.module';
import { ConfigModule } from '@nestjs/config';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    EquipmentModule,
    Web3Module,
    WalletModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
