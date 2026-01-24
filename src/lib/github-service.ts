/**
 * GitHub Integration Service via MCP
 *
 * Provides functionality to:
 * - Create repositories
 * - Create blobs, trees, and commits
 * - Push changes to GitHub automatically
 *
 * Uses the GitHub MCP integration via Composio
 */

import { callMCPTool, type MCPToolResponse } from '@/sdk/core/mcp-client';

// GitHub MCP Server ID from mcp-server.ts
const GITHUB_MCP_ID = '686de4e26fd1cae1afbb55bc' as const;

// Type definitions for GitHub operations
export interface GitHubRepoCreateParams {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
  license_template?: string;
  gitignore_template?: string;
  has_issues?: boolean;
  has_projects?: boolean;
  has_wiki?: boolean;
}

export interface GitHubRepoResponse {
  successful: boolean;
  data?: {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    clone_url: string;
    ssh_url: string;
    default_branch: string;
    owner: {
      login: string;
      id: number;
    };
  };
  error?: string;
}

export interface GitHubBlobParams {
  owner: string;
  repo: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
}

export interface GitHubBlobResponse {
  successful: boolean;
  data?: {
    sha: string;
    url: string;
  };
  error?: string;
}

export interface GitHubTreeEntry {
  path: string;
  mode: '100644' | '100755' | '040000' | '160000' | '120000';
  type: 'blob' | 'tree' | 'commit';
  sha: string;
}

export interface GitHubTreeParams {
  owner: string;
  repo: string;
  base_tree?: string;
  tree: GitHubTreeEntry[];
}

export interface GitHubTreeResponse {
  successful: boolean;
  data?: {
    sha: string;
    url: string;
    tree: GitHubTreeEntry[];
  };
  error?: string;
}

export interface GitHubCommitParams {
  owner: string;
  repo: string;
  message: string;
  tree: string;
  parents?: string[];
  author?: {
    name: string;
    email: string;
    date?: string;
  };
}

export interface GitHubCommitResponse {
  successful: boolean;
  data?: {
    sha: string;
    url: string;
    message: string;
    html_url: string;
  };
  error?: string;
}

export interface GitHubRefParams {
  owner: string;
  repo: string;
  ref: string;
  sha: string;
}

export interface GitHubRefResponse {
  successful: boolean;
  data?: {
    ref: string;
    url: string;
    object: {
      sha: string;
      type: string;
      url: string;
    };
  };
  error?: string;
}

export interface GitHubUpdateRefParams {
  owner: string;
  repo: string;
  ref: string;
  sha: string;
  force?: boolean;
}

export interface FileToUpload {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
}

// Helper to parse MCP response
function parseMCPResponse<T>(response: MCPToolResponse): T {
  try {
    if (response.content && response.content[0] && response.content[0].text) {
      return JSON.parse(response.content[0].text) as T;
    }
    throw new Error('Invalid MCP response format');
  } catch (error) {
    console.error('Failed to parse MCP response:', error);
    throw error;
  }
}

/**
 * Create a new GitHub repository for the authenticated user
 */
