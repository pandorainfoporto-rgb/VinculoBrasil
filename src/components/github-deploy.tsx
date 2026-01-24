/**
 * GitHub Deploy Component
 *
 * Provides UI for:
 * - Checking GitHub connection status
 * - Creating repositories
 * - Deploying code to GitHub
 */

import { useState, useEffect } from 'react';
import { useGitHubSync, type FileToUpload } from '@/hooks/use-github-sync';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Github,
  CheckCircle2,
  XCircle,
  Loader2,
  CloudUpload,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  FolderGit2,
} from 'lucide-react';

interface GitHubDeployProps {
  defaultRepoName?: string;
  onDeploySuccess?: (repoUrl: string, commitUrl?: string) => void;
  onDeployError?: (error: string) => void;
}

export function GitHubDeploy({
  defaultRepoName = 'vinculo-io-platform',
  onDeploySuccess,
  onDeployError,
}: GitHubDeployProps) {
  const {
    isConnected,
    isLoading,
    username,
    error,
    repoUrl,
    lastSync,
    checkConnection,
    createRepo,
    syncFiles,
  } = useGitHubSync();

  const [repoName, setRepoName] = useState(defaultRepoName);
  const [repoDescription, setRepoDescription] = useState(
    'Sistema de garantia locatícia tokenizada - Vinculo.io'
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [deployStatus, setDeployStatus] = useState<'idle' | 'creating' | 'pushing' | 'success' | 'error'>('idle');

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const handleCheckConnection = async () => {
    await checkConnection();
  };

  const handleCreateRepo = async () => {
    setDeployStatus('creating');

    const result = await createRepo(repoName, repoDescription, isPrivate);

    if (result.successful && result.repoUrl) {
      setDeployStatus('success');
      onDeploySuccess?.(result.repoUrl);
    } else {
      setDeployStatus('error');
      onDeployError?.(result.error || 'Failed to create repository');
    }
  };

  const handleDeploy = async () => {
    if (!username) {
      onDeployError?.('Not connected to GitHub');
      return;
    }

    setDeployStatus('pushing');

    // For demo, we'll push a simple file
    // In production, this would collect all project files
    const files: FileToUpload[] = [
      {
        path: 'README.md',
        content: `# ${repoName}

${repoDescription}

## About

This repository was automatically created and deployed from the Vinculo.io platform.

## Features

- 🏠 Tokenized rental guarantees
- 🔗 Blockchain integration (Polygon)
- 📊 Administrative dashboard
- 💳 Payment processing with Asaas
- 📄 Digital signatures with ZapSign
- 🔐 KYC verification

## Technology Stack

- React 19 + TypeScript
- TanStack Router & Query
- Tailwind CSS v4
- shadcn/ui components
- Solidity Smart Contracts

## Deployed at

${new Date().toISOString()}

---

🤖 Generated with [Vinculo Brasil](https://vinculobrasil.com.br)
`,
      },
    ];

    const message = commitMessage || `deploy: Auto-deploy from Vinculo Brasil Platform

${new Date().toISOString()}

🤖 Generated with Vinculo Brasil`;

    const result = await syncFiles(files, message);

    if (result.successful) {
      setDeployStatus('success');
      onDeploySuccess?.(repoUrl || '', result.commitUrl);
    } else {
      setDeployStatus('error');
      onDeployError?.(result.error || 'Failed to deploy');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-6 w-6" />
            <CardTitle>GitHub Deploy</CardTitle>
          </div>
          {isConnected ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="mr-1 h-3 w-3" />
              Desconectado
            </Badge>
          )}
        </div>
        <CardDescription>
          Crie repositórios e faça deploy automático do código para o GitHub
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : isConnected ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <div>
              <p className="font-medium">
                {isConnected ? `Conectado como @${username}` : 'Não conectado ao GitHub'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isConnected
                  ? 'Pronto para criar repositórios e fazer deploy'
                  : 'Configure a integração GitHub nas configurações da plataforma'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleCheckConnection} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Verificar
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {repoUrl && deployStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Deploy realizado com sucesso!</AlertTitle>
            <AlertDescription>
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium underline"
              >
                Ver repositório no GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Repository Configuration */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 font-medium">
            <FolderGit2 className="h-4 w-4" />
            Configuração do Repositório
          </h3>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="repoName">Nome do Repositório</Label>
              <Input
                id="repoName"
                value={repoName}
                onChange={e => setRepoName(e.target.value)}
                placeholder="meu-projeto"
                disabled={!isConnected || isLoading}
              />
              {username && repoName && (
                <p className="text-sm text-muted-foreground">
                  URL: github.com/{username}/{repoName}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="repoDescription">Descrição</Label>
              <Input
                id="repoDescription"
                value={repoDescription}
                onChange={e => setRepoDescription(e.target.value)}
                placeholder="Descrição do projeto"
                disabled={!isConnected || isLoading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrivate"
                checked={isPrivate}
                onCheckedChange={(checked: boolean) => setIsPrivate(checked)}
                disabled={!isConnected || isLoading}
              />
              <Label htmlFor="isPrivate" className="text-sm font-normal">
                Repositório privado
              </Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Commit Message */}
        <div className="grid gap-2">
          <Label htmlFor="commitMessage">Mensagem do Commit (opcional)</Label>
          <Input
            id="commitMessage"
            value={commitMessage}
            onChange={e => setCommitMessage(e.target.value)}
            placeholder="feat: Deploy automático do Vinculo.io"
            disabled={!isConnected || isLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleCreateRepo}
            disabled={!isConnected || isLoading || !repoName}
            className="flex-1"
            variant="outline"
          >
            {deployStatus === 'creating' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FolderGit2 className="mr-2 h-4 w-4" />
            )}
            Criar Repositório
          </Button>

          <Button
            onClick={handleDeploy}
            disabled={!isConnected || isLoading || !repoUrl}
            className="flex-1"
          >
            {deployStatus === 'pushing' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CloudUpload className="mr-2 h-4 w-4" />
            )}
            Fazer Deploy
          </Button>
        </div>

        {/* Last Sync Info */}
        {lastSync && (
          <p className="text-center text-sm text-muted-foreground">
            Último sync: {lastSync.toLocaleString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default GitHubDeploy;
