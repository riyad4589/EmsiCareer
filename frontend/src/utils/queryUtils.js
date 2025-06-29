import { useQueryClient } from "@tanstack/react-query";

// Fonction pour invalider toutes les requêtes liées aux connexions
export const invalidateConnectionQueries = (queryClient) => {
	queryClient.invalidateQueries(["connections"]);
	queryClient.invalidateQueries(["suggestions"]);
	queryClient.invalidateQueries(["connectionRequests"]);
	queryClient.invalidateQueries(["connectionStatus"]);
	queryClient.invalidateQueries(["userConnections"]);
	queryClient.invalidateQueries(["authUser"]);
};

// Hook personnalisé pour invalider les requêtes de connexion
export const useInvalidateConnections = () => {
	const queryClient = useQueryClient();
	
	return () => {
		invalidateConnectionQueries(queryClient);
	};
}; 