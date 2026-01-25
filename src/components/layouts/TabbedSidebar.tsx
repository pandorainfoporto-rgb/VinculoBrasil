import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { SidebarTab, TabbedMenuItem } from "../../config/menus";

// ============================================
// TIPOS
// ============================================
interface TabbedSidebarProps {
  tabs: SidebarTab[];
  onItemClick?: () => void;
}

// ============================================
// COLLAPSIBLE MENU ITEM
// ============================================
function CollapsibleMenuItem({
  item,
  isActive,
  onItemClick,
}: {
  item: TabbedMenuItem;
  isActive: (path: string) => boolean;
  onItemClick?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(() => {
    // Auto-open if any child is active
    if (item.children) {
      return item.children.some((child) => child.path && isActive(child.path));
    }
    return false;
  });

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <item.icon size={18} className="text-gray-500 dark:text-gray-500" />
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        {isOpen ? (
          <ChevronDown size={16} className="text-gray-400" />
        ) : (
          <ChevronRight size={16} className="text-gray-400" />
        )}
      </button>

      {/* Children */}
      {isOpen && item.children && (
        <div className="ml-4 pl-3 border-l-2 border-gray-100 dark:border-gray-800 space-y-0.5">
          {item.children.map((child) => (
            <MenuItemLink
              key={child.path}
              item={child}
              isActive={isActive}
              onItemClick={onItemClick}
              isNested
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// MENU ITEM LINK
// ============================================
function MenuItemLink({
  item,
  isActive,
  onItemClick,
  isNested = false,
}: {
  item: TabbedMenuItem;
  isActive: (path: string) => boolean;
  onItemClick?: () => void;
  isNested?: boolean;
}) {
  if (!item.path) return null;

  const active = isActive(item.path);

  return (
    <Link
      to={item.path}
      onClick={onItemClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
        active
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
      }`}
    >
      <item.icon
        size={isNested ? 16 : 18}
        className={active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"}
      />
      <span className={`text-sm ${isNested ? "" : "font-medium"}`}>{item.label}</span>
    </Link>
  );
}

// ============================================
// TABBED SIDEBAR COMPONENT
// ============================================
export function TabbedSidebar({ tabs, onItemClick }: TabbedSidebarProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "principal");

  const isActive = (path: string) => location.pathname === path;

  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col h-full">
      {/* Tab Icons */}
      <div className="flex items-center justify-center gap-1 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative p-2.5 rounded-lg transition-all duration-200 group ${
              activeTab === tab.id
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            title={tab.label}
          >
            <tab.icon size={20} />

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {tab.label}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
            </div>
          </button>
        ))}
      </div>

      {/* Tab Label */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {currentTab?.label}
        </h3>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {currentTab?.items.map((item, index) => {
          if (item.isCollapsible && item.children) {
            return (
              <CollapsibleMenuItem
                key={`${item.label}-${index}`}
                item={item}
                isActive={isActive}
                onItemClick={onItemClick}
              />
            );
          }

          return (
            <MenuItemLink
              key={item.path || `${item.label}-${index}`}
              item={item}
              isActive={isActive}
              onItemClick={onItemClick}
            />
          );
        })}
      </nav>
    </div>
  );
}
