export function parseRole(role: string | null) {
    if (role === "admin") {
        return '管理员';
    }
    else if (role === "user") {
        return '会员';
    }
}

export function isLogin() {
    const token = sessionStorage.getItem('token');
    if (token) {
        return true;
    }
    return false;
}