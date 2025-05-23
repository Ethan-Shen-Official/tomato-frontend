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

export function translateException(exception: string) {
    //TODO:
    if (exception === "USER_NOT_FOUND") {
        return "用户不存在";
    }
}

export const traslateOrderStatus = (status: string) => {
    if (status === "PENDING") {
        return "待支付";
    } else if (status === "PAID") {
        return "已支付";
    } else if (status == "SHIPPED") {
        return "已发货";
    }
}