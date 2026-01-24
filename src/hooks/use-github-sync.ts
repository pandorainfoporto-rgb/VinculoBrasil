/**
 * GitHub Sync Hook
 *
 * Provides React hooks for GitHub integration:
 * - Check connection status
 * - Create repositories
 * - Push changes
 * - Auto-sync functionality
 */

import { useState, useCallback, useEffect } from 'react';
import {
  checkGitHubConnection,
  createRepository,
  pushFiles,
  createRepoAndPush,
  getRepository,
  type GitHubRepoCreateParams,
  type FileToUpload,
} from '@/lib/github-service';

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  autoSync: boolean;
  syncInterval: number; // in milliseconds
}

export interface GitHubSyncState {
  isConnected: boolean;
  isLoading: boolean;
  username: string | null;
  lastSync: Date | null;
  error: string | null;
  repoUrl: string | null;
}

const DEFAULT_CONFIG: GitHubConfig = {
  owner: '',
  repo: 'vinculo-io-platform',
  branch: 'main',
  autoSync: false,
  syncInterval: 60000, // 1 minute
};

/**
 * Hook to check GitHub connection status
 */
export function useGitHubConnection() {
  const [state, setState] = useState<{
    isConnected: boolean;
    isLoading: boolean;
    username: string | null;
    error: string | null;
  }>({
    isConnected: false,
    isLoading: false,
    username: null,
    error: null,
  });

  const checkConnection = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await checkGitHubConnection();

      setState({
        isConnected: result.connected,
        isLoading: false,
        username: result.username || null,
        error: result.error || null,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        isConnected: false,
        isLoading: false,
        username: null,
        error: errorMessage,
      });

      return { connected: false, error: errorMessage };
    }
  }, []);

  return {
    ...state,
    checkConnection,
  };
}

/**
 * Hook to create a new GitHub repository
 */
export function useCreateRepository() {
  const [state, setState] = useState<{
    isLoading: boolean;
    repoUrl: string | null;
    error: string | null;
  }>({
    isLoading: false,
    repoUrl: null,
    error: null,
  });

  const create = useCallback(async (params: GitHubRepoCreateParams) => {
    setState({ isLoading: true, repoUrl: null, error: null });

    try {
      const result = await createRepository(params);

      if (result.successful && result.data) {
        setState({
          isLoading: false,
          repoUrl: result.data.html_url,
          error: null,
        });
        return { successful: true, repoUrl: result.data.html_url };
      } else {
        setState({
          isLoading: false,
          repoUrl: null,
          error: result.error || 'Failed to create repository',
        });
        return { successful: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({
        isLoading: false,
        repoUrl: null,
        error: errorMessage,
      });
      return { successful: false, error: errorMessage };
    }
  }, []);

  return {
    ...state,
    createRepository: create,
  };
}

/**
 * Hook to push files to a GitHub repository
 */
export function usePushToGitHub() {
  const [state, setState] = useState<{
    isLoading: boolean;
    commitUrl: string | null;
    error: string | null;
  }>({
    isLoading: false,
    commitUrl: null,
    error: null,
  });

  const push = useCallback(
    async (
      owner: string,
      repo: string,
      files: FileToUpload[],
      commitMessage: string,
      branch: string = 'main'
    ) => {
      setState({ isLoading: true, commitUrl: null, error: null });

      try {
        const result = await pushFiles(owner, repo, files, commitMessage, branch);

        if (result.successful) {
          setState({
            isLoading: false,
            commitUrl: result.commitUrl || null,
            error: null,
          });
          return { successful: true, commitUrl: result.commitUrl };
        } else {
          setState({
            isLoading: false,
            commitUrl: null,
            error: result.error || 'Failed to push files',
          });
          return { successful: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({
          isLoading: false,
          commitUrl: null,
          error: errorMessage,
        });
        return { successful: false, error: errorMessage };
      }
    },
    []
  );

  return {
    ...state,
    pushFiles: push,
  };
}

/**
 * Main hook for GitHub sync functionality
 * Combines connection checking, repo creation, and file pushing
 */
export function useGitHubSync(initialConfig?: Partial<GitHubConfig>) {
  const [config, setConfig] = useState<GitHubConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  const [state, setState] = useState<GitHubSyncState>({
    isConnected: false,
    isLoading: false,
    username: null,
    lastSync: null,
    error: null,
    repoUrl: null,
  });

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await checkGitHubConnection();

      setState(prev => ({
        ...prev,
        isConnected: result.connected,
        isLoading: false,
        username: result.username || null,
        error: result.error || null,
      }));

      // Update config with username as owner if connected
      if (result.connected && result.username) {
        setConfig(prev => ({
          ...prev,
          owner: result.username || prev.owner,
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        error: errorMessage,
      }));

      return { connected: false, error: errorMessage };
    }
  }, []);

  const createRepo = useCallback(
    async (name?: string, description?: string, isPrivate?: boolean) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await createRepository({
          name: name || config.repo,
          description: description || 'Vinculo.io Platform - Sistema de garantia locatícia tokenizada',
          private: isPrivate ?? false,
          has_issues: true,
          has_projects: true,
          has_wiki: true,
        });

        if (result.successful && result.data) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            repoUrl: result.data?.html_url || null,
            error: null,
          }));

          setConfig(prev => ({
            ...prev,
            owner: result.data?.owner.login || prev.owner,
            repo: result.data?.name || prev.repo,
          }));

          return { successful: true, repoUrl: result.data.html_url };
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: result.error || 'Failed to create repository',
          }));

          return { successful: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return { successful: false, error: errorMessage };
      }
    },
    [config.repo]
  );

  const syncFiles = useCallback(
    async (files: FileToUpload[], commitMessage: string) => {
      if (!config.owner || !config.repo) {
        return { successful: false, error: 'Repository not configured' };
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await pushFiles(
          config.owner,
          config.repo,
          files,
          commitMessage,
          config.branch
        );

        if (result.successful) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            lastSync: new Date(),
            error: null,
          }));

          return { successful: true, commitUrl: result.commitUrl };
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: result.error || 'Failed to sync files',
          }));

          return { successful: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return { successful: false, error: errorMessage };
      }
    },
    [config.owner, config.repo, config.branch]
  );

  const createAndSync = useCallback(
    async (
      repoName: string,
      files: FileToUpload[],
      options?: {
        description?: string;
        private?: boolean;
        commitMessage?: string;
      }
    ) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await createRepoAndPush(repoName, files, options);

        if (result.successful) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            repoUrl: result.repoUrl || null,
            lastSync: new Date(),
            error: null,
          }));

          return {
            successful: true,
            repoUrl: result.repoUrl,
            commitUrl: result.commitUrl,
          };
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: result.error || 'Failed to create and sync',
          }));

          return { successful: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return { successful: false, error: errorMessage };
      }
    },
    []
  );

  const updateConfig = useCallback((newConfig: Partial<GitHubConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  return {
    // State
    ...state,
    config,

    // Actions
    checkConnection,
    createRepo,
    syncFiles,
    createAndSync,
    updateConfig,
  };
}

export type { FileToUpload, GitHubRepoCreateParams };
