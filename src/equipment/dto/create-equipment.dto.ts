import {IsEthereumAddress, IsNotEmpty, IsNumber, IsString, Max, Min} from "class-validator";


export class CreateEquipmentDto {
    @IsString({ message: 'This field must be string' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    readonly private_key: string

    @IsNumber({}, { message: 'This field must be integer' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    @Min(1, { message: 'Min value is 1' })
    readonly amount: number

    @IsNumber({}, { message: 'This field must be integer' })
    @IsNotEmpty({message: 'This field cannot be empty'})
    @Min(1, { message: 'Min value is 1' })
    @Max(100, { message: 'Max value is 100' })
    readonly royalty: number
}
