import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { query } from '@prisma/client';
import { AuthGuard } from '../../common/auth-gaurd';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from 'src/common/logger';

@Controller('user')
export class UserController {
  private logger: CustomLogger;
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {
    this.logger = new CustomLogger("UserService");
  }

  @Get("/conversations")
  @UseGuards(AuthGuard)
  async conversations(
    @Request() request, 
    @Query('userid') adminUserId: string, 
    @Query('page') page: number, 
    @Query('perPage') perPage: number,
    @Query('mobileNumber') mobileNumber: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string
  ): Promise<query[]> {
    let userId = null
    if(request.headers.roles.indexOf('Admin') != -1) {
      userId = adminUserId
      if(!userId && mobileNumber) {
        var myHeaders = new Headers();
        myHeaders.append("x-application-id", this.configService.get("FRONTEND_APPLICATION_ID"));
        myHeaders.append("Authorization", this.configService.get('FUSION_AUTH_API_KEY'));

        var requestOptions: RequestInit = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow'
        };
        try{
          let res: any = await fetch(`${this.configService.get('FUSION_AUTH_BASE_URL')}api/user?username=${mobileNumber}`, requestOptions)
          res = await res.json()
          userId = res.user.id
        } catch(error) {
          this.logger.error(error)
        }
      }
    } else {
      userId = request.headers.userId
    }
    page = page?page:1
    perPage = perPage?perPage:10
    return this.userService.conversationsList(
      userId,
      parseInt(`${page}`),
      parseInt(`${perPage}`),
      fromDate,
      toDate
    );
  }

  @Get("/chathistory/:conversationId")
  @UseGuards(AuthGuard)
  async chatHistory(@Param("conversationId") conversationId: string, @Request() request, @Query('userid') adminUserId: string): Promise<query[]> {
    let userId = request.headers.userId
    if(request.headers.roles.indexOf('Admin') != -1) {
      userId = adminUserId
    }
    return this.userService.conversationHistory(conversationId,userId);
  }

  @Get("conversations/delete/:conversationId")
  async deleteConversation(@Param("conversationId") conversationId: string, @Request() request): Promise<boolean> {
    const userId = request.headers.userId
    return this.userService.deleteConversation(conversationId,userId)
  }

  @Get("/sendotp/:identifier")
  async getOtp(@Param("identifier") identifier: string) {
    if(/^[6-9]\d{9}$/.test(identifier)) {
      return this.userService.sendOTP(identifier,"Mobile")
    } else if(identifier.length==14 && /^[6-9]\d{9}$/.test(identifier.substring(0,10))){
      return this.userService.sendOTP(identifier,"MobileAadhar")
    } else if(identifier.length==12 && /^\d+$/.test(identifier)){
      return this.userService.sendOTP(identifier,"Aadhar")
    } else if(identifier.length == 11) { 
      return this.userService.sendOTP(identifier,"Ben_id")
    } else {
      return {
        "status": "NOT_OK",
        "error": "Please enter a valid Beneficiary ID/Aadhaar Number/Phone number"
      }
    }
  }

  @Post("/verifyotp")
  async verifyOtp(@Body() body: any ) {
    if(/^[6-9]\d{9}$/.test(body.identifier)) {
      return this.userService.verifyOTP(body.identifier,body.otp,"Mobile")
    } else if(body.identifier.length==14 && /^[6-9]\d{9}$/.test(body.identifier.substring(0,10))){
      return this.userService.verifyOTP(body.identifier,body.otp,"MobileAadhar")
    } else if(body.identifier.length==12 && /^\d+$/.test(body.identifier)){
      return this.userService.verifyOTP(body.identifier,body.otp,"Aadhar")
    } else if(body.identifier.length == 11) { 
      return this.userService.verifyOTP(body.identifier,body.otp,"Ben_id")
    }else {
      return {
        "status": "NOT_OK",
        "error": "Please enter a valid Beneficiary ID/Aadhaar Number/Phone number"
      }
    }
  }

  @Get("/linkedBeneficiaryIdsCount/:identifier")
  async linkedBeneficiaryIdsCount(@Param("identifier") identifier: string) {
    if(/^[6-9]\d{9}$/.test(identifier) || /^\d{12}$/.test(identifier) || identifier.length > 9) {
      let mockJSON = {
        9999999990 : 0,
        9999999991 : 1,
        9999999992 :  2,
        111111111110: 0,
        111111111111: 1,
        AP111111110: 0,
        AP111111111: 1
      }
      let beneficiaryIdCount = 0
      try {
        beneficiaryIdCount =  mockJSON[`${identifier}`]
        if(!beneficiaryIdCount && beneficiaryIdCount!=0) beneficiaryIdCount = Math.floor(Math.random() * (/^[6-9]\d{9}$/.test(identifier)?4:1))
      } catch (e) {
        beneficiaryIdCount = Math.floor(Math.random() * (/^[6-9]\d{9}$/.test(identifier)?4:1))
      }
      return {
        status: "OK",
        beneficiaryIdCount,
        type: /^[6-9]\d{9}$/.test(identifier)?'phoneNumber':(/^\d{12}$/.test(identifier)?'aadhaar':(identifier.length > 9?'beneficiaryId':'invalid'))
      }
    }else {
      return {
        "status": "NOT_OK",
        "error": "Please enter a valid Beneficiary ID/Aadhaar Number/Phone number"
      }
    }
  }

  @Get("/checkMapping")
  async checkMapping(@Query('phoneNo') phoneNo: string, @Query('maskedAadhaar') maskedAadhaar: string) {
    if(/^[6-9]\d{9}$/.test(phoneNo) && maskedAadhaar) {
      return {
        status: true
      }
    } else {
      return {
        "status": "NOT_OK",
        "error": "invalid phoneNumber"
      }
    }
  }

  @Get("/getUserData/:identifier")
  async getUserData(@Param("identifier") identifier: string) {
    if(/^[6-9]\d{9}$/.test(identifier)) {
      return this.userService.getUserData(identifier,"Mobile")
    } else if(identifier.length==14 && /^[6-9]\d{9}$/.test(identifier.substring(0,10))){
      return this.userService.getUserData(identifier,"MobileAadhar")
    } else if(identifier.length==12 && /^\d+$/.test(identifier)){
      return this.userService.getUserData(identifier,"Aadhar")
    } else if(identifier.length == 11) { 
      return this.userService.getUserData(identifier,"Ben_id")
    }else {
      return {
        "status": "NOT_OK",
        "error": "Please enter a valid Beneficiary ID/Aadhaar Number/Phone number"
      }
    }
  }
}