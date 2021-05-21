
export enum EntityNames {
    ARCHETYPE = 'ARCHETYPE',
    UI = 'UI',
    USER = 'USER',
    BOT = 'BOT',
    MODERATOR = 'MODERATOR',
    ATTENDEE = 'ATTENDEE',
    ATTENDANCE = 'ATTENDANCE'
}

export class EntityGuids {
    static [EntityNames.ARCHETYPE] = '04b532b3-05b9-4a5b-96b4-7ef5a03e3874';
    static [EntityNames.UI] = '8cd5bab4-b6df-4b10-9ffa-4c93a1ebbb78';
    static [EntityNames.USER] = 'c5f87054-682b-48b1-9afa-7d41a8fa20f3';
    static [EntityNames.BOT] = '90923094-2a96-40ed-a4e3-594d42138579';
    static [EntityNames.MODERATOR] = '48434e49-215b-46b4-8855-c2039d6e834a';
    static [EntityNames.ATTENDEE] = 'd756d9fb-a05a-47bc-86dd-9f9b945c7cca';
    static [EntityNames.ATTENDANCE] = 'ebc98ed7-4954-491a-8fee-a32a67d08ae2'; 
}

