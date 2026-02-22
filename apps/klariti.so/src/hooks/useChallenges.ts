import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllChallenges,
  getMyChallenges,
  getMyCreatedChallenges,
  getChallenge,
  createChallenge,
  updateChallenge,
  joinChallenge,
  toggleChallengeStatus,
  updateParticipationState,
  CreateChallengeData,
  UpdateChallengeData,
  ParticipationStateUpdate,
  Challenge,
} from "@/services/challenges";

// Query Keys
export const challengeKeys = {
  all: ["challenges"] as const,
  lists: () => [...challengeKeys.all, "list"] as const,
  list: (activeOnly: boolean, skip: number, limit: number) =>
    [...challengeKeys.lists(), { activeOnly, skip, limit }] as const,
  myChallenges: (skip: number, limit: number) =>
    [...challengeKeys.all, "my", { skip, limit }] as const,
  myCreated: (skip: number, limit: number) =>
    [...challengeKeys.all, "created", { skip, limit }] as const,
  details: () => [...challengeKeys.all, "detail"] as const,
  detail: (id: number) => [...challengeKeys.details(), id] as const,
};

// Hooks

export const useChallenges = (
  activeOnly: boolean = false,
  skip: number = 0,
  limit: number = 100
) => {
  return useQuery({
    queryKey: challengeKeys.list(activeOnly, skip, limit),
    queryFn: () => getAllChallenges(skip, limit, activeOnly),
  });
};

export const useMyChallenges = (skip: number = 0, limit: number = 100) => {
  return useQuery({
    queryKey: challengeKeys.myChallenges(skip, limit),
    queryFn: () => getMyChallenges(skip, limit),
  });
};

export const useMyCreatedChallenges = (
  skip: number = 0,
  limit: number = 100
) => {
  return useQuery({
    queryKey: challengeKeys.myCreated(skip, limit),
    queryFn: () => getMyCreatedChallenges(skip, limit),
  });
};

export const useChallenge = (id: number) => {
  return useQuery({
    queryKey: challengeKeys.detail(id),
    queryFn: () => getChallenge(id),
    enabled: !!id,
  });
};

export const useCreateChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChallengeData) => createChallenge(data),
    onSuccess: (newChallenge) => {
      // Optimistically add to lists
      queryClient.setQueryData(
        challengeKeys.list(false, 0, 100),
        (old: Challenge[] | undefined) => (old ? [newChallenge, ...old] : [newChallenge])
      );
      queryClient.setQueryData(
        challengeKeys.myCreated(0, 100),
        (old: Challenge[] | undefined) => (old ? [newChallenge, ...old] : [newChallenge])
      );
    },
  });
};

export const useUpdateChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateChallengeData;
    }) => updateChallenge(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: challengeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: challengeKeys.myCreated(0, 100) }); // Simplified invalidation
    },
  });
};

export const useJoinChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => joinChallenge(id),
    onMutate: async (challengeId) => {
      // Create a snapshot of the previous 'my challenges' state
      await queryClient.cancelQueries({ queryKey: challengeKeys.myChallenges(0, 100) });
      const previousMyChallenges = queryClient.getQueryData<Challenge[]>(challengeKeys.myChallenges(0, 100));

      // Try to find the challenge in 'all challenges' to optimistically add it
      const allChallenges = queryClient.getQueryData<Challenge[]>(challengeKeys.list(false, 0, 100));
      const toAdd = allChallenges?.find(c => c.id === challengeId);

      if (toAdd) {
        queryClient.setQueryData<Challenge[]>(challengeKeys.myChallenges(0, 100), (old) => {
           return old ? [toAdd, ...old] : [toAdd];
        });
      }

      return { previousMyChallenges };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(challengeKeys.myChallenges(0, 100), context?.previousMyChallenges);
    },
    onSuccess: (data, id) => {
       // On success, we have the fresh challenge data (including participation details ideally, 
       // but strictly dependent on API response).
       // We update the detail cache and ensure the list has the correct object
       queryClient.setQueryData(challengeKeys.detail(id), data);
       
       queryClient.setQueryData<Challenge[]>(challengeKeys.myChallenges(0, 100), (old) => {
         if (!old) return [data];
         // Replace the optimistic one (or just add if not there) with real data
         return old.map(c => c.id === id ? data : c);
       });
       
       // Also update 'all' list if it's there
       queryClient.setQueryData<Challenge[]>(challengeKeys.list(false, 0, 100), (old) => {
         if (!old) return old;
         return old.map(c => c.id === id ? data : c);
       });
    },
  });
};

export const useToggleChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toggleChallengeStatus(id),
    onSuccess: (data, id) => {
      // Update the detail view
      queryClient.setQueryData(challengeKeys.detail(id), data);

      // Helper to update lists
      const updateList = (queryKey: any) => {
        queryClient.setQueryData<Challenge[]>(queryKey, (old) => {
          if (!old) return old;
          return old.map(c => c.id === id ? data : c);
        });
      };

      updateList(challengeKeys.list(false, 0, 100));
      updateList(challengeKeys.myChallenges(0, 100));
      updateList(challengeKeys.myCreated(0, 100));
    },
  });
};

export const useUpdateParticipation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: ParticipationStateUpdate;
    }) => updateParticipationState(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: challengeKeys.detail(variables.id) });
    },
  });
};
