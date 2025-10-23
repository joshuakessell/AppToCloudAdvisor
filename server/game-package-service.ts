// Game package ingestion service for GitHub URLs and zip files
import AdmZip from 'adm-zip';
import path from 'path';

interface GamePackageResult {
  gameMarkdown: string;
  packageFiles: { path: string; content: string }[];
  detectedLanguages: string[];
}

interface FetchError extends Error {
  code?: string;
}

// GitHub URL patterns
const GITHUB_PATTERNS = [
  /github\.com\/([^\/]+)\/([^\/]+)/,
  /github\.com\/([^\/]+)\/([^\/]+)\.git/,
];

// Security: SSRF protection
const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254', // AWS metadata
  '::1',
  'metadata.google.internal', // GCP metadata
];

const PRIVATE_IP_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^fc00:/,
  /^fe80:/,
];

function isBlockedHost(hostname: string): boolean {
  if (BLOCKED_HOSTS.includes(hostname.toLowerCase())) {
    return true;
  }
  
  return PRIVATE_IP_RANGES.some(pattern => pattern.test(hostname));
}

function parseGitHubUrl(url: string): { owner: string; repo: string; branch?: string } | null {
  for (const pattern of GITHUB_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      let owner = match[1];
      let repo = match[2].replace(/\.git$/, '');
      
      // Extract branch if present
      const branchMatch = url.match(/\/tree\/([^\/]+)/);
      const branch = branchMatch ? branchMatch[1] : undefined;
      
      return { owner, repo, branch };
    }
  }
  return null;
}

// Fetch GitHub repository as a tarball
async function fetchGitHubRepo(githubUrl: string): Promise<Buffer> {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo');
  }
  
  const { owner, repo, branch = 'main' } = parsed;
  
  // GitHub archive URL (tarball)
  const archiveUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
  
  console.log(`[GamePackage] Fetching GitHub repository: ${owner}/${repo}@${branch}`);
  
  try {
    const response = await fetch(archiveUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
    
    if (!response.ok) {
      // Try 'master' branch if 'main' fails
      if (branch === 'main') {
        console.log(`[GamePackage] Branch 'main' not found, trying 'master'...`);
        const masterUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/master.zip`;
        const masterResponse = await fetch(masterUrl, {
          redirect: 'follow',
          signal: AbortSignal.timeout(30000),
        });
        
        if (!masterResponse.ok) {
          throw new Error(`GitHub repository not found or not accessible: ${response.status}`);
        }
        
        return Buffer.from(await masterResponse.arrayBuffer());
      }
      
      throw new Error(`GitHub repository not found or not accessible: ${response.status}`);
    }
    
    // Validate content size (max 50MB)
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
      throw new Error('Repository is too large (max 50MB)');
    }
    
    return Buffer.from(await response.arrayBuffer());
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('GitHub repository download timed out');
    }
    throw error;
  }
}

// Extract files from zip buffer
function extractZipContents(zipBuffer: Buffer): Map<string, string> {
  const files = new Map<string, string>();
  
  try {
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    
    for (const entry of zipEntries) {
      if (!entry.isDirectory) {
        const content = entry.getData().toString('utf-8');
        files.set(entry.entryName, content);
      }
    }
  } catch (error: any) {
    throw new Error(`Failed to extract zip file: ${error.message}`);
  }
  
  return files;
}

// Find game.md file in extracted contents
function findGameMarkdown(files: Map<string, string>): string | null {
  // Look for game.md at any depth
  for (const [filePath, content] of Array.from(files.entries())) {
    const filename = path.basename(filePath).toLowerCase();
    if (filename === 'game.md' || filename === 'readme.md') {
      console.log(`[GamePackage] Found game documentation: ${filePath}`);
      return content;
    }
  }
  
  return null;
}

// Detect programming languages from file extensions
function detectLanguages(files: Map<string, string>): string[] {
  const languageMap: Record<string, string> = {
    '.js': 'JavaScript',
    '.ts': 'TypeScript',
    '.py': 'Python',
    '.java': 'Java',
    '.cpp': 'C++',
    '.c': 'C',
    '.cs': 'C#',
    '.go': 'Go',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.rs': 'Rust',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.m': 'Objective-C',
  };
  
  const detected = new Set<string>();
  
  for (const filePath of Array.from(files.keys())) {
    const ext = path.extname(filePath).toLowerCase();
    if (languageMap[ext]) {
      detected.add(languageMap[ext]);
    }
  }
  
  return Array.from(detected);
}

// Custom error class for validation errors
export class GamePackageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GamePackageValidationError';
  }
}

// Process zip file (either uploaded or from GitHub)
export async function processGamePackage(zipBuffer: Buffer): Promise<GamePackageResult> {
  console.log(`[GamePackage] Processing game package (${zipBuffer.length} bytes)`);
  
  // Extract all files
  const files = extractZipContents(zipBuffer);
  console.log(`[GamePackage] Extracted ${files.size} files`);
  
  // Protection against decompression bombs - limit total file count and size
  if (files.size > 10000) {
    throw new GamePackageValidationError('Package contains too many files (max 10,000)');
  }
  
  let totalSize = 0;
  for (const content of Array.from(files.values())) {
    totalSize += content.length;
    if (totalSize > 500 * 1024 * 1024) { // 500MB decompressed limit
      throw new GamePackageValidationError('Decompressed package size exceeds 500MB');
    }
  }
  
  // Find game.md
  const gameMarkdown = findGameMarkdown(files);
  if (!gameMarkdown) {
    throw new GamePackageValidationError('No game.md or README.md file found in package');
  }
  
  // Validate markdown has some content
  if (gameMarkdown.trim().length < 50) {
    throw new GamePackageValidationError('game.md file is too short or empty');
  }
  
  // Detect programming languages
  const detectedLanguages = detectLanguages(files);
  
  // Convert files map to array (limit to relevant files)
  const packageFiles: { path: string; content: string }[] = [];
  for (const [filePath, content] of Array.from(files.entries())) {
    // Include markdown, code files, and config files (exclude binaries, images, etc.)
    const ext = path.extname(filePath).toLowerCase();
    const relevantExtensions = [
      '.md', '.txt', '.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs',
      '.go', '.rb', '.php', '.rs', '.swift', '.kt', '.json', '.yaml', '.yml',
      '.toml', '.xml', '.cfg', '.conf', '.ini',
    ];
    
    if (relevantExtensions.includes(ext) || filePath.includes('README')) {
      packageFiles.push({ path: filePath, content });
    }
  }
  
  console.log(`[GamePackage] Found ${packageFiles.length} relevant files, languages: ${detectedLanguages.join(', ')}`);
  
  return {
    gameMarkdown,
    packageFiles,
    detectedLanguages,
  };
}

// Main entry point: handle GitHub URL or zip buffer
export async function ingestGamePackage(
  source: { type: 'github'; url: string } | { type: 'zip'; buffer: Buffer }
): Promise<GamePackageResult> {
  if (source.type === 'github') {
    // Validate GitHub URL
    const parsed = parseGitHubUrl(source.url);
    if (!parsed) {
      throw new GamePackageValidationError('Invalid GitHub URL. Must be in format: https://github.com/owner/repo');
    }
    
    // Fetch from GitHub
    const zipBuffer = await fetchGitHubRepo(source.url);
    return await processGamePackage(zipBuffer);
  } else {
    // Process uploaded zip
    return await processGamePackage(source.buffer);
  }
}
