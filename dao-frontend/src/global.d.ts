import { Eip1193Provider } from 'ethers';

declare global {
    interface Window {
        ethereum?: Eip1193Provider & { request: (args: { method: string, params?: unknown[] }) => Promise<unknown> };
    }
}
