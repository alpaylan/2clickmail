
import { EmailData } from "./types";


function listToCSV(list: string[]) {
    return list.join(",");
}

export function generateMailto(email: EmailData) {
    const { to, cc, bcc, subject, body } = email;
    let mailto = `mailto:${listToCSV(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (cc) {
        mailto += `&cc=${listToCSV(cc)}`;
    }
    if (bcc) {
        mailto += `&bcc=${listToCSV(bcc)}`;
    }
    return mailto;
}



