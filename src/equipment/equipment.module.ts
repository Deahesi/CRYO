import { Module } from '@nestjs/common';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import {Web3Module} from "../web3/web3.module";
import {WalletModule} from "../wallet/wallet.module";

@Module({
  imports: [Web3Module, WalletModule],
  controllers: [EquipmentController],
  providers: [EquipmentService]
})
export class EquipmentModule {}
