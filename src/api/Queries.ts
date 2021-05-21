import { Base64 } from "js-base64";
import { CrudEventActionIntent } from "./Events";

interface Cue {
  _guid: string;
  name: string;
  timestamp: number;
  receiverGuid: string;
  payload?: string;
}

export function queryTemplate(
  gitLabProjectId: number,
  bodyTemplate: string
): string {
  return `
    query {
        uxmData(repositoryId: ${gitLabProjectId})
        ${bodyTemplate}
      } 
    `;
}

export function personasQueryBodyTemplate() {
  return `
  {
    personas {
      _guid
    }
  }
  `;
}

export function scriptsQueryBodyTemplate() {
  return `
  {
    scripts {
      _guid
      cues {
        _guid
        name
        payload
      }
    }
  }
  `;
}

export function scriptsWithLocalCuesQueryBodyTemplate() {
  return `
  {
    scripts {
      _guid
      cues @client
    }
  }
  `;
}

// const clearAll = () => {
//   let querySteps = "";
//   for (let n = 0; n < paths.length; n++) {
//     querySteps += `
//         {
//           _guid: "${paths[n].guid}"
//           action: DELETE
//         }`;
//   }
//   const queryData = `{
//     scripts: [
//       {
//         _guid: "${scriptGuid}"
//         action: UPDATE
//         cues: [
//           ${querySteps}
//         ]
//       }

//     ]
//   }`;

export function scriptQueryCueBodyTemplate(
  scriptGuid: string,
  scriptActionIntent: CrudEventActionIntent,
  cues: Cue[],
  cueActionIntent: CrudEventActionIntent | undefined
): string {
  let cuesString = "";
  cues.forEach((cue) => {
    cuesString += `
      {
        _guid: "${cue._guid}"
        name: "${cue.name}"
        payload: "${Base64.encode(JSON.stringify(cue.payload))}"
        timestamp: ${cue.timestamp}
        action: ${cueActionIntent}
      }`;
  });

  return `
    {
        scripts: [
            {
                _guid: "${scriptGuid}"
                action: ${scriptActionIntent}
                cues: [
                  ${cuesString}
                ]
            }
        ]
    }`;
}

export function scriptCreateQueryBodyTemplate(scriptGuid: string) {
  return scriptQueryCueBodyTemplate(
    scriptGuid,
    CrudEventActionIntent.CREATE,
    [],
    undefined
  );
}

export function scriptAddCueQueryBodyTemplate(scriptGuid: string, cue: Cue) {
  return scriptQueryCueBodyTemplate(
    scriptGuid,
    CrudEventActionIntent.UPDATE,
    [cue],
    CrudEventActionIntent.CREATE
  );
}
