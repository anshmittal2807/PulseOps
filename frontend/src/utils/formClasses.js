export function inputClassName(hasError) {
    return `w-full bg-background border rounded px-3 py-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 transition-colors ${
        hasError
            ? "border-error focus:border-error focus:ring-error/20"
            : "border-surface-border focus:border-primary focus:ring-primary/20"
    }`;
}

export function AuthInputClassName(hasError) {
    return `w-full h-11 bg-background border rounded-lg px-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 transition mt-2 font-normal ${
        hasError
            ? "border-error focus:border-error focus:ring-error/20"
            : "border-surface-border focus:border-primary focus:ring-primary/20"
    }`;
}
