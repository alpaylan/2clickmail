
export interface EmailData {
    to: string[];
    subject: string;
    body: string;
    cc: string[];
    bcc: string[];
};

export interface EmailObject {
    _id: string;
    name: string;
    access: 'public' | 'private';
    count: number;
    data: EmailData;
};

export interface EmailGenerateRequest {
    mode: 'generate',
    name?: string,
    email: EmailData
}

export interface EmailUpdateRequest {
    mode: 'update',
    id: string,
    name?: string,
    email: EmailData
}

export interface EmailDeleteRequest {
    mode: 'delete',
    id: string
}

export interface EmailIncrementSentCountRequest {
    mode: 'increment_sent_count',
    id: string
}


export type EmailPostRequest = 
    | EmailGenerateRequest
    | EmailUpdateRequest
    | EmailDeleteRequest
    | EmailIncrementSentCountRequest

export interface EmailGetRequest {
    value: string;
}
export interface User {
    _id: string;
    name: string;
    email: string;
};

export interface ProfileData {
    user: User;
    emails: EmailObject[];
}












