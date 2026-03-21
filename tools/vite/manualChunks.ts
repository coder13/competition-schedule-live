type ChunkGroup = Record<string, string[]>;

function includesPackage(id: string, packageName: string): boolean {
  return id.includes(`/node_modules/${packageName}/`) || id.includes(`\\node_modules\\${packageName}\\`);
}

export function createManualChunks(groups: ChunkGroup) {
  return function manualChunks(id: string): string | undefined {
    if (!id.includes('node_modules')) {
      return undefined;
    }

    for (const [chunkName, packageNames] of Object.entries(groups)) {
      if (packageNames.some((packageName) => includesPackage(id, packageName))) {
        return chunkName;
      }
    }

    return 'vendor';
  };
}
