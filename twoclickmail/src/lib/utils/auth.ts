import Cookies from 'js-cookie';

export function isLoggedIn() {
    const sessionCookie = Cookies.get('session');
    console.log(`sessionCookie: [${sessionCookie}]`);
    console.log(sessionCookie == "null");
    return sessionCookie && sessionCookie != "null";
};


