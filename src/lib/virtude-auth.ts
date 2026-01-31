const AUTH_STORAGE_KEY = 'virtude-auth';

export function verifyCredentials(email: string, password: string) {
    const allowedEmail = 'virtudeshop2017@gmail.com';
    const allowedPassword = 'bralgapA1,';
    return email === allowedEmail && password === allowedPassword;
}

export function isAuthenticated() {
    if (typeof window === 'undefined') {
        return false;
    }
    return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

export function setAuthenticated(value: boolean) {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.setItem(AUTH_STORAGE_KEY, value ? 'true' : 'false');
}
