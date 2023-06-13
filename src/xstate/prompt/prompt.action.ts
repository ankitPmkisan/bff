import { assign } from 'xstate';
import {PromptContext} from './prompt.machine'
import { REPHRASE_YOUR_QUESTION } from '../../common/constants';
import { Language } from '../../language';

export const promptActions = {

  updatePromptHistoryWithDetectedLanguage: assign<PromptContext, any>((context, event) => {
    let ret =  {
      ...context,
      prompt: {
        ...context.prompt,
        inputLanguage: event.data["language"],
      },
      workflow: [{
        state: "detectLanguage",
        timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`
      }]
    }
    console.log("ret",ret)
    return ret
  }),

  updateContextWithTranslatedInput: assign<PromptContext, any>((context, event) => ({
    ...context,
    prompt: {
      ...context.prompt,
      inputTextInEnglish: event.data["translated"]
    },
    workflow: [...context.workflow,{
      state: "translateInput",
      timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`
    }]
  })),

  updatePromptWithUserHistory: assign<PromptContext, any>((context, event) => ({
    ...context,
    prompt: {
      ...context.prompt,
      userHistory: event.data?.length ? event.data : [],
    },
    workflow: [...context.workflow,{
      state: "getUserHistory",
      timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`
    }]
  })),

  setNeuralCoreferenceAsInput: assign<PromptContext, any>((context, event) => ({
    ...context,
    prompt: {
      ...context.prompt,
      neuralCoreference: context.prompt.inputTextInEnglish
    },
    workflow: [...context.workflow,{
      state: "getNeuralCoreference",
      timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`
    }]
  })),

  updateContextWithCoreferencedPrompt: assign<PromptContext, any>((context, event) => ({
    ...context,
    prompt: {
      ...context.prompt,
      neuralCoreference: event.data["response"]?.replace("User: ","")
    },
    workflow: [...context.workflow,{
      state: "getNeuralCoreference",
      timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`
    }]
  })),

  updateContextWithSimilarQuestion: assign<PromptContext, any>((context, event) => ({
    ...context,
    prompt: {
      ...context.prompt,
      similarQuestion: event.data?.length ? event.data : [],
      outputInEnglish: event.data?.length ? event.data[0].responseInEnglish: '',
      responseType: "Response given from previous similar question with similarity > 0.97"
    },
    workflow: [...context.workflow,{
      state: "getSimlilarQuestion",
      timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`
    }]
  })),

  updateContextWithSimilarDocs: assign<PromptContext, any>((context, event) => ({
    ...context,
    prompt: {
      ...context.prompt,
      similarDocs: event.data?.length ? event.data : [],
    },
    workflow: [...context.workflow,{
      state: "getSimilarDocs",
      timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`
    }]
  })),

  updateContextForResponseWithoutContent: assign<PromptContext, any>((context, event) => ({
    ...context,
    prompt: {
      ...context.prompt,
      responseType: `Response given through GPT only (without hitting the content DB i.e. sim cutoff < ${0.84})`
    },
    workflow: [...context.workflow,{
      state: "getResponse",
      timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`
    }]
  })),

  updateContextForBogusQuestion: assign<PromptContext, any>((context, event) => ({
    ...context,
    prompt: {
      ...context.prompt,
      responseType: "Response given to bogus question",
      output: REPHRASE_YOUR_QUESTION(context.prompt.inputLanguage),
      outputInEnglish: REPHRASE_YOUR_QUESTION(Language.en)
    },
    workflow: [...context.workflow,{
      state: "getResponse",
      timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`
    }]
  })),

  updateContextWithGeneratedResponse: assign<PromptContext, any>((context, event) => ({
    ...context,
    prompt: {
      ...context.prompt,
      outputInEnglish: event.data["response"],
      responseType: `Response given using content + GPT (sim cutoff from ${0.84} to 0.98)`
    },
    workflow: [...context.workflow,{
      state: "getResponse",
      timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`
    }]
  })),

  updateContextWithTranslatedOutput: assign<PromptContext, any>((context, event) => ({
    ...context,
    prompt: {
      ...context.prompt,
      output: event.data["translated"]
    },
    workflow: [...context.workflow,{
      state: "translateOutput",
      timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`
    }]
  })),

  updateContextWithTimeTakenToStoreMessage: assign<PromptContext, any>((context, _) => ({
    ...context,
    workflow: [...context.workflow,{
      state: "storeAndSendMessage",
      timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`
    }]
  })),

  setStartTime: assign<PromptContext, any>((context, _) => {
    return {
      ...context,
      currentStateStartTime: Date.now()
    }
  }),

  updateContextWithError: assign<PromptContext, any>((context, event) => {
    return {
      ...context,
      prompt: {
        ...context.prompt,
        error: `${event.data}`
      },
      workflow: [...context.workflow,{
        state: "error",
        timeTaken: `${(Date.now() - context.currentStateStartTime)/1000} sec`,
        error: `${event.data}`
      }]
    }
  })

};
 