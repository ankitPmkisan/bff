import { Controller, Get, Post, Headers, Body, UseInterceptors, Param } from "@nestjs/common";
import { AppService, Prompt } from "./app.service";
import { AlertInterceptor } from "./modules/alerts/alerts.interceptor";
import { IsNotEmpty,IsUUID, IsOptional } from 'class-validator';
import { interpret } from "xstate";
import { promptMachine } from "./xstate/prompt/prompt.machine";

export class PromptDto {
  @IsNotEmpty()
  body: string;
  @IsOptional()
  media: string;
  @IsNotEmpty()
  @IsUUID()
  userId: string;
  @IsOptional()
  appId: string;
  @IsOptional()
  channel: string;
  @IsNotEmpty()
  @IsUUID()
  from: string;
  @IsOptional()
  context: string;
  @IsOptional()
  to: string;
  @IsNotEmpty()
  @IsUUID()
  messageId: string;
  @IsOptional()
  @IsUUID()
  conversationId: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/")
  getHello(): string {
    return this.appService.getHello();
  }

  @UseInterceptors(AlertInterceptor)
  @Post("/prompt")
  async prompt(@Body() promptDto: PromptDto, @Headers() headers): Promise<any> {
    let prompt: Prompt = {
      input: promptDto,
    };
    const promptProcessingService = interpret(
      promptMachine.withContext({
        prompt
      })
    ).start()

    await new Promise((resolve) => {
      promptProcessingService.onDone((state) => {
        resolve(state);
      });
    });
    let result = promptProcessingService.getSnapshot().context.prompt
    // Stop the state machine
    promptProcessingService.stop();
    return result;
  }

  @Get("/health/:minutes")
  health(@Param("minutes") minutes: number): any {
    return this.appService.getHealth(parseInt(`${minutes}`));
  }

  @Get("/odiaengdict")
  OdiaEnglishDic(): any{
    return this.appService.getOdiaEnglishDic();
  }
}
