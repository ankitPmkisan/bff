import { PrismaService } from "../../global-services/prisma.service";
import { ConfigService } from "@nestjs/config";
import { EmbeddingsService } from "../../modules/embeddings/embeddings.service";
import { PromptHistoryService } from "../../modules/prompt-history/prompt-history.service";
import { AiToolsService } from "../../modules/ai-tools/ai-tools.service";
import { Language } from "../../language";
import { chatGPT3Prompt } from "../../common/constants";
import { ResponseForTS } from "../../app.service";

const prismaService = new PrismaService()
const configService = new ConfigService()
const promptHistoryService = new PromptHistoryService(
    prismaService,
    configService
)
const embeddingsService = new EmbeddingsService(
    prismaService,
    configService,
    promptHistoryService
)
const aiToolsService = new AiToolsService(
    configService,
    embeddingsService,
    promptHistoryService
)

export const promptServices = {

    detectLanguage: async (context) => {
        console.log("detectLanguage",context)
        let response = await aiToolsService.detectLanguage(context.prompt.input.body)
        return response
    },

    translateInput: async (context) => {
        console.log("translateInput",context)
        if(context.prompt.inputLanguage != Language.en) {
            let response = await aiToolsService.translate(
                context.prompt.inputLanguage as Language,
                Language.en,
                context.prompt.input.body
            )
            console.log("translate response",response)
            return response
        } else {
            return {
                translated: context.prompt.input.body,
                error: null
            }
        }
    },

    getUserHistory: async (context) => {
        console.log("getUserHistory",context)
        let userHistoryWhere: any = {};
        userHistoryWhere.userId = context.prompt.input.userId;
        if(context.prompt.input.conversationId) userHistoryWhere.conversationId = context.prompt.input.conversationId;
        const userHistory = await prismaService.query.findMany({
            where: userHistoryWhere,
            orderBy: {
                createdAt: "desc",
            },
            take: 2,
        });
        let history = []
        for (let i = 0; i < userHistory.length; i++) {
            history.push(`User: ${userHistory[i].queryInEnglish}`);
            history.push(`AI: ${userHistory[i].responseInEnglish}`);
          }
        history.push(`User: ${context.prompt.inputTextInEnglish}`);
        return history
    },

    neuralCoreference: async (context) => {
        console.log("neuralCoreference",context)
        const chatGPT3PromptMessage = chatGPT3Prompt(context.prompt.userHistory)
        const { response: neuralCorefResponse, allContent: allContentNC, error } = await aiToolsService.llm(chatGPT3PromptMessage)
        return { response: neuralCorefResponse, allContent: allContentNC, error }
    },

    findSimilarQuestion: async (context) => {
        console.log("findSimilarQuestion",context)
        const olderSimilarQuestion =
        await promptHistoryService.findByCriteria({
            query: context.prompt.neuralCoreference,
            similarityThreshold: 0.97,
            matchCount: 1,
        });
        console.log("similar question", olderSimilarQuestion)
        return olderSimilarQuestion
    },

    getSimilarDocsForUpperThreshold: async(context) => {
        console.log("getSimilarDocsForUpperThreshold",context)
        const similarDocsFromEmbeddingsService =
        await embeddingsService.findByCriteria({
          query: context.prompt.neuralCoreference,
          similarityThreshold: parseFloat(configService.get("SIMILARITY_THRESHOLD")) || 0.78,
          matchCount: 2,
        });
        console.log("similar documents upper threshold", similarDocsFromEmbeddingsService)
        return similarDocsFromEmbeddingsService
    },

    getSimilarDocsForLowerThreshold: async(context) => {
        console.log("getSimilarDocsForLowerThreshold",context)
        const similarDocsFromEmbeddingsService =
        await embeddingsService.findByCriteria({
          query: context.prompt.neuralCoreference,
          similarityThreshold: parseFloat(configService.get("SIMILARITY_LOWER_THRESHOLD")) || 0.5,
          matchCount: 2,
        });
        console.log("similar documents upper threshold", similarDocsFromEmbeddingsService)
        return similarDocsFromEmbeddingsService
    },

    generateResponse: async (context) => {
        const userQuestion =
        "The user has asked a question: " + context.prompt.neuralCoreference + "\n";
        const expertContext =
            "Some expert context is provided in dictionary format here:" +
            JSON.stringify(
                context.prompt.similarDocs ? context.prompt.similarDocs
                .map((doc) => {
                return {
                    combined_prompt: doc.tags,
                    combined_content: doc.content,
                };
                }):[]
            ) +
            "\n";
        const chatGPT3PromptWithSimilarDocs = context.prompt.userHistory.length > 0 ?
            ("Some important elements of the conversation so far between the user and AI have been extracted in a dictionary here: " +
            context.prompt.userHistory.join("\n") +
            " " +
            userQuestion +
            " " +
            expertContext) :
            (context.prompt.neuralCoreference + " " + expertContext);
        const llmInput = [
            {
            role: "system",
            content:
                "You are an AI assistant who answers questions by farmers from Odisha, India on agriculture related queries. Answer the question asked by the user based on a summary of the context provided. Ignore the context if irrelevant to the question asked.",
            },
            {
            role: "user",
            content: chatGPT3PromptWithSimilarDocs,
            },
        ]
        const { response: finalResponse, allContent: ac, error } = await aiToolsService.llm(llmInput);
        return { response: finalResponse, allContent: ac, error }
    },

    translateOutput: async (context) => {
        console.log("translateOutput",context)
        if(context.prompt.inputLanguage != Language.en) {
            let response = await aiToolsService.translate(
                Language.en,
                context.prompt.inputLanguage as Language,
                context.prompt.outputInEnglish
            )
            console.log("translate response",response)
            return response
        } else {
            return {
                translated: context.prompt.outputInEnglish,
                error: null
            }
        }
    },

    storeAndSendMessage: async (context) => {
        console.log("storeAndSendMessage",context)
        await promptHistoryService.createOrUpdate({
            id: context.prompt.similarQuestion ? context.prompt.similarQuestion[0].id : null,
            queryInEnglish: context.prompt.inputTextInEnglish,
            responseInEnglish: context.prompt.outputInEnglish,
            responseTime: 1000,
            metadata: [],
            queryId: context.prompt.input.messageId
        });

        if(context.prompt.similarDocs && context.prompt.similarDocs.length > 0){
            let similarDocsCreateData = context.prompt.similarDocs.map(e=>{
              e['queryId'] = context.prompt.input.messageId
              e['documentId'] = e.id
              delete e.id
              return e
            })
            await prismaService.similarity_search_response.createMany({
              data: similarDocsCreateData
            })
        }
      
        const resp: ResponseForTS = {
            message: {
                title: context.output,
                choices: [],
                media_url: null,
                caption: null,
                msg_type: "text",
                conversationId: context.prompt.input.conversationId
            },
            to: context.prompt.input.from,
            messageId: context.prompt.input.messageId,
        };
      
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(resp),
        };

        try {
            await fetch(`${configService.get("TRANSPORT_SOCKET_URL")}/botMsg/adapterOutbound`,requestOptions);
            return context
        } catch(error){
            throw new Error(error)
        }
    },

    done: async (context) => {
        console.log("done",context)
        return context
    },

    logError: async (_, event) =>{
        console.log("Error", event)
        return event.data
    }
}
