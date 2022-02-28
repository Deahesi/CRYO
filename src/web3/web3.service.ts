import { Injectable } from '@nestjs/common';
import * as math from 'exact-math';
import {CreateEquipmentDto} from "../equipment/dto/create-equipment.dto";
import {ValidationException} from "../exceptions/validation.exception";
import {ForbiddenException} from "../exceptions/forbidden.exception";
const Web3 = require('web3');
import wallets_contracts from "../wallets_contracts";
import {ListingDto} from "../equipment/dto/listing.dto";


@Injectable()
export class Web3Service {
    web3;
    cryoContract;
    cycoContract;
    serviceAccAddress;
    serviceCYCOAccAddress;
    private servicePrivate;

    async onModuleInit() {
        if (!this.web3) {
            this.web3 = process.env.WEB3_PROVIDER.includes('https://') ? new Web3(process.env.WEB3_PROVIDER) : new Web3(new Web3.providers.WebsocketProvider(process.env.WEB3_PROVIDER, {
                clientConfig: {
                    keepalive: true,
                    keepaliveInterval: 60000,
                },
                reconnect: {
                    auto: true,
                    delay: 2500,
                    onTimeout: true,
                },
            }));
        }
        this.cryoContract = new this.web3.eth.Contract(wallets_contracts.cryo.abi, wallets_contracts.cryo.address);
        this.cycoContract = new this.web3.eth.Contract(wallets_contracts.cyco.abi, wallets_contracts.cyco.address);
        this.serviceAccAddress = process.env.SERVICE_ADDRESS
        this.serviceCYCOAccAddress = process.env.SERVICE_ADDRESS
    }

    toEther(value: number | string) {
        if (typeof value === 'string') {
            return this.web3.utils.fromWei(value, 'ether');
        } else {
            return this.web3.utils.fromWei(value.toString(), 'ether');
        }
    }

    toWei(value: number | string) {
        if (typeof value === 'string') {
            return this.web3.utils.toWei(value, 'ether');
        } else {
            return this.web3.utils.toWei(value.toString(), 'ether');
        }
    }

    async validateOwnerAcc(private_key: string) {
        let acc
        try {
            acc = await this.web3.eth.accounts.privateKeyToAccount(private_key);
        } catch (e) {
            console.log(e)
            throw new ValidationException([{
                field: 'private_key',
                errors: ['Invalid ethereum private key']
            }])
        }
        if (acc.address !== this.serviceAccAddress) throw new ForbiddenException([{
            field: 'private_key',
            errors: ['You are not allowed for this']
        }])
        return acc
    }

    async validateOwnerCYCOAcc(private_key: string) {
        let acc
        try {
            acc = await this.web3.eth.accounts.privateKeyToAccount(private_key);
        } catch (e) {
            console.log(e)
            throw new ValidationException([{
                field: 'private_key',
                errors: ['Invalid ethereum private key']
            }])
        }
        if (acc.address !== this.serviceCYCOAccAddress) throw new ForbiddenException([{
            field: 'private_key',
            errors: ['You are not allowed for this']
        }])
        return acc
    }

    async validatePrivateKey(private_key: string) {
        try {
            const acc = await this.web3.eth.accounts.privateKeyToAccount(private_key);
            return acc
        } catch (e) {
            throw new ValidationException([{
                field: 'private_key',
                errors: ['Invalid ethereum private key']
            }])
        }
    }

    async signTransaction(tx, wallet, privateKey, to, value?) {
        const nonce = await this.web3.eth.getTransactionCount(wallet.address);
        const gas = await tx.estimateGas({ from: wallet.address });
        const gasPrice = await this.web3.eth.getGasPrice();
        const data = tx.encodeABI();
        return await wallet.signTransaction({ to: to, data, gas, gasPrice, nonce, value }, () => {
        }, privateKey);
    }

    async getCostOfTransfer(from: string, to: string, value: string) {
        const nonce = await this.web3.eth.getTransactionCount(from);
        const gasPrice = await this.web3.eth.getGasPrice();
        const gas = await this.web3.eth.estimateGas({
            from,
            to,
            nonce,
            value,
        });
        return (gas * gasPrice).toString();
    }

    async transferTo(from_private: string, to: string, value: string) {
        const wallet = await this.validatePrivateKey(from_private)
        const nonce = await this.web3.eth.getTransactionCount(wallet.address);
        const gas = await this.web3.eth.estimateGas({
            from: wallet.address,
            to,
            nonce,
            value,
        });
        const gasPrice = await this.web3.eth.getGasPrice();

        const signed = await wallet.signTransaction({
            to,
            nonce,
            value,
            gas,
            gasPrice,
        }, () => {
        }, from_private);
        const res = await this.web3.eth.sendSignedTransaction(signed.rawTransaction);

        return res;
    }

    // async getCostOfTransferCYCO(address, to_address: string, toWei: any) {
    //     const wallet = await this.validatePrivateKey(from_private)
    //     const nonce = await this.web3.eth.getTransactionCount(wallet.address);
    //     const gas = await this.web3.eth.estimateGas({
    //         from: wallet.address,
    //         to,
    //         nonce,
    //         value,
    //     });
    //     const gasPrice = await this.web3.eth.getGasPrice();
    //
    //     const signed = await wallet.signTransaction({
    //         to,
    //         nonce,
    //         value,
    //         gas,
    //         gasPrice,
    //     }, () => {
    //     }, from_private);
    //     const res = await this.web3.eth.sendSignedTransaction(signed.rawTransaction);
    //
    //     return res;
    // }

    async getCostOfTx(tx, wallet) {
        const gas = await tx.estimateGas({ from: wallet.address });
        const gasPrice = await this.web3.eth.getGasPrice();

        return (gas * gasPrice).toString();
    }
}
