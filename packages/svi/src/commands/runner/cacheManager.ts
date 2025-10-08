import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CacheEntry {
    file: string;
    hash: string;
}

export class CacheManager {
    private cacheFileName = '.svicache';
    private cache: Map<string, string> = new Map();

    constructor(private sviDir: string) {
        this.loadCache();
    }

    /** Lädt den aktuellen Cache aus der .svicache Datei */
    private loadCache() {
        const cachePath = path.join(this.sviDir, this.cacheFileName);
        if (!fs.existsSync(cachePath)) return;

        const lines = fs.readFileSync(cachePath, 'utf-8').split(/\r?\n/);
        for (const line of lines) {
            if (!line.trim()) continue;
            const [file, hash] = line.split(' ');
            if (file && hash) this.cache.set(file, hash);
        }
    }

    /** Speichert den Cache zurück in die .svicache Datei */
    private saveCache() {
        const cachePath = path.join(this.sviDir, this.cacheFileName);
        const content = Array.from(this.cache.entries())
            .map(([file, hash]) => `${file} ${hash}`)
            .join('\n');
        fs.writeFileSync(cachePath, content, 'utf-8');
    }

    /** Berechnet den SHA256 Hash einer Datei */
    private calculateHash(filePath: string): string {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }

    /** Prüft, ob die Datei noch aktuell ist */
    isCacheValid(fileName: string): boolean {
        const filePath = path.join(this.sviDir, fileName);
        if (!fs.existsSync(filePath)) return false;

        const currentHash = this.calculateHash(filePath);
        const cachedHash = this.cache.get(fileName);

        return cachedHash === currentHash;
    }

    /** Aktualisiert den Cache für eine Datei */
    updateCache(fileName: string) {
        const filePath = path.join(this.sviDir, fileName);
        if (!fs.existsSync(filePath)) return;

        const currentHash = this.calculateHash(filePath);
        this.cache.set(fileName, currentHash);
        this.saveCache();
    }
}
