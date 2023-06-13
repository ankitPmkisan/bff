export const promptGuards = {
    isUserHistoryEmpty: (_, event) => event.data.length === 0,
    ifSimilarQuestionFound: (_, event) => event.data?.length > 0,
    ifSimilarDocsFound: (_, event) => event.data?.length > 0
}