export async function createRepository(
  params: GitHubRepoCreateParams
): Promise<GitHubRepoResponse> {
  try {
    const response = await callMCPTool<MCPToolResponse>(
      GITHUB_MCP_ID,
      'GITHUB_CREATE_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER',
      {
        name: params.name,
        description: params.description || '',
        private: params.private ?? false,
        auto_init: params.auto_init ?? false,
        license_template: params.license_template,
        gitignore_template: params.gitignore_template,
        has_issues: params.has_issues ?? true,
        has_projects: params.has_projects ?? true,
        has_wiki: params.has_wiki ?? true,
      }
    );

    return parseMCPResponse<GitHubRepoResponse>(response);
  } catch (error) {
    console.error('Failed to create repository:', error);
    return {
      successful: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a blob (file content) in a repository
 */
export async function createBlob(
  params: GitHubBlobParams
): Promise<GitHubBlobResponse> {
  try {
    const response = await callMCPTool<MCPToolResponse>(
      GITHUB_MCP_ID,
      'GITHUB_CREATE_A_BLOB',
      {
        owner: params.owner,
        repo: params.repo,
        content: params.content,
        encoding: params.encoding || 'utf-8',
      }
    );

    return parseMCPResponse<GitHubBlobResponse>(response);
  } catch (error) {
    console.error('Failed to create blob:', error);
    return {
      successful: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a tree (directory structure) in a repository
 */
export async function createTree(
  params: GitHubTreeParams
): Promise<GitHubTreeResponse> {
  try {
    const response = await callMCPTool<MCPToolResponse>(
      GITHUB_MCP_ID,
      'GITHUB_CREATE_A_TREE',
      {
        owner: params.owner,
        repo: params.repo,
        base_tree: params.base_tree,
        tree: params.tree,
      }
    );

    return parseMCPResponse<GitHubTreeResponse>(response);
  } catch (error) {
    console.error('Failed to create tree:', error);
    return {
      successful: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a commit in a repository
 */
export async function createCommit(
  params: GitHubCommitParams
): Promise<GitHubCommitResponse> {
  try {
    const response = await callMCPTool<MCPToolResponse>(
      GITHUB_MCP_ID,
      'GITHUB_CREATE_A_COMMIT',
      {
        owner: params.owner,
        repo: params.repo,
        message: params.message,
        tree: params.tree,
        parents: params.parents || [],
        author: params.author,
      }
    );

    return parseMCPResponse<GitHubCommitResponse>(response);
  } catch (error) {
    console.error('Failed to create commit:', error);
    return {
      successful: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a reference (branch) in a repository
 */
export async function createReference(
  params: GitHubRefParams
): Promise<GitHubRefResponse> {
  try {
    const response = await callMCPTool<MCPToolResponse>(
      GITHUB_MCP_ID,
      'GITHUB_CREATE_A_REFERENCE',
      {
        owner: params.owner,
        repo: params.repo,
        ref: params.ref,
        sha: params.sha,
      }
    );

    return parseMCPResponse<GitHubRefResponse>(response);
  } catch (error) {
    console.error('Failed to create reference:', error);
    return {
      successful: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update a reference (push to branch) in a repository
 */
export async function updateReference(
  params: GitHubUpdateRefParams
): Promise<GitHubRefResponse> {
  try {
    const response = await callMCPTool<MCPToolResponse>(
      GITHUB_MCP_ID,
      'GITHUB_UPDATE_A_REFERENCE',
      {
        owner: params.owner,
        repo: params.repo,
        ref: params.ref,
        sha: params.sha,
        force: params.force ?? false,
      }
    );

    return parseMCPResponse<GitHubRefResponse>(response);
  } catch (error) {
    console.error('Failed to update reference:', error);
    return {
      successful: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get repository information
 */
export async function getRepository(
  owner: string,
  repo: string
): Promise<GitHubRepoResponse> {
  try {
    const response = await callMCPTool<MCPToolResponse>(
      GITHUB_MCP_ID,
      'GITHUB_GET_A_REPOSITORY',
      { owner, repo }
    );

    return parseMCPResponse<GitHubRepoResponse>(response);
  } catch (error) {
    console.error('Failed to get repository:', error);
    return {
      successful: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the latest commit SHA for a branch
 */
export async function getLatestCommitSha(
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<string | null> {
  try {
    const response = await callMCPTool<MCPToolResponse>(
      GITHUB_MCP_ID,
      'GITHUB_GET_A_REFERENCE',
      {
        owner,
        repo,
        ref: `heads/${branch}`,
      }
    );

    const data = parseMCPResponse<{ successful: boolean; data?: { object: { sha: string } } }>(response);
    return data.successful && data.data ? data.data.object.sha : null;
  } catch (error) {
    console.error('Failed to get latest commit SHA:', error);
    return null;
  }
}

/**
 * Upload multiple files to a repository in a single commit
 * This is the main function for pushing changes
 */
export async function pushFiles(
  owner: string,
  repo: string,
  files: FileToUpload[],
  commitMessage: string,
  branch: string = 'main',
  author?: { name: string; email: string }
): Promise<{ successful: boolean; commitUrl?: string; error?: string }> {
  try {
    // 1. Get the latest commit SHA for the branch
    const latestCommitSha = await getLatestCommitSha(owner, repo, branch);

    if (!latestCommitSha) {
      // If no commit exists, this might be a fresh repo - we'll create without parent
      console.log('No existing commits found, creating initial commit');
    }

    // 2. Create blobs for each file
    const treeEntries: GitHubTreeEntry[] = [];

    for (const file of files) {
      const blobResponse = await createBlob({
        owner,
        repo,
        content: file.content,
        encoding: file.encoding || 'utf-8',
      });

      if (!blobResponse.successful || !blobResponse.data) {
        throw new Error(`Failed to create blob for ${file.path}: ${blobResponse.error}`);
      }

      treeEntries.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blobResponse.data.sha,
      });
    }

    // 3. Create a tree with all the files
    const treeResponse = await createTree({
      owner,
      repo,
      base_tree: latestCommitSha || undefined,
      tree: treeEntries,
    });

    if (!treeResponse.successful || !treeResponse.data) {
      throw new Error(`Failed to create tree: ${treeResponse.error}`);
    }

    // 4. Create a commit
    const commitResponse = await createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: treeResponse.data.sha,
      parents: latestCommitSha ? [latestCommitSha] : [],
      author: author || {
        name: 'Vinculo.io Bot',
        email: 'bot@vinculobrasil.com.br',
      },
    });

    if (!commitResponse.successful || !commitResponse.data) {
      throw new Error(`Failed to create commit: ${commitResponse.error}`);
    }

    // 5. Update the branch reference to point to the new commit
    const refResponse = await updateReference({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: commitResponse.data.sha,
      force: false,
    });

    if (!refResponse.successful) {
      // Try creating the reference if it doesn't exist
      const createRefResponse = await createReference({
        owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: commitResponse.data.sha,
      });

      if (!createRefResponse.successful) {
        throw new Error(`Failed to update/create reference: ${refResponse.error}`);
      }
    }

    return {
      successful: true,
      commitUrl: commitResponse.data.html_url,
    };
  } catch (error) {
    console.error('Failed to push files:', error);
    return {
      successful: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a new repository and push initial files
 * This is the complete flow for setting up a new GitHub repo
 */
export async function createRepoAndPush(
  repoName: string,
  files: FileToUpload[],
  options: {
    description?: string;
    private?: boolean;
    commitMessage?: string;
    author?: { name: string; email: string };
  } = {}
): Promise<{
  successful: boolean;
  repoUrl?: string;
  commitUrl?: string;
  error?: string;
}> {
  try {
    // 1. Create the repository
    const repoResponse = await createRepository({
      name: repoName,
      description: options.description || 'Created by Vinculo.io',
      private: options.private ?? false,
      auto_init: true, // Create with initial commit to have a branch
    });

    if (!repoResponse.successful || !repoResponse.data) {
      throw new Error(`Failed to create repository: ${repoResponse.error}`);
    }

    const owner = repoResponse.data.owner.login;
    const repo = repoResponse.data.name;

    // Wait a moment for GitHub to process the repo creation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Push the files
    const pushResponse = await pushFiles(
      owner,
      repo,
      files,
      options.commitMessage || 'feat: Initial commit from Vinculo.io Platform\n\n🤖 Generated with Vinculo.io',
      'main',
      options.author
    );

    if (!pushResponse.successful) {
      throw new Error(`Failed to push files: ${pushResponse.error}`);
    }

    return {
      successful: true,
      repoUrl: repoResponse.data.html_url,
      commitUrl: pushResponse.commitUrl,
    };
  } catch (error) {
    console.error('Failed to create repo and push:', error);
    return {
      successful: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if the GitHub MCP is authenticated and working
 */
export async function checkGitHubConnection(): Promise<{
  connected: boolean;
  username?: string;
  error?: string;
}> {
  try {
    const response = await callMCPTool<MCPToolResponse>(
      GITHUB_MCP_ID,
      'GITHUB_GET_THE_AUTHENTICATED_USER',
      {}
    );

    const data = parseMCPResponse<{
      successful: boolean;
      data?: { login: string; name: string };
      error?: string;
    }>(response);

    if (data.successful && data.data) {
      return {
        connected: true,
        username: data.data.login,
      };
    }

    return {
      connected: false,
      error: data.error || 'Failed to authenticate',
    };
  } catch (error) {
    console.error('Failed to check GitHub connection:', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
