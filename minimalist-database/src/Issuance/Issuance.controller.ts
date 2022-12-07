import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Res,
  Req,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import * as log4js from 'log4js';
import { IssuanceService } from './Issuance.service';
import { CreateDocDto } from './create-Doc.dto';
import { VerifyDocDto } from './verify-Doc.dto';
import { mobileRegisterDto } from './mobile-register.dto';

const logger = log4js.getLogger('cheese');

@ApiTags('Issuance')
@Controller('issuance')
export class IssuanceController {
    constructor(private readonly Service: IssuanceService) { }

    @Post('/create')
    @ApiOperation({
        summary: 'Issue Document',
        description: 'It will issue a verifiable document to the user.',
    })
    @ApiOkResponse({ description: 'Document Created' })
    @ApiBadRequestResponse({ description: 'Bad Request: Possible cause: Incorrect Information.' })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. Probable cause: invalid bearer token or not presented.',
    })
    async runController(@Body() createDocDto: CreateDocDto,@Req() req,@Res() res) {
        logger.trace(`issuance.controller: run: Start`);
        try {
            const recipientWallet = req.body.walletAddress

            const success = await this.Service.IssueService(recipientWallet);
            logger.trace(`issuance.controller: run: ${success}`);
            return res.status(200).send(success);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    @Post('/mobileregister')
    @ApiOperation({
        summary: 'IssueMobileService',
        description: 'It will issue a verifiable document to the user.',
    })
    @ApiOkResponse({ description: 'Mobile device registered' })
    @ApiBadRequestResponse({ description: 'Bad Request: Possible cause: Incorrect deviceID.' })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. Probable cause: invalid bearer token or not presented.',
    })
    async runRegister(@Body() createMobileregister: mobileRegisterDto, @Req() req, @Res() res) {
        logger.trace(`issuance.controller: run: Start`);
        try {
            // Requesting for the device ID
            const deviceId = req.body.deviceId;

            // Checks if the wallet address tied with the device id exists in the database
            // If doesnt exist, record in database and sends the VC to the device
            // --Not Completed--

            const IssueVC = await this.Service.IssueMobileService();

            return res.status(200).send(IssueVC);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    @Post('/verify')
    @ApiOperation({
        summary: 'Verify Document',
        description: 'Verify Document through the server via openAttestation',
    })
    @ApiOkResponse({ description: 'Document is verified' })
    @ApiBadRequestResponse({ description: 'Bad Request: Possible cause: Wrong Document.' })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized. Probable cause: invalid bearer token or not presented.',
    })
    async runVerify(@Body() verifyDocDto: VerifyDocDto, @Req() req, @Res() res) {
        logger.trace(`issuance.controller: run: Start`);
        try {
            const document = req.body;
            const success = await this.Service.VerifyService(document);
            return res.status(200).send(success);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

}
