import {IsEthereumAddress, IsNotEmpty, IsNumber, IsString, Max, Min} from "class-validator";


export class StartRentDto {
    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly private_key: string

    @IsNumber({}, { message: 'This field must be integer' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly id: number

    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    @IsEthereumAddress({ message: 'Invalid wallet address' })
    readonly seller: string

    @IsNumber({}, { message: 'This field must be integer' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    @Min(1, { message: 'Min value is 1' })
    readonly amount: number
}

export class PayRent {
    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly private_key: string

    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    @IsEthereumAddress({ message: 'Invalid wallet address' })
    readonly seller: string

    @IsNumber({}, { message: 'This field must be integer' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly id: number
}
