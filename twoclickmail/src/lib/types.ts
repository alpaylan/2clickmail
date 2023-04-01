
export interface EmailData {
    to: string[];
    subject: string;
    body: string;
    cc: string[];
    bcc: string[];
};

export type EmailAccess = 'public' | 'private';

export interface EmailObject {
    _id: string;
    name?: string;
    access: EmailAccess;
    data: EmailData;
};

export interface User {
    _id: string;
    name: string;
    email: string;
};

export type EmailRequestType = 'name' | 'id';

export interface EmailRequest {
    type: EmailRequestType;
    value: string;
}

export interface ProfileData {
    user: User;
    emails: EmailObject[];
}












