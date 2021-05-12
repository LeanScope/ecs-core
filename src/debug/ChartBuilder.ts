export enum MessageType {
    Sync = 'Sync',
    AsyncRequest = 'AsyncRequest',
    AsyncResponse = 'AsyncResponse',
    Note = 'Note'
}
export interface Message {
    type: MessageType,
    timeStamp?: number,
    sender: string,
    receiver: string,
    text: string
}


export enum ChartUpdateEventType {
    UPDATED_FORCED = 'UPDATED_FORCED',
    PARTICIPANT_ADDED = 'PARTICIPANT_ADDED',
    MESSAGE_ADDED = 'MESSAGAE_ADDED',
    FILTER_CHANGED = 'FILTER_CHANGED'
  }
  

export type ChartUpdateEvent =
    | { type: ChartUpdateEventType.UPDATED_FORCED }
    | { type: ChartUpdateEventType.PARTICIPANT_ADDED }
    | { type: ChartUpdateEventType.MESSAGE_ADDED }
    | { type: ChartUpdateEventType.FILTER_CHANGED }



export class ChartBuilder {
    public onUpdate?: (event: ChartUpdateEvent) => void;
    private filterPhrase?: string;
    private participants = new Set<string>();
    private messages = new Map<string, Message>();

    public addParticipant(participant: string) {
        if (!this.participants.has(participant)) {
            this.participants.add(participant);
            this.raiseUpdateEvent({ type: ChartUpdateEventType.PARTICIPANT_ADDED });
        }
    }
   
    protected raiseUpdateEvent(event: ChartUpdateEvent) {
        if (this.onUpdate) {
            this.onUpdate(event);
        }
    }

    public update() {
        this.raiseUpdateEvent({ type: ChartUpdateEventType.UPDATED_FORCED })
    }

    public addMessage(message: Message) {
        const timeStamp = Date.now();
        const timedMessage = { 
            type: message.type,
            timeStamp: timeStamp,
            sender: message.sender,
            receiver: message.receiver,
            text: message.text
        }

        this.addParticipant(message.sender);
        this.addParticipant(message.receiver);
        this.messages.set(this.getMessageString(timedMessage), timedMessage);
        this.raiseUpdateEvent({ type: ChartUpdateEventType.MESSAGE_ADDED }); 
    }

    public filter(filterPhrase: string) {
        const filterPhraseLower = filterPhrase.toLowerCase();
        this.filterPhrase = filterPhraseLower;
        // @todo: check if the new filter phrase is different than the current one before raising event
        this.raiseUpdateEvent({ type: ChartUpdateEventType.FILTER_CHANGED }); 
    }

    public toMermaid() {
        let mermaidString = 'sequenceDiagram ';

        this.participants.forEach((participant) => {
            mermaidString += `participant ${participant} 
            `;
        })

        let lastTimeStamp: number | undefined = undefined;
        
        this.messages.forEach((message) => {
            const messageString = this.getMessageString(message);
            if (this.filterPhrase === undefined || this.filterPhrase?.length === 0 || messageString.indexOf(this.filterPhrase) > 0) {

                mermaidString += `${message.sender}${message.type === MessageType.AsyncResponse ? '-' : ''}->>${message.receiver}: ${message.text} 
                `;

                const ms = message.timeStamp && lastTimeStamp ? `${message.timeStamp - lastTimeStamp} ms` : `0 ms`;

                if (!lastTimeStamp) {
                    lastTimeStamp = message.timeStamp;
                }

                mermaidString += `Note right of ${message.sender}: ${ms}
                `
                if (message.type === MessageType.AsyncRequest) {
                    mermaidString += `activate ${message.receiver}
                    `;
                }
                if (message.type === MessageType.AsyncResponse) {
                    mermaidString += `deactivate ${message.sender}
                    `;
                } 
                if (message.type === MessageType.Note) {
                    mermaidString += `Note left of ${message.sender}: ${message.text}
                    `;
                }    
            }
        })
        return mermaidString;
    }

    protected getMessageString(message: Message) {
        return (message.type + message.timeStamp + message.sender + message.receiver + message.text).toLowerCase();
    }
}

export const chartBuilder = new ChartBuilder();


// const sequenceSpecScript = context.sequenceSpecScript;



// let i = 0;
// const participantsList = ``+sequenceSpecScript.cues.map(({ receiverGuid }) => {


//     const actor = actorForGuid(receiverGuid);
//     const meta = actor.state.meta;
//     const keys = Object.keys(meta);
//     const name = keys.length > 0 ? keys[0] : "Untitled Actor"

//     participants.add(receiverGuid);
//     return `participant ${i++} as ${name}
//     `
// }).join(' ');

// const sequenceDiagram = `sequenceDiagram 
//   `+ participantsList


// return (
//     <div>
//         <Mermaid chart={sequenceDiagram}/>
//     </div>
// )