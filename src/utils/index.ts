export function parseRole(role: string | null) {
    if (role === "ADMIN") {
        return '管理员';
    }
    else if (role === "USER") {
        return '会员';
    }
}