import { createFileRoute } from '@tanstack/react-router';
import { GitHubDeploy } from '@/components/github-deploy';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Github,
  Info,
  Settings,
  CloudUpload,
  History,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const Route = createFileRoute('/admin/github')({
  component: GitHubAdminPage,
});

function GitHubAdminPage() {
  return (
    <AdminLayout userName="Administrador">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Github className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Integração GitHub</h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie a integração com GitHub para versionamento automático do código
          </p>
        </div>

        <Tabs defaultValue="deploy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="deploy" className="flex items-center gap-2">
            <CloudUpload className="h-4 w-4" />
            Deploy
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <GitHubDeploy
              defaultRepoName="vinculo-io-platform"
              onDeploySuccess={(repoUrl, commitUrl) => {
                console.log('Deploy success:', { repoUrl, commitUrl });
              }}
              onDeployError={(error) => {
                console.error('Deploy error:', error);
              }}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Como Funciona
                </CardTitle>
                <CardDescription>
                  Entenda o processo de deploy automático
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <div>
                      <p className="font-medium">Conexão</p>
                      <p className="text-sm text-muted-foreground">
                        A plataforma se conecta à sua conta GitHub via OAuth
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <div>
                      <p className="font-medium">Criar Repositório</p>
                      <p className="text-sm text-muted-foreground">
                        Um novo repositório é criado na sua conta
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <div>
                      <p className="font-medium">Push Automático</p>
                      <p className="text-sm text-muted-foreground">
                        Os arquivos são enviados via Git Data API
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">4</Badge>
                    <div>
                      <p className="font-medium">Sincronização</p>
                      <p className="text-sm text-muted-foreground">
                        Alterações futuras podem ser sincronizadas automaticamente
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Dica</AlertTitle>
                  <AlertDescription>
                    A integração GitHub usa a API Git Data para criar blobs, árvores e commits
                    diretamente, sem precisar de git instalado localmente.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Sincronização</CardTitle>
              <CardDescription>
                Configure o comportamento da sincronização automática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Em Desenvolvimento</AlertTitle>
                <AlertDescription>
                  As configurações avançadas de sincronização automática serão
                  disponibilizadas em uma próxima atualização.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Auto-sync</p>
                    <p className="text-sm text-muted-foreground">
                      Sincronizar automaticamente a cada alteração
                    </p>
                  </div>
                  <Badge variant="secondary">Em breve</Badge>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Webhooks</p>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações de eventos do repositório
                    </p>
                  </div>
                  <Badge variant="secondary">Em breve</Badge>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Branch Protection</p>
                    <p className="text-sm text-muted-foreground">
                      Configurar proteção de branch automaticamente
                    </p>
                  </div>
                  <Badge variant="secondary">Em breve</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Deploys</CardTitle>
              <CardDescription>
                Visualize os deploys realizados recentemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Demo history entries */}
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Deploy inicial</p>
                      <p className="text-sm text-muted-foreground">
                        feat: Initial commit - Vinculo.io Platform
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Agora</span>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground py-4">
                  O histórico completo será exibido após realizar deploys
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}
