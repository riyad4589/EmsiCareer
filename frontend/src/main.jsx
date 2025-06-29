import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

console.log("Initialisation de l'application...");

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			refetchOnWindowFocus: false,
		},
	},
});

const rootElement = document.getElementById("root");
console.log("Élément root trouvé:", rootElement);

if (!rootElement) {
	console.error("L'élément root n'a pas été trouvé!");
} else {
	const root = createRoot(rootElement);
	console.log("Root créé avec succès");

	root.render(
		<StrictMode>
			<BrowserRouter basename="/">
				<QueryClientProvider client={queryClient}>
					<App />
				</QueryClientProvider>
			</BrowserRouter>
		</StrictMode>
	);
	console.log("Application rendue");
}
