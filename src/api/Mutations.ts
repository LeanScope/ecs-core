export function scriptCreateMutationTemplate(
    gitLabProjectId: number,
    sessionGuid: string,
    scriptQueryBodyTemplate: string): string {
return `
mutation { 
    repository(
        gitLabProjectId: ${gitLabProjectId}, 
        sessionGuid: "${sessionGuid}", 
        uxmDataInput: ${scriptQueryBodyTemplate}) {
            scriptsMutated {
                _guid
                cues {
                    _guid
                    name
                    payload
                }
            }
        }  
    }   
`
}

export function scriptDeleteMutationTemplate(
    gitLabProjectId: number,
    sessionGuid: string,
    scriptQueryBodyTemplate: string): string {
return `
mutation { 
    repository(
        gitLabProjectId: ${gitLabProjectId}, 
        sessionGuid: "${sessionGuid}", 
        uxmDataInput: ${scriptQueryBodyTemplate}) {
            scriptsMutated {
                _guid
            }
        }  
    }   
`
}