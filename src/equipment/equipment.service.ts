import { Injectable } from '@nestjs/common';
import {CreateEquipmentDto} from "./dto/create-equipment.dto";
import {Web3Service} from "../web3/web3.service";
import {ValidationException} from "../exceptions/validation.exception";
import {ListingDto} from "./dto/listing.dto";
import {PurchaseDto} from "./dto/purchase.dto";
import {WalletService} from "../wallet/wallet.service";
import {TransferOwnershipDto} from "../dto/transfer.dto";
import {PayRent, StartRentDto} from "./dto/start-rent.dto";

@Injectable()
export class EquipmentService {
    constructor(private readonly web3Service: Web3Service,
                private readonly walletService: WalletService) {}

    async createEquipment(dto: CreateEquipmentDto) {
        const wallet = await this.web3Service.validateOwnerAcc(dto.private_key);
        const network = await this.walletService.getNetworkBalance(wallet.address)

        //TODO: NETWORK FEE
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx(this.web3Service.cryoContract.methods.createEquip(wallet.address, dto.amount, dto.royalty), wallet)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])

        const tx = this.web3Service.cryoContract.methods.createEquip(wallet.address, dto.amount, dto.royalty);
        const signedTx = await this.web3Service.signTransaction(tx, wallet, dto.private_key, this.web3Service.cryoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return {
            id: res,
            owner: wallet.address,
            amount: dto.amount,
            royalty: dto.royalty
        }
    }

    async addListing(dto: ListingDto) {
        const wallet = await this.web3Service.validatePrivateKey(dto.private_key);
        const balance = await this.balanceOf(wallet.address, dto.id)
        const network = await this.walletService.getNetworkBalance(wallet.address)

        //TODO: NETWORK FEE
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx(this.web3Service.cryoContract.methods.addListing(dto.id, dto.amount, this.web3Service.toWei(dto.price), this.web3Service.toWei(dto.rent_price)), wallet)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])

        if (balance < dto.amount) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough equipment']
        }])
        const tx = this.web3Service.cryoContract.methods.addListing(dto.id, dto.amount, this.web3Service.toWei(dto.price), this.web3Service.toWei(dto.rent_price));
        const signedTx = await this.web3Service.signTransaction(tx, wallet, dto.private_key, this.web3Service.cryoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return true
    }

    async purchaseEquipment(dto: PurchaseDto) {
        const wallet = await this.web3Service.validatePrivateKey(dto.private_key);
        const network = await this.walletService.getNetworkBalance(wallet.address)

        //TODO: NETWORK FEE
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx(this.web3Service.cryoContract.methods.purchaseEquipment(dto.seller, dto.id, dto.amount), wallet)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])
        const tx = this.web3Service.cryoContract.methods.purchaseEquipment(dto.seller, dto.id, dto.amount);
        const signedTx = await this.web3Service.signTransaction(tx, wallet, dto.private_key, this.web3Service.cryoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return true
    }

    async balanceOf(address: string, id: number) {
        if (!this.web3Service.web3.utils.isAddress(address)) throw new ValidationException([{
            field: 'address',
            errors: ['Invalid wallet address']
        }])
        return await this.web3Service.cryoContract.methods.balanceOf(address, id).call()
    }

    async getListing(seller: string, id: number) {
        if (!this.web3Service.web3.utils.isAddress(seller)) throw new ValidationException([{
            field: 'seller',
            errors: ['Invalid wallet address']
        }])
        const listing = await this.web3Service.cryoContract.methods.getListing(seller, id).call()
        return {
            amount: listing[0],
            price: listing[1],
            rent_price: listing[2]
        }
    }

    async getRent(seller: string, tenant: string, id: number) {
        if (!this.web3Service.web3.utils.isAddress(seller)) throw new ValidationException([{
            field: 'seller',
            errors: ['Invalid wallet address']
        }])

        if (!this.web3Service.web3.utils.isAddress(tenant)) throw new ValidationException([{
            field: 'tenant',
            errors: ['Invalid wallet address']
        }])

        const rent = await this.web3Service.cryoContract.methods.getRent(seller, tenant, id).call()
        return {
            tenant: rent[0],
            amount: rent[1],
            rent_price: rent[2],
            last_payment: rent[3],
        }
    }

    async changeListing(dto: ListingDto) {
        const wallet = await this.web3Service.validatePrivateKey(dto.private_key);
        const network = await this.walletService.getNetworkBalance(wallet.address)

        //TODO: NETWORK FEE
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx(this.web3Service.cryoContract.methods.changeListing(dto.id, dto.amount, this.web3Service.toWei(dto.price), this.web3Service.toWei(dto.rent_price)), wallet)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])
        const tx = this.web3Service.cryoContract.methods.changeListing(dto.id, dto.amount, this.web3Service.toWei(dto.price), this.web3Service.toWei(dto.rent_price));
        const signedTx = await this.web3Service.signTransaction(tx, wallet, dto.private_key, this.web3Service.cryoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return true
    }

    async transferOwnership(dto: TransferOwnershipDto) {
        const wallet = await this.web3Service.validateOwnerAcc(dto.from_private);
        const network = await this.walletService.getNetworkBalance(wallet.address);

        //TODO: NETWORK FEE
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx(this.web3Service.cryoContract.methods.transferOwnership(dto.to_address), wallet)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])

        const tx = this.web3Service.cryoContract.methods.transferOwnership(dto.to_address);
        const signedTx = await this.web3Service.signTransaction(tx, wallet, dto.from_private, this.web3Service.cryoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        this.web3Service.serviceAccAddress = dto.to_address
    }

    async startRent(dto: StartRentDto) {
        const wallet = await this.web3Service.validatePrivateKey(dto.private_key);
        const network = await this.walletService.getNetworkBalance(wallet.address)

        //TODO: NETWORK FEE
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx(this.web3Service.cryoContract.methods.startRent(dto.seller, dto.id, dto.amount), wallet)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])
        const tx = this.web3Service.cryoContract.methods.startRent(dto.seller, dto.id, dto.amount);
        const signedTx = await this.web3Service.signTransaction(tx, wallet, dto.private_key, this.web3Service.cryoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }

    async payRent(dto: PayRent) {
        const wallet = await this.web3Service.validatePrivateKey(dto.private_key);
        const network = await this.walletService.getNetworkBalance(wallet.address)

        //TODO: NETWORK FEE
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx(this.web3Service.cryoContract.methods.payRent(dto.seller, dto.id), wallet)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])
        const tx = this.web3Service.cryoContract.methods.payRent(dto.seller, dto.id);
        const signedTx = await this.web3Service.signTransaction(tx, wallet, dto.private_key, this.web3Service.cryoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }

    async endRent(dto: PayRent) {
        const wallet = await this.web3Service.validatePrivateKey(dto.private_key);
        const network = await this.walletService.getNetworkBalance(wallet.address)

        //TODO: NETWORK FEE
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx(this.web3Service.cryoContract.methods.endRent(dto.seller, dto.id), wallet)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])
        const tx = this.web3Service.cryoContract.methods.endRent(dto.seller, dto.id);
        const signedTx = await this.web3Service.signTransaction(tx, wallet, dto.private_key, this.web3Service.cryoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }
}
