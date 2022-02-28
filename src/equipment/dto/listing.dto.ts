import {IsEthereumAddress, IsNotEmpty, IsNumber, IsString, Max, Min} from "class-validator";


export class ListingDto {
    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly private_key: string

    @IsNumber({}, { message: 'This field must be integer' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly id: number

    @IsNumber({}, { message: 'This field must be integer' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    @Min(1, { message: 'Min value is 1' })
    readonly amount: number

    @IsNumber({}, { message: 'This field must be float' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    @Min(0.0001, { message: 'Min value is 1' })
    readonly price: number

    //Per second
    @IsNumber({}, { message: 'This field must be float' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    @Min(0.0001, { message: 'Min value is 1' })
    readonly rent_price: number
}
