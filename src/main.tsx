import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { CryptoWalletsProvider } from "./contexts/crypto-wallets-context";
import { ThemeProvider } from "./hooks/use-theme";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import reportWebVitals from "./sdk/core/internal/reportWebVitals.ts";
import "./styles.css";

// Initialize Creao platform SDK
import { APP_CONFIG } from "./sdk/core/global.ts";
export { APP_CONFIG }; // for backward compatibility

// Whitelabel site component
import { AgencyPublicSite } from "./components/sites/AgencyPublicSite";

// ============================================
// SUBDOMAIN DETECTION FOR WHITELABEL
// ============================================
function getAgencySlugFromSubdomain(): string | null {
	const hostname = window.location.hostname;

	// Lista de hosts que NÃO são subdomínios de agência
	const mainHosts = [
		'localhost',
		'vinculobrasil.com.br',
		'www.vinculobrasil.com.br',
		'app.vinculobrasil.com.br',
		'admin.vinculobrasil.com.br',
		'vinculobrasil-production.up.railway.app',
	];

	// Se for um host principal, retorna null (renderiza app normal)
	if (mainHosts.some(host => hostname === host || hostname.endsWith(`.${host}`))) {
		// Verificar se é um subdomínio válido (não www, app, admin)
		if (hostname.endsWith('.vinculobrasil.com.br')) {
			const subdomain = hostname.replace('.vinculobrasil.com.br', '');
			const reservedSubdomains = ['www', 'app', 'admin', 'api', 'staging', 'dev'];

			if (!reservedSubdomains.includes(subdomain) && subdomain.length > 0) {
				console.log(`🌐 [WHITELABEL] Subdomínio detectado: ${subdomain}`);
				return subdomain;
			}
		}
		return null;
	}

	// Para localhost com porta, verifica query param ?agency=slug
	if (hostname === 'localhost' || hostname === '127.0.0.1') {
		const urlParams = new URLSearchParams(window.location.search);
		const agencyParam = urlParams.get('agency');
		if (agencyParam) {
			console.log(`🌐 [WHITELABEL DEV] Agency via param: ${agencyParam}`);
			return agencyParam;
		}
	}

	// Para outros domínios (ex: fatto-imoveis.com.br apontando via CNAME)
	// Pode ser implementado no futuro com lookup de domínio customizado

	return null;
}

// Detectar slug da agência
const agencySlug = getAgencySlugFromSubdomain();

// Create a QueryClient instance
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

// Create a new router instance
const router = createRouter({
	routeTree,
	context: {},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
	basepath: import.meta.env.TENANT_ID ? `/${import.meta.env.TENANT_ID}` : "/",
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);

	// Se for um subdomínio de agência, renderiza o site público
	if (agencySlug) {
		console.log(`🏢 [WHITELABEL] Renderizando site da agência: ${agencySlug}`);
		root.render(
			<StrictMode>
				<ThemeProvider>
					<QueryClientProvider client={queryClient}>
						<AgencyPublicSite slug={agencySlug} />
					</QueryClientProvider>
				</ThemeProvider>
			</StrictMode>,
		);
	} else {
		// Renderiza o app principal (admin/dashboard)
		root.render(
			<StrictMode>
				<ThemeProvider>
					<QueryClientProvider client={queryClient}>
						<CryptoWalletsProvider>
							<RouterProvider router={router} />
						</CryptoWalletsProvider>
					</QueryClientProvider>
				</ThemeProvider>
			</StrictMode>,
		);
	}
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
