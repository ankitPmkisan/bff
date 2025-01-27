export const USING_GPT4_ALERT = (
    userId,
    inputTextInEnglish,
    chatGPT3FinalResponse,
    previousSummaryHistory
) => `
Environment: ${process.env.ENVIRONMENT}
Using GPT4 as there were no similar documents found for below query\n
UserId: ${userId}\n\n
Query: ${inputTextInEnglish}\n\n
Response: ${chatGPT3FinalResponse}\n\n
User History: ${previousSummaryHistory}`

export const AI_TOOLS_DELAY_ALERT = (
    responseTime,
    url,
    options
) => `
Environment: ${process.env.ENVIRONMENT}
Below Ai-Tool request took ${responseTime/1000}sec to respond\n
URL: ${url}\n
Request options: ${JSON.stringify(options)}`

export const AI_TOOLS_ERROR = (
    url,
    options,
    error
) => `
Environment: ${process.env.ENVIRONMENT}
Below Ai-Tool request has failed:\n
URL: ${url}\n
Request options: ${JSON.stringify(options)}\n
Error: ${error}`

export const INVALID_REQUEST_ERROR = (request,error) => `
Environment: ${process.env.ENVIRONMENT}
Error occurred while processing request:\n\n${JSON.stringify(
    { 
        url: request.url, 
        body: request.body,
        query: request.query, 
        params: request.params 
    },
    null,
    2,
)}\n\n${error.stack}`

export const TEXT_TRANSLATION_ERROR = (userId,text,source,target) => `
Error while translating the text
Environment: ${process.env.ENVIRONMENT}
userId: ${userId}
url: /text_translation/google/remote
input text: ${text}
source_language: ${source}
target_language: ${target}
`

export const TEXT_DETECTION_ERROR = (userId,text,response) => `
Error while detecting the texts
Environment: ${process.env.ENVIRONMENT}
userId: ${userId}
url: /text_lang_detection/bhashini/remote
input text: ${text}
response: ${response}
`
export const GPT_RESPONSE_ERROR = (userId, input, output) => `
Error from gpt
url: /llm/openai/chatgpt3
userId: ${userId},
input: ${JSON.stringify(input,null,2)},
output: ${JSON.stringify(output,null,2)}
`
export const UNABLE_TO_DETECT_LANGUAGE = "Sorry, we are unable to detect the language. Please try rephrasing your question"

export const REPHRASE_YOUR_QUESTION = (inputLanguage) =>
inputLanguage && inputLanguage == 'en' ? "Please try rephrasing your question or try again later." :
"ଦୟାକରି ଆପଣଙ୍କର ପ୍ରଶ୍ନର ପୁନରାବୃତ୍ତି କରିବାକୁ ଚେଷ୍ଟା କରନ୍ତୁ କିମ୍ବା ପରେ ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ |";

export const UNABLE_TO_PROCESS_REQUEST = (inputLanguage) =>
inputLanguage && inputLanguage == 'en' ? "We are unable to process your request at the moment. Please try again later or contact our support team" :
"ଆମେ ବର୍ତ୍ତମାନ ଆପଣଙ୍କ ଅନୁରୋଧ ପ୍ରକ୍ରିୟାକରଣ କରିବାରେ ଅସମର୍ଥ | ଦୟାକରି ପରେ ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ କିମ୍ବା ଆମର ସମର୍ଥନ ଦଳ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ |"

export const CONTACT_AMAKRUSHI_HELPLINE = (inputLanguage) => 
inputLanguage && inputLanguage == 'en' ? "You can contact the Ama Krushi helpline by dialing 155333. They will provide you with information and reply to your queries within 24 hours." : "ଆପଣ 155333 ଡାଏଲ୍ କରି ଆମା କ୍ରୁସି ହେଲ୍ପଲାଇନ ସହିତ ଯୋଗାଯୋଗ କରିପାରିବେ | ସେମାନେ ଆପଣଙ୍କୁ ସୂଚନା ପ୍ରଦାନ କରିବେ ଏବଂ 24 ଘଣ୍ଟା ମଧ୍ୟରେ ଆପଣଙ୍କ ପ୍ରଶ୍ନର ଉତ୍ତର ଦେବେ |"

export const AADHAAR_GREETING_MESSAGE = (
    BeneficiaryName,
    FatherName,
    DOB,
    Address,
    DateOfRegistration
) => `Hi ${BeneficiaryName},
Name: ${BeneficiaryName}
Father's Name: ${FatherName}
Date Of Birth: ${DOB}
Address: ${Address}
Registration Date: ${DateOfRegistration}
`
