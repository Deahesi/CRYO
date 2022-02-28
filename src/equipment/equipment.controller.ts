import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {EquipmentService} from "./equipment.service";
import {CreateEquipmentDto} from "./dto/create-equipment.dto";
import {ListingDto} from "./dto/listing.dto";
import {TransferOwnershipDto} from "../dto/transfer.dto";
import {PayRent, StartRentDto} from "./dto/start-rent.dto";
import {PurchaseDto} from "./dto/purchase.dto";

@Controller('equipment')
export class EquipmentController {
    constructor(private readonly equipmentService: EquipmentService) {}

    @Post('create')
    async createEquipment(@Body() dto: CreateEquipmentDto) {
        return await this.equipmentService.createEquipment(dto)
    }

    @Post('listing')
    async addListing(@Body() dto: ListingDto) {
        return await this.equipmentService.addListing(dto)
    }

    @Post('listing/change')
    async changeListing(@Body() dto: ListingDto) {
        return await this.equipmentService.changeListing(dto)
    }

    @Post('purchase')
    async purchase(@Body() dto: PurchaseDto) {
        return await this.equipmentService.purchaseEquipment(dto)
    }

    @Get('balance')
    async balanceOf(@Query('address') address: string, @Query('id') id: string) {
        if (!address || !parseInt(id)) return 0
        return await this.equipmentService.balanceOf(address, parseInt(id))
    }

    @Post('transfer-ownership')
    async transferOwnership(@Body() dto: TransferOwnershipDto) {
        return await this.equipmentService.transferOwnership(dto)
    }

    @Post('rent/start')
    async startRent(@Body() dto: StartRentDto) {
        return await this.equipmentService.startRent(dto)
    }

    @Post('rent/pay')
    async payRent(@Body() dto: PayRent) {
        return await this.equipmentService.payRent(dto)
    }

    @Post('rent/end')
    async endRent(@Body() dto: PayRent) {
        return await this.equipmentService.endRent(dto)
    }

    @Get('get-rent')
    async getRent(@Query('seller') seller: string, @Query('tenant') tenant: string, @Query('id') id: string) {
        return await this.equipmentService.getRent(seller, tenant, parseInt(id))
    }

    @Get('get-listing')
    async getListing(@Query('seller') seller: string, @Query('id') id: string) {
        return await this.equipmentService.getListing(seller, parseInt(id))
    }
}
