import {Injectable} from '@nestjs/common';
import {Web3Service} from "../web3/web3.service";
import {ValidationException} from "../exceptions/validation.exception";
import {ApproveDto, FreezeDto, TransferDto, TransferFromDto, TransferOwnershipDto} from "../dto/transfer.dto";

@Injectable()
export class WalletService {
    constructor(private readonly web3Service: Web3Service) {
    }

    async getNetworkBalance(address: string) {
        if (!this.web3Service.web3.utils.isAddress(address)) throw new ValidationException([{
            field: 'address',
            errors: ['Invalid wallet address']
        }])
        return parseFloat(this.web3Service.toEther(await this.web3Service.web3.eth.getBalance(address)))
    }

    async getCYCOBalance(address: string) {
        if (!this.web3Service.web3.utils.isAddress(address)) throw new ValidationException([{
            field: 'address',
            errors: ['Invalid wallet address']
        }])
        return parseFloat(this.web3Service.toEther(await this.web3Service.cycoContract.methods.balanceOf(address).call()))
    }

    async create(entropy?: string) {
        if (entropy && entropy.length < 32) throw new ValidationException([{
            field: 'entropy',
            errors: ['Entropy phrase should be at least 32 characters']
        }])
        const acc = await this.web3Service.web3.eth.accounts.create(entropy ?? undefined)
        return {
            private_key: acc.privateKey,
            address: acc.address
        }
    }

    async transferNetwork(dto: TransferDto) {
        const acc = await this.web3Service.validatePrivateKey(dto.from_private)
        const balance = parseFloat(this.web3Service.toEther(await this.web3Service.web3.eth.getBalance(acc.address)))
        if (balance < dto.amount) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money']
        }])
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTransfer(acc.address, dto.to_address, this.web3Service.toWei(dto.amount))))
        if (balance < dto.amount + cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])
        const res = await this.web3Service.transferTo(dto.from_private, dto.to_address, this.web3Service.toWei(dto.amount))
        return {success: true}
    }

    async freezeCYCO(dto: FreezeDto) {
        const acc = await this.web3Service.validatePrivateKey(dto.from_private)
        const balance = await this.getCYCOBalance(acc.address)
        const network = await this.getNetworkBalance(acc.address)
        if (balance < dto.amount) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money']
        }])

        //TODO: NETWORK FEE
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx(this.web3Service.cycoContract.methods.freeze(this.web3Service.toWei(dto.amount)), acc)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])

        const tx = this.web3Service.cycoContract.methods.freeze(this.web3Service.toWei(dto.amount));
        const signedTx = await this.web3Service.signTransaction(tx, acc, dto.from_private, this.web3Service.cycoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return {success: true}
    }

    async unfreezeCYCO(dto: FreezeDto) {
        const acc = await this.web3Service.validatePrivateKey(dto.from_private)
        const balance = await this.getCYCOBalance(acc.address)
        const network = await this.getNetworkBalance(acc.address)
        if (balance < dto.amount) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money']
        }])

        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx(this.web3Service.cycoContract.methods.unfreeze(this.web3Service.toWei(dto.amount)), acc)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])

        const tx = this.web3Service.cycoContract.methods.unfreeze(this.web3Service.toWei(dto.amount));
        const signedTx = await this.web3Service.signTransaction(tx, acc, dto.from_private, this.web3Service.cycoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return {success: true}
    }

    async freezedOf(address: string) {
        if (!this.web3Service.web3.utils.isAddress(address)) throw new ValidationException([{
            field: 'address',
            errors: ['Invalid wallet address']
        }])
        return parseFloat(this.web3Service.toEther(await this.web3Service.cycoContract.methods.freezedOf(address).call()))
    }

    async transferCYCO(dto: TransferDto) {
        const acc = await this.web3Service.validatePrivateKey(dto.from_private)
        const balance = await this.getCYCOBalance(acc.address)
        const network = await this.getNetworkBalance(acc.address)
        if (balance < dto.amount) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money']
        }])

        // TODO: NETWORK FEE
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx(this.web3Service.cycoContract.methods.transfer(dto.to_address, this.web3Service.toWei(dto.amount)), acc)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])

        const tx = this.web3Service.cycoContract.methods.transfer(dto.to_address, this.web3Service.toWei(dto.amount));
        const signedTx = await this.web3Service.signTransaction(tx, acc, dto.from_private, this.web3Service.cycoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return {success: true}
    }

    async transferFromCYCO(dto: TransferFromDto) {
        const acc = await this.web3Service.validatePrivateKey(dto.spender_private)
        const balance = await this.getCYCOBalance(acc.address)
        const network = await this.getNetworkBalance(acc.address)
        if (balance < dto.amount) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money']
        }])

        //TODO: NETWORK FEE
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx( this.web3Service.cycoContract.methods.transferFrom(dto.from_address, dto.to_address, this.web3Service.toWei(dto.amount)), acc)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])

        const tx = this.web3Service.cycoContract.methods.transferFrom(dto.from_address, dto.to_address, this.web3Service.toWei(dto.amount));
        const signedTx = await this.web3Service.signTransaction(tx, acc, dto.spender_private, this.web3Service.cycoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return {success: true}
    }

    async transferOwnershipCYCO(dto: TransferOwnershipDto) {
        const wallet = await this.web3Service.validateOwnerAcc(dto.from_private);
        const network = await this.getNetworkBalance(wallet.address);

        //TODO: NETWORK FEE
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx(this.web3Service.cycoContract.methods.transferOwnership(dto.to_address), wallet)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])

        const tx = this.web3Service.cycoContract.methods.transferOwnership(dto.to_address);
        const signedTx = await this.web3Service.signTransaction(tx, wallet, dto.from_private, this.web3Service.cycoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        this.web3Service.serviceCYCOAccAddress = dto.to_address
        return
    }

    async approve(dto: ApproveDto) {
        const wallet = await this.web3Service.validatePrivateKey(dto.from_private);
        const network = await this.getNetworkBalance(wallet.address);

        //TODO: NETWORK FEE
        const cost = parseFloat(this.web3Service.toEther(await this.web3Service.getCostOfTx(this.web3Service.cycoContract.methods.approve(dto.spender_address, this.web3Service.toWei(dto.amount)), wallet)))
        if (network < cost) throw new ValidationException([{
            field: 'amount',
            errors: ['You have not enough money to pay network fee']
        }])

        const tx = this.web3Service.cycoContract.methods.approve(dto.spender_address, this.web3Service.toWei(dto.amount));
        const signedTx = await this.web3Service.signTransaction(tx, wallet, dto.from_private, this.web3Service.cycoContract.options.address, '');
        const res = await this.web3Service.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return
    }

    async allowance(address: string, spender: string) {
        if (!this.web3Service.web3.utils.isAddress(address)) throw new ValidationException([{
            field: 'address',
            errors: ['Invalid wallet address']
        }])
        if (!this.web3Service.web3.utils.isAddress(spender)) throw new ValidationException([{
            field: 'spender',
            errors: ['Invalid wallet address']
        }])
        return parseFloat(this.web3Service.toEther(await this.web3Service.cycoContract.methods.allowance(address, spender).call()))
    }
}
