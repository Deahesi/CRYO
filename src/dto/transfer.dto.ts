import {IsEthereumAddress, IsNotEmpty, IsNumber, IsString, Max, Min} from "class-validator";


export class TransferDto {
    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly from_private: string

    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    @IsEthereumAddress({ message: 'Invalid wallet address' })
    readonly to_address: string

    @IsNumber({}, { message: 'This field must be integer' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly amount: number
}

export class TransferOwnershipDto {
    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly from_private: string

    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    @IsEthereumAddress({ message: 'Invalid wallet address' })
    readonly to_address: string
}

export class TransferFromDto {
    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly spender_private: string

    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    @IsEthereumAddress({ message: 'Invalid wallet address' })
    readonly from_address: string

    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    @IsEthereumAddress({ message: 'Invalid wallet address' })
    readonly to_address: string

    @IsNumber({}, { message: 'This field must be integer' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly amount: number
}

export class FreezeDto {
    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly from_private: string

    @IsNumber({}, { message: 'This field must be integer' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly amount: number
}

export class ApproveDto {
    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly from_private: string

    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    @IsEthereumAddress({ message: 'Invalid wallet address' })
    readonly spender_address: string

    @IsNumber({}, { message: 'This field must be integer' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly amount: number
}
