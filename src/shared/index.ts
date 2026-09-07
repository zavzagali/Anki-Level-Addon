export {};

function pycmd(cmd: string): void {
    try {
        (window as any).pycmd(cmd);
    } catch (e) {
        console.error("[Level] pycmd failed:", e);
    }
}

export function requestSummary(): void {
    pycmd("lua:summary");
}
