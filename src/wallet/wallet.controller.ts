import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {EquipmentService} from "../equipment/equipment.service";
import {CreateEquipmentDto} from "../equipment/dto/create-equipment.dto";
import {ListingDto} from "../equipment/dto/listing.dto";
import {WalletService} from "./wallet.service";
import {ApproveDto, FreezeDto, TransferDto, TransferFromDto, TransferOwnershipDto} from "../dto/transfer.dto";

@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Get('balance/network')
    async getNetworkBalance(@Query('address') address: string) {
        return await this.walletService.getNetworkBalance(address)
    }

    @Get('balance/cyco')
    async addListing(@Query('address') address: string) {
        return await this.walletService.getCYCOBalance(address)
    }

    @Get('create')
    async createWallet(@Query('entropy') entropy?: string) {
        return await this.walletService.create(entropy ?? null)
    }

    @Post('transfer/network')
    async transferNetwork(@Body() dto: TransferDto) {
        return await this.walletService.transferNetwork(dto)
    }

    @Post('freezeCYCO')
    async freezeCYCO(@Body() dto: FreezeDto) {
        return await this.walletService.freezeCYCO(dto)
    }

    @Post('unfreezeCYCO')
    async unfreezeCYCO(@Body() dto: FreezeDto) {
        return await this.walletService.unfreezeCYCO(dto)
    }

    @Post('transfer/cyco')
    async transferCYCO(@Body() dto: TransferDto) {
        return await this.walletService.transferCYCO(dto)
    }

    @Post('transfer-from/cyco')
    async transferFromCYCO(@Body() dto: TransferFromDto) {
        return await this.walletService.transferFromCYCO(dto)
    }

    @Post('transfer-ownership/cyco')
    async transferOwnershipCYCO(@Body() dto: TransferOwnershipDto) {
        return await this.walletService.transferOwnershipCYCO(dto)
    }

    @Get('freezed/cyco')
    async freezedOf(@Query('address') address: string) {
        return await this.walletService.freezedOf(address)
    }

    @Post('approve/cyco')
    async approve(@Body() dto: ApproveDto) {
        return await this.walletService.approve(dto)
    }

    @Get('allowance/cyco')
    async allowance(@Query('address') address: string, @Query('spender') spender: string) {
        return await this.walletService.allowance(address, spender)
    }
}
