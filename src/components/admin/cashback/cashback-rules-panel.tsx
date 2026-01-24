// =============================================================================
// CashbackRulesPanel - Gerenciamento de Regras de Cashback
// =============================================================================

import * as React from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Users,
  Building,
  UserCheck,
  ShoppingBag,
  Shield,
  Wallet,
  Gift,
  Star,
  Percent,
  Coins,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  type CashbackRule,
  type CashbackCategory,
  CASHBACK_CATEGORY_LABELS,
  MOCK_CASHBACK_RULES,
  USER_ROLE_LABELS,
} from '@/lib/cashback-admin-types';
import { CASHBACK_TYPE_LABELS } from '@/lib/tokenomics-types';

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function CashbackRulesPanel() {
  const [rules, setRules] = React.useState<CashbackRule[]>(MOCK_CASHBACK_RULES);
  const [expandedCategories, setExpandedCategories] = React.useState<Set<CashbackCategory>>(
    new Set(['tenant', 'landlord', 'guarantor'])
  );

  const toggleCategory = (category: CashbackCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleRule = (ruleId: string) => {
    setRules((prev) => prev.map((rule) => (rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule)));
  };

  // Agrupar regras por categoria
  const rulesByCategory = React.useMemo(() => {
    const grouped: Record<CashbackCategory, CashbackRule[]> = {
      tenant: [],
      landlord: [],
      guarantor: [],
      marketplace: [],
      insurance: [],
      financial: [],
      referral: [],
      loyalty: [],
      promotional: [],
    };

    rules.forEach((rule) => {
      grouped[rule.category].push(rule);
    });

    return grouped;
  }, [rules]);

  const categoryIcons: Record<CashbackCategory, React.ElementType> = {
    tenant: Users,
    landlord: Building,
    guarantor: UserCheck,
    marketplace: ShoppingBag,
    insurance: Shield,
    financial: Wallet,
    referral: Gift,
    loyalty: Star,
    promotional: Gift,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Regras de Cashback</h2>
          <p className="text-sm text-muted-foreground">
            Configure as regras de distribuição de VBRz para cada tipo de operação
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Regra
        </Button>
      </div>

      {/* Lista por Categoria */}
      <div className="space-y-3">
        {Object.entries(rulesByCategory).map(([category, categoryRules]) => {
          if (categoryRules.length === 0) return null;

          const Icon = categoryIcons[category as CashbackCategory];
          const isExpanded = expandedCategories.has(category as CashbackCategory);
          const activeCount = categoryRules.filter((r) => r.isActive).length;

          return (
            <Collapsible key={category} open={isExpanded} onOpenChange={() => toggleCategory(category as CashbackCategory)}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {CASHBACK_CATEGORY_LABELS[category as CashbackCategory]}
                          </CardTitle>
                          <CardDescription>
                            {categoryRules.length} regras • {activeCount} ativas
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={activeCount === categoryRules.length ? 'default' : 'secondary'}>
                        {activeCount}/{categoryRules.length}
                      </Badge>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {categoryRules.map((rule) => (
                        <RuleCard key={rule.id} rule={rule} onToggle={() => toggleRule(rule.id)} />
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENTE DE REGRA
// =============================================================================

interface RuleCardProps {
  rule: CashbackRule;
  onToggle: () => void;
}

function RuleCard({ rule, onToggle }: RuleCardProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 ${rule.isActive ? 'bg-background' : 'bg-muted/50 opacity-60'}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          {rule.calculationType === 'percentage' ? (
            <Percent className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Coins className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{rule.name}</span>
            <Badge variant="outline" className="text-xs">
              {CASHBACK_TYPE_LABELS[rule.type]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{rule.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {rule.calculationType === 'percentage' ? (
                <>
                  <Percent className="h-3 w-3" />
                  {(rule.rate * 100).toFixed(1)}%
                </>
              ) : (
                <>
                  <Coins className="h-3 w-3" />
                  {rule.rate} VBRz
                </>
              )}
            </span>
            <span>•</span>
            <span>Beneficiário: {USER_ROLE_LABELS[rule.beneficiary]}</span>
            {rule.applyLoyaltyMultiplier && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  Multiplicador de fidelidade
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={rule.isActive} onCheckedChange={onToggle} />
        <Button variant="ghost" size="icon">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default CashbackRulesPanel;
