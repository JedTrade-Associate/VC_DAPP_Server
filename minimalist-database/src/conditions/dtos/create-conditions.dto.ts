import { ApiProperty } from '@nestjs/swagger';

export class CreateConditionsDto {
    @ApiProperty({
        description: 'Event Name'
    })
    readonly name: string;


    @ApiProperty({
        description: 'Organisation'
    })
    readonly org: string;

    @ApiProperty({
        description: 'Company Email'
    })
    readonly email: string;

    @ApiProperty({
        description: 'Company website'
    })
    readonly companyWeb: string;

    @ApiProperty({
        description: 'Purpose of verification'
    })
    readonly purpose: string;

    @ApiProperty({
        description: 'Start Date of event'
    })
    readonly startDate: string;

    @ApiProperty({
        description: 'End Date of event'
    })
    readonly endDate: string;

    @ApiProperty({
        description: 'Chain ID of token/nft'
    })
    readonly rpc: string;

    @ApiProperty({
        description: 'NFT contract address'
    })
    readonly tokenID: string;


    @ApiProperty({
        description: 'Number of NFTs/token in wallet'
    })
    readonly numberofTokens: number;

    @ApiProperty({
        description: 'Held NFTS for number of days'
    })
    readonly numberofDays: number;

    @ApiProperty({
        description: 'Conditions Unique Code'
    })
    readonly identifier: number;


    @ApiProperty({
        description: 'Conditions Unique Code'
    })
    readonly attendees: number;

}