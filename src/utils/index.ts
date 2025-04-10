export function parseRole(role: string | null) {
    if (role === "admin") {
        return '管理员';
    }
    else if (role === "user") {
        return '会员';
    }
}