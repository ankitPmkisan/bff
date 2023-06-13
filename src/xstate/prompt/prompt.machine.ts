import { createMachine } from 'xstate';
import { promptServices } from './prompt.service';
import { PromptDto } from '../../app.controller';
import { Language } from '../../language';
import { promptActions } from './prompt.action';
import { promptGuards } from './prompt.gaurd';

export interface PromptContext {
  prompt: {
    input: PromptDto;
    output?: string;
    outputInEnglish?: string;
    inputLanguage?: Language;
    inputTextInEnglish?: string;
    maxTokens?: number;
    outputLanguage?: Language;
    similarDocs?: any;

    // More output metadata
    timeTaken?: number;
    timestamp?: number;
    responseType?: string;
    userHistory?: any[];
    neuralCoreference?: string;
    similarQuestion?: any[];
  };
  currentStateStartTime?: any;
  workflow?: Array<{
    state?: string;
    description?: string;
    input?: any;
    output?: any;
    timeTaken?: string;
  }>
  // other context properties
}

export const promptMachine = createMachine<PromptContext>({
    /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7AtsgLgBQwGM5YBLAOygDoIwcxCcAZAQ0oFcWYBiCdcsFQoA3dAGtBaLLgLpisMpRp0GzNlE4wEIuSxyl+AbQAMAXROnEKdGX38rIAB6IAtAE4qADgCMANgAs3gCsnm7+gZ6hvgA0IACeiN7eAExBVMZBvr5BQW4AzMbG-jkAviWxUtj4RCQU1LT0jKwcXGDcYKgYqFTIADZ6AGboqJg9GFWy8or1Kk3qmmDa5KKEegbkFhYOyDakduQOzgguqR4A7Mn+oWfeV8YpybEJCG6eyVT+YWdBwd7GvnlPGcyhVxjIago6lQcKg2LB+vQAJLkZDsHC8fiCHQSMbSapyWpKGFwhFgZGonBLFZrIxmLZIEA7WzrQ6JDxFZJuIJnAK+ZLJC5BJ6JK7+dIC-KXbyePJ5b4gxlg-FTKHE8jwvRklFo9qdYY9BFDEa4iYQ6bQ2Hq0nktFU3T7TZmba7fas46pd5FILJJJ5S6c-lnYUIbx+7xUAHeLly14+b0KyrggmQpQwHAAVVgHQAEqRYDhhnEMQIhMtxJIlZNCdQ05mc3mC6g4nbVg66U6GUy9iyGUdOWL7pc8kFZfk8qHg1HblQ-COfakQsZhwnK2aobWs6hc-nC8WsWWcYnldWqBv6zumy2aRs6d5LJ2XT3QEcXHLjFQBeErmd-D6AkL4jZadZzDBdPCXIIVzxKsUxrOg6y3Btdw6LoDUGYZRiPGDzTPRCL2bHRW3WR172sZl7F7VxUl8dJImlbweR5e5PEnXw3i8M4gWlYwbkieVykVaC1yUAR2FhXoAGFhjAAYOjAchiD3UtREPVdk3NUTxKk1AZLkhTFkI68SOdciDko448jYqgzjcTibIFM5jDcZJsmDS5jHeW5bIY-lkks3xgQErDhOoTSWEk6TZJ0-TdVQvp0ONYL1KhMKIp0qL5OIK823MDsyO7Cjn1cXJPFo+43Fs3wiijGJAIQH1MnSPkArlX8skC0EhOSpQBgoCAAGVSEwUh+lQABFdg4H2JTsQrLqVR6vrBuG0aJqm9ZsuI9tSMZR9CqcRABXDUMfxclJf08Ec3O+M4qEBLkGPuJdPig01uuoXryAGoaRpYcbJvzdYZoPOa3oWj6lp+1aAf2TbaXMO8TIKsyiosmU7rYqMcgufwbkya7wIxqq7Ict4OsEsGT0+76Vr+tbAf4WL9XinAjUwtTwaoanlt+-71v4OGb1ynau1dcy3ABDizksyywjlS43P8f4IxxnluXyYpfFepNObTHnRoAETkWAADFhnTZBkA6AAVAALHTYFt9BeggYGVNBnWTz1qG-qNwhTfNy2bftuAnZdwXjIfUy3RcHJ0lufwqvCXxbmyWrnlHcMckyBjnM+YJtePWDTzofXfeNs3UAtq3UDth2w9dvgS1mk1PeL73adQP2A6roPa5Dx3nYgCPbxFvaUYO44ZXfbOgWSUJMlx9PEDyQIxTnXOAj8q5C+w9dS59ruK8Dmu69Doeme6Fm2dboucIPzvu8r6vg-roeR+FpGxdRlxPE+CN8jgQCjkP+FxgwFGlHdAov5XjDh8OEXeIUS44DLkff2lcmDoAAO6v3Pi7N25Zb571TA-XmT9hiYJwf3N+4dDI5XpPlb+k9Y7-w8gKccAVfz+DyOAiWNFhypB4mcHkKctZBQ5l7Uhhtj6oEobgwe+Cm77ndkQpBHcyEyLkdQvBw86FbQRmPaO5kXB-BSB8XGzkAocj+EGOqeQ+F3W9EEIRIi-CIPesg1B5DZHYPkQ3S+aFWYYVUR49R0j0EUN8dohRuiyxEXhgw3aRif5JGKBGT8idTGywAhnNi75mI+jVsYSIYjOqU3bvJDomoABKcAdjqjaEo5ShCkq60qbCegtTYD1KzB-RJosnzMJ8B+II3DV45BTpKWxzxijOIjFGe4soChFHcW0gQHSwBdJ6W0FCzNDTBNaZI9ZNS6n8F6XohJeUknIxjtLPItE3ApHHGwrIOTEDFGllQXI2NnG41xnkVZJ41QanoAAeTRBSAhql5pAstCCsA4KcAUj6VcgZ+0jiygHD8fO0pbKeGyDwuqzjLofABKMh491-CAuLsC0kiLIW7KvvsxKEiaVwrpRC20Fyhb9PHm6aWaQ+SBGcoUKxAVgxXGGT8X4fwHLFGpeaC8YAACCX1+ryQgAAWRIK0KFHs75QiVaqgaGrtUKFaCiwxNzzIFDSMEXwXJwLBGSMUtwwYchhDugKSIgRpQ3GSAqw1jYVVqtNTqngjLAk30OcXI1oavpmtgBa7lkdGGDKOP6u6SQ2LCMstvfw7rARinxYnEImQgSAkDUoW2bAIC9DAAAUT1KgPVITOY1q+vWptXRLVf3Ta4E675gjlTcEUG49Fgx8i5F8pc9jbi50umUAS5B0C0HgJ2Vl0w+3ooHREGczioyjtxkkHwwZLo0Qqn8vwoZChAirTMRoagWgwG3RPI4v5gxhDFJ8JenJsU3FKRTNu5paWahtDgV9bp-4BQlpdN4cpD0sTqikR5XgfB+T5H6HkPp73IIQtuRszw007oQErGcLrs7VSVpkR4yGAjFpJg9AULqqXiJhcXVK2ldLRWIJB4xspbr8n8pyeDI4kPPB9JA-4zGHgpxsuTGN5puaH3pkwtFb6V7emsmWy4gD-g5DcpZUqAVUh+hCPPROuGwnlwib3U+A8G58Z-oCQV3JLg+HHLKBqblXjvllGO6WUY-QBSs1ImzPctFnxiU55hnEL2hEToEAlizwFb3jm8bIoZuGvEgmx8p99jmdNOQ0mLL5uHhmHLjC4fo-5uYlb5cxw5XijtlQpzdqp2WanpWiUrK8AhesiHKcCjzvgKzqqKe50qrhbxCDl3DcaTUJvDWAXrCBV7hnuACX8oz8gXC5IWpId1wKOU4j4b4gHFNQg7XWxtzbVsmIEekJx45hGcXnoS54xN2T2MTjxFyLkAV5eA1CJRq37HxelWxccLq3hvIQM1O1YQkjeqawGpdQA */
    id: 'promptProcessing',
    predictableActionArguments: true,
    initial: 'detectLanguage',
    context: {
      prompt: null,
      workflow: []
    },
    states: {
      detectLanguage: {
        entry: ['setStartTime'],
        invoke: {
          src: 'detectLanguage',
          onDone: {
            target: 'translateInput',
            actions: ['updatePromptHistoryWithDetectedLanguage']
          },
          onError: 'handleError',
        },
      },
      translateInput: {
        entry: ['setStartTime'],
        invoke: {
          src: 'translateInput',
          onDone: {
            target: 'getUserHistory',
            actions: ['updateContextWithTranslatedInput']
          },
          onError: 'handleError',
        },
      },
      getUserHistory: {
        entry: ['setStartTime'],
        invoke: {
          src: 'getUserHistory',
          onDone: [
            {
              cond: 'isUserHistoryEmpty',
              target: 'findSimilarQuestion',
              actions: ['setNeuralCoreferenceAsInput']
            },
            {
              target: 'neuralCoreference',
              actions: ['updatePromptWithUserHistory']
            },
          ],
          onError: 'handleError',
        },
      },
      neuralCoreference: {
        entry: ['setStartTime'],
        invoke: {
          src: 'neuralCoreference',
          onDone: {
            target: 'findSimilarQuestion',
            actions: ['updateContextWithCoreferencedPrompt']

          },
          onError: 'handleError',
        },
      },
      findSimilarQuestion: {
        entry: ['setStartTime'],
        invoke: {
          src: 'findSimilarQuestion',
          onDone: [
            {
              cond: 'ifSimilarQuestionFound',
              target: 'translateOutput',
              actions: ['updateContextWithSimilarQuestion']
            },
            {
              target: 'getSimilarDocsForUpperThreshold',
              actions: []
            }
          ],
          onError: 'handleError',
        },
      },
      getSimilarDocsForUpperThreshold: {
        entry: ['setStartTime'],
        invoke: {
          src: 'getSimilarDocsForUpperThreshold',
          onDone: [
            {
              cond: 'ifSimilarDocsFound',
              target: 'generateResponse',
              actions: ['updateContextWithSimilarDocs'],
            },
            {
              target: 'getSimilarDocsForLowerThreshold',
              actions: []
            }
          ],
          onError: 'handleError',
        },
      },
      getSimilarDocsForLowerThreshold: {
        entry: ['setStartTime'],
        invoke: {
          src: 'getSimilarDocsForLowerThreshold',
          onDone: [
            {
              cond: 'ifSimilarDocsFound',
              target: 'generateResponse',
              actions: ['updateContextForResponseWithoutContent',]
            },
            {
              target: "handleError",
              actions: ['updateContextForBogusQuestion',]
            }
          ],
          onError: "handleError",
        },
      },
      generateResponse: {
        entry: ['setStartTime'],
        invoke: {
          src: 'generateResponse',
          onDone: {
            target: 'translateOutput',
            actions: ['updateContextWithGeneratedResponse',],
          },
          onError: 'handleError',
        }
      },
      translateOutput: {
        entry: ['setStartTime'],
        invoke: {
          src: 'translateOutput',
          onDone: {
            target: 'storeAndSendMessage',
            actions: ['updateContextWithTranslatedOutput',],
          },
          onError: 'handleError',
        },
      },
      storeAndSendMessage: {
        entry: ['setStartTime'],
        invoke: {
          src: 'storeAndSendMessage',
          onDone: {
            target: 'done',
            actions: ['updateContextWithTimeTakenToStoreMessage']
          },
          onError: 'handleError',
        },
      },
      handleError: {
        invoke: {
          src: 'logError',
          onDone: {
            target: 'done',
            actions: ['updateContextWithError']
          }
        }
      },
      done: {
        type: 'final',
        invoke: {
          src: 'done'
        }
      }
    },
},
{
  services: promptServices,
  actions: promptActions,
  guards: promptGuards
}
);