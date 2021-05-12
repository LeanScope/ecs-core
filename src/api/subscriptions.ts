export function scriptSubscriptionTemplate(
        gitLabProjectId: number,
        sessionGuid: string): string {
    return `
    subscription($repositoryId: Int!, $sessionGuid: String!) {
        repositoryMutated(
            repositoryId: ${gitLabProjectId}
            sessionGuid: ${sessionGuid}
        ) {
            repositoryId
            sessionGuid

            scriptsMutated {
                _guid
                action
                cues {
                    _guid
                    payload
                    action
                }
            }
          }
    }
    `
